import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import { logger } from "firebase-functions";
import {
  Collection,
  Trait,
  TraitValue,
  ImageLayer,
  OrderedImageLayer,
  TraitValuePair,
  ImageComposite,
  Conflict,
  ConflictResolutionType,
} from "../models/models";

const path = require("path");
const os = require("os");
const fs = require("fs");
const tempDir = os.tmpdir();

const admin = require("firebase-admin");

const TRAITVALUES_RARITY_MAX_PRECISION: number = 4;

export class ArtworkGenerator {
  projectId: string;
  collectionId: string;
  compositeGroupId: string;
  batchNum: number;
  batchSize: number;

  db = admin.firestore();
  storage = admin.storage();

  constructor(
    projectId: string,
    collectionId: string,
    compositeGroupId: string,
    batchNum: number,
    batchSize: number
  ) {
    this.projectId = projectId;
    this.collectionId = collectionId;
    this.compositeGroupId = compositeGroupId;
    this.batchNum = batchNum;
    this.batchSize = batchSize;
  }

  async generate(): Promise<(ImageComposite | null)[]> {
    logger.info(
      "Generate Artwork for project: " +
        this.projectId +
        " collection: " +
        this.collectionId
    );

    // fetch the specified collection / trait
    const result = await Promise.all([
      this.fetchCollection(),
      this.fetchTraits(),
      this.fetchArtwork(),
      this.fetchConflicts(),
    ]);

    const collection = result[0];
    const traits = result[1];
    const imageLayers = result[2];
    const conflicts = result[3];

    const traitValueIdToImageLayers: { [traitValueId: string]: ImageLayer } =
      {};
    imageLayers.forEach((imageLayer) => {
      if (imageLayer.traitValueId) {
        traitValueIdToImageLayers[imageLayer.traitValueId] = imageLayer;
      }
    });

    let traitValues: { [traitId: string]: TraitValue[] } = {};

    // prefetch all trait values
    for (let i = 0; i < traits.length; i++) {
      const trait = traits[i];
      traitValues[trait.id] = await this.fetchTraitValues(
        trait.id,
        trait.isMetadataOnly
      );
    }

    const projectDownloadPath = this.projectDownloadPath();

    // setup only necessary at the beginning of a run,
    // so only do this for batchNum = 0
    if (this.batchNum == 0) {
      // create download directory for all images
      await fs.promises.mkdir(
        projectDownloadPath,
        { recursive: true },
        (err: Error) => {
          if (err) {
            logger.error("error creating project directory");
            logger.error(err);
          }
        }
      );

      const layerDownloadPath = this.layerDownloadPath();

      // create download directory for all artwork
      await fs.promises.mkdir(
        layerDownloadPath,
        { recursive: true },
        (err: Error) => {
          if (err) {
            logger.error("error creating layers directory");
            logger.error(err);
          }
        }
      );

      // predownload all uncomposited artwork
      await Promise.all(
        imageLayers.map((imageLayer) => this.downloadImageFile(imageLayer))
      );
    }

    // generate artwork for each item in the collection supply
    let composites: (ImageComposite | null)[] = [];

    const startIndex = this.batchNum * this.batchSize;
    const endIndex = Math.min(
      collection.supply,
      (this.batchNum + 1) * this.batchSize
    );

    logger.info("Generating: " + startIndex + " - " + endIndex);

    for (let i = startIndex; i < endIndex; i++) {
      const composite = await this.generateArtworkForItem(
        i,
        collection,
        traits,
        traitValues,
        traitValueIdToImageLayers,
        imageLayers,
        conflicts,
        projectDownloadPath
      );
      composites.push(composite);

      if (composite) {
        // remove any possible values for metadata-only traits
        // so that they can only be used once
        traitValues = this.removeUsedMetadataOnlyTraitValues(
          traits,
          traitValues,
          composite
        );
      }
    }

    // only do cleanup if we just finished the last batch of the run
    if (endIndex == collection.supply) {
      // delete all downloaded images and composites
      await fs.promises.rmdir(
        projectDownloadPath,
        { recursive: true, force: true },
        (err: Error) => {
          if (err) {
            logger.error("directory cleanup failed");
            logger.error(err.message);
          }
        }
      );
    }

    return composites;
  }

  async generateArtworkForItem(
    itemIndex: number,
    collection: Collection,
    traits: Trait[],
    traitValues: { [traitId: string]: TraitValue[] },
    traitValueIdToImageLayers: { [traitValueId: string]: ImageLayer },
    imageLayers: ImageLayer[],
    conflicts: Conflict[],
    projectDownloadPath: string
  ): Promise<ImageComposite | null> {
    let traitValuePairs: TraitValuePair[];

    // generate a pair mapping trait to a random trait value
    traitValuePairs = await this.randomTraitValues(traits, traitValues);

    // deal with any pairs that conflict / we dont want to happen
    traitValuePairs = this.resolveConflicts(traitValuePairs, conflicts);

    // for all trait value pairs, fetch the artwork representing random value
    const traitValueImagePairs = traitValuePairs.map((traitValuePair) => {
      const traitValueId = traitValuePair.traitValue?.id;
      const imageLayer = traitValueId
        ? traitValueIdToImageLayers[traitValueId]
        : null;
      traitValuePair.imageLayer = imageLayer;
      return traitValuePair;
    });

    // composite all of the images representing trait values together into one image
    const sortedTraitValueImagePairs =
      this.sortTraitValuePairs(traitValueImagePairs);

    // for any image layers with companions, inject them at the right layer level
    const sortedImageLayers = this.sortedImageLayersInjectingCompanions(
      sortedTraitValueImagePairs,
      imageLayers
    );

    const inputFilePaths = sortedImageLayers.map((imageLayer) => {
      return imageLayer ? this.downloadPathForImageLayer(imageLayer) : null;
    });

    const outputFilePath: string = path.join(
      projectDownloadPath,
      itemIndex + ".png"
    );

    const succeeded = await this.compositeImages(
      inputFilePaths,
      outputFilePath
    );

    if (succeeded) {
      // upload the composite back to the bucket
      const bucket = this.storage.bucket();
      const uploadFilePath =
        this.projectId +
        "/" +
        collection.id +
        "/generated/" +
        this.compositeGroupId +
        "/" +
        itemIndex +
        ".png";

      const uploadFile = bucket.file(uploadFilePath);

      const downloadURL = await bucket
        .upload(outputFilePath, {
          destination: uploadFilePath,
          metadata: {
            contentType: "image/png",
          },
        })
        .then(() => {
          return uploadFile.publicUrl();
        })
        .catch((err: Error) => {
          logger.error("error uploading file to bucket");
          logger.error(err);
        });

      const imageComposite = {
        externalURL: downloadURL,
        traits: sortedTraitValueImagePairs,
      } as ImageComposite;

      return imageComposite;
    } else {
      return null;
    }
  }

  async randomTraitValues(
    traits: Trait[],
    traitValues: { [traitId: string]: TraitValue[] }
  ): Promise<TraitValuePair[]> {
    // for each trait fetch a randomly chosen value
    // based upon the distribution of rarity
    const traitValueTasks = traits.map(async (trait) => {
      return await this.randomValue(
        traitValues[trait.id],
        trait.isMetadataOnly
      ).then(
        (value) => ({ trait: trait, traitValue: value } as TraitValuePair)
      );
    });
    return await Promise.all(traitValueTasks);
  }

  async fetchCollection(): Promise<Collection> {
    const collectionDoc = await this.db
      .doc("/projects/" + this.projectId + "/collections/" + this.collectionId)
      .get();

    const collection = collectionDoc.data() as Collection;
    collection.id = collectionDoc.id;
    return collection;
  }

  resolveConflicts(
    traitValuePairs: TraitValuePair[],
    conflicts: Conflict[]
  ): TraitValuePair[] {
    for (let i = 0; i < conflicts.length; i++) {
      const conflict = conflicts[i];

      const trait1Index = traitValuePairs.findIndex(
        (pair) => pair.trait.id == conflict.trait1Id
      );
      if (trait1Index == -1) {
        continue;
      }

      const trait2Index = traitValuePairs.findIndex(
        (pair) => pair.trait.id == conflict.trait2Id
      );
      if (trait2Index == -1) {
        continue;
      }

      const trait1ValueIndex = traitValuePairs.findIndex(
        (pair) => pair.traitValue?.id == conflict.trait1ValueId
      );
      if (trait1ValueIndex == -1) {
        continue;
      }

      const trait2ValueIndex = traitValuePairs.findIndex(
        (pair) => pair.traitValue?.id == conflict.trait2ValueId
      );
      if (trait2ValueIndex == -1) {
        continue;
      }

      // all matches means we have a conflict - time to handle resolution:
      if (conflict.resolutionType == ConflictResolutionType.Trait1Wins) {
        traitValuePairs[trait2Index].traitValue = null;
      } else if (conflict.resolutionType == ConflictResolutionType.Trait2Wins) {
        traitValuePairs[trait1Index].traitValue = null;
      }

      const trait1Name = traitValuePairs[trait1Index].trait.name;
      const trait2Name = traitValuePairs[trait2Index].trait.name;
      const trait1ValueName =
        trait1ValueIndex == -1
          ? "Any"
          : traitValuePairs[trait1ValueIndex].traitValue?.name ?? "Any";
      const trait2ValueName =
        trait2ValueIndex == -1
          ? "Any"
          : traitValuePairs[trait2ValueIndex].traitValue?.name ?? "Any";

      const resolution =
        conflict.resolutionType == ConflictResolutionType.Trait2Wins
          ? "dropped " + trait1Name
          : "dropped " + trait2Name;

      console.log(
        "resolved conflict for " +
          trait1Name +
          ":" +
          trait1ValueName +
          " and " +
          trait2Name +
          ":" +
          trait2ValueName +
          " " +
          resolution
      );
    }

    return traitValuePairs;
  }

  removeUsedMetadataOnlyTraitValues(
    traits: Trait[],
    traitValues: { [traitId: string]: TraitValue[] },
    composite: ImageComposite
  ): { [traitId: string]: TraitValue[] } {
    for (let i = 0; i < traits.length; i++) {
      const trait = traits[i];
      if (trait.isMetadataOnly) {
        let values = traitValues[trait.id];
        const compositeTraitPair = composite.traits.find((traitPair) => {
          return traitPair.trait.id == trait.id;
        });
        const compositeValue = compositeTraitPair?.traitValue;
        const matchingValueIndex = values.findIndex((value) => {
          return value.id == compositeValue?.id;
        });
        if (matchingValueIndex > -1) {
          values.splice(matchingValueIndex, 1);
          traitValues[trait.id] = values;
        }
      }
    }

    return traitValues;
  }

  /**
   * fetch all trait values for a given collection
   *
   * @returns an array of Trait for the given collection
   */
  async fetchTraits(): Promise<Trait[]> {
    const traitsQuery = await this.db
      .collection(
        "/projects/" +
          this.projectId +
          "/collections/" +
          this.collectionId +
          "/traits"
      )
      .orderBy("zIndex", "asc")
      .get();

    const traits = traitsQuery.docs.map((traitDoc: DocumentSnapshot) => {
      const trait = traitDoc.data() as Trait;
      trait.id = traitDoc.id;
      return trait;
    });

    return traits;
  }

  /**
   * fetch all trait values for a given trait
   *
   * @param traitId the id of the trait
   * @param isMetadataOnly whether the trait is only metadata (not random-image based), and should be uniqued for every NFT
   * @returns an array of TraitValue for the given trait
   */
  async fetchTraitValues(
    traitId: string,
    isMetadataOnly: boolean
  ): Promise<TraitValue[]> {
    const traitValuesQuery = await this.db
      .collection(
        "/projects/" +
          this.projectId +
          "/collections/" +
          this.collectionId +
          "/traits/" +
          traitId +
          "/traitValues"
      )
      .get();

    const traitValues = traitValuesQuery.docs.map(
      (traitValueDoc: DocumentSnapshot) => {
        const traitValue = traitValueDoc.data() as TraitValue;
        traitValue.id = traitValueDoc.id;
        return traitValue;
      }
    );

    if (isMetadataOnly) {
      console.log(
        "loading metadata only: /projects/" +
          this.projectId +
          "/collections/" +
          this.collectionId +
          "/compositeGroups/" +
          this.compositeGroupId +
          "/composites"
      );

      const existingCompositesQuery = await this.db
        .collection(
          "/projects/" +
            this.projectId +
            "/collections/" +
            this.collectionId +
            "/compositeGroups/" +
            this.compositeGroupId +
            "/composites"
        )
        .get();

      const existingComposites: ImageComposite[] =
        existingCompositesQuery.docs.map(
          (existingCompositeDoc: DocumentSnapshot) => {
            const existingComposite =
              existingCompositeDoc.data() as ImageComposite;
            return existingComposite;
          }
        );

      const existingValueIds: string[] = existingComposites.reduce(function (
        result,
        composite
      ) {
        const traitPair = composite.traits.find((traitPair) => {
          traitPair.trait.id == traitId;
        });
        const valueId = traitPair?.traitValue?.id;
        if (valueId) {
          result.push(valueId);
        }
        return result;
      },
      Array<string>());

      return traitValues.filter((traitValue: TraitValue) => {
        return existingValueIds.find((id) => id == traitValue.id) == undefined;
      });
    }

    return traitValues;
  }

  /**
   * picturing a trait with 5 values (A-E) on a bar from 0 to 1
   * where each value's rarity covers some percentage of the bar
   * min 0 [--A--|-----B-----|-C-|--D--|-----E-----] max 1
   * 
   * we walk through the segments until our random number
   * between 0 and 1 lands within one of the segments

   * @param values array of possible trait values each with specified % rarity
   * @returns a secure pseudorandom value from the array factoring in rarity
   */
  async randomValue(
    values: TraitValue[],
    isTraitMetadataOnly: boolean
  ): Promise<TraitValue | null> {
    if (isTraitMetadataOnly) {
      const randomIndex = Math.floor(Math.random() * values.length);
      const randomValue = values[randomIndex];

      return randomValue;
    }

    const precision = TRAITVALUES_RARITY_MAX_PRECISION;

    return this.randomNumber(precision).then((randomNumber) => {
      let totalRarityRangeMax = 0;
      let segment = 0;

      while (segment < values.length) {
        const value = values[segment];
        totalRarityRangeMax += value.rarity;

        if (randomNumber <= totalRarityRangeMax) {
          return value;
        }
        segment++;
      }

      return null;
    });
  }

  /**
   * generate a secure random number from 0.0 -> 1.0
   * with specified digits of precision using the
   * random-number-csprng library
   *
   * @param digitsPrecision number of decimal places of precision
   * @returns a secure pseudorandom number
   */
  async randomNumber(digitsPrecision: number): Promise<number> {
    const rand = require("random-number-csprng");
    const max = Math.pow(10, digitsPrecision);
    const result: Promise<number> = rand(0, max).then((random: number) => {
      return random / max;
    });
    return result;
  }

  /**
   * fetch all image layers
   */
  async fetchArtwork(): Promise<ImageLayer[]> {
    const imageLayerQuery = await this.db
      .collection(
        "/projects/" +
          this.projectId +
          "/collections/" +
          this.collectionId +
          "/imagelayers"
      )
      .orderBy("name", "asc")
      .get();

    let imageLayers = imageLayerQuery.docs.map(
      (imageLayerDoc: DocumentSnapshot) => {
        let imageLayer = imageLayerDoc.data() as ImageLayer;
        imageLayer.id = imageLayerDoc.id;
        return imageLayer;
      }
    );

    return imageLayers;
  }

  /**
   * fetch all conflicts
   */
  async fetchConflicts(): Promise<Conflict[]> {
    const conflictsQuery = await this.db
      .collection(
        "/projects/" +
          this.projectId +
          "/collections/" +
          this.collectionId +
          "/conflicts"
      )
      .orderBy("trait1Id", "asc")
      .get();

    let conflicts = conflictsQuery.docs.map(
      (conflictsDoc: DocumentSnapshot) => {
        let conflict = conflictsDoc.data() as Conflict;
        conflict.id = conflictsDoc.id;
        return conflict;
      }
    );

    return conflicts;
  }

  downloadPathForImageLayer(imageLayer: ImageLayer): string {
    return path.join(this.layerDownloadPath(), imageLayer.id + ".png");
  }

  async downloadImageFile(imageLayer: ImageLayer): Promise<TraitValuePair> {
    const bucket = this.storage.bucket();
    const file = bucket.file(
      this.projectId + "/" + this.collectionId + "/" + imageLayer.bucketFilename
    );

    const tempFilePath = this.downloadPathForImageLayer(imageLayer);

    // TODO: why does validation always fail if I don't disable it?
    return file
      .download({ destination: tempFilePath, validation: false })
      .then(() => {
        return tempFilePath;
      })
      .catch(() => {
        logger.error("failed to download to " + tempFilePath);
        logger.error(file.name);
        return tempFilePath;
      });
  }

  sortTraitValuePairs(traitValuePairs: TraitValuePair[]): TraitValuePair[] {
    return traitValuePairs.sort((a, b) => {
      const zIndexA = a.trait.zIndex;
      const zIndexB = b.trait.zIndex;
      if (zIndexA == zIndexB) return 0;
      return zIndexA < zIndexB ? -1 : 1;
    });
  }

  sortedImageLayersInjectingCompanions(
    sortedTraitValueImagePairs: TraitValuePair[],
    imageLayers: ImageLayer[]
  ): ImageLayer[] {
    const imageLayerPairs: OrderedImageLayer[] = [];

    sortedTraitValueImagePairs.forEach((pair) => {
      if (pair.imageLayer) {
        imageLayerPairs.push({
          imageLayer: pair.imageLayer,
          zIndex: pair.trait.zIndex,
        } as OrderedImageLayer);
      }

      const companionId = pair.imageLayer?.companionLayerId;
      const companionZIndex = pair.imageLayer?.companionLayerZIndex;

      if (companionId != null && companionZIndex != null) {
        const companionImageLayer = imageLayers.find((imageLayer) => {
          return imageLayer.id == companionId;
        });

        if (companionImageLayer) {
          imageLayerPairs.push({
            imageLayer: companionImageLayer,
            zIndex: companionZIndex,
          } as OrderedImageLayer);
        }
      }
    });

    const orderedImageLayerPairs = imageLayerPairs.sort((a, b) => {
      const zIndexA = a.zIndex;
      const zIndexB = b.zIndex;
      if (zIndexA == zIndexB) return 0;
      return zIndexA < zIndexB ? -1 : 1;
    });

    const orderedImageLayers = orderedImageLayerPairs.map((a) => {
      return a.imageLayer;
    });

    return orderedImageLayers;
  }

  compositeImages(
    optInputFilePaths: (string | null)[],
    outputFilePath: string
  ): Promise<Boolean> {
    const inputFilePaths = optInputFilePaths.filter((f) => f);
    if (inputFilePaths.length == 0) {
      return Promise.resolve(false);
    }

    const sharp = require("sharp");
    const firstPath = inputFilePaths.shift();

    if (inputFilePaths.length == 0) {
      return sharp(firstPath).png().toFile(outputFilePath);
    }

    const inputs = inputFilePaths.map((inputFilePath) => {
      return { input: inputFilePath };
    });

    return sharp(firstPath)
      .composite(inputs)
      .png()
      .toFile(outputFilePath)
      .then((_: any) => {
        return true;
      })
      .catch((err: Error) => {
        logger.error("error compositing");
        logger.error("first path: " + firstPath);
        logger.error(inputs);
        logger.error(err);
        return false;
      });
  }

  projectDownloadPath(): string {
    return path.join(tempDir, "treattoolbox", this.projectId);
  }

  layerDownloadPath(): string {
    return path.join(this.projectDownloadPath(), "layered-images");
  }
}
