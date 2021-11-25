import { logger } from "firebase-functions";
import { storage } from "../models/firebase";
import {
  Collection,
  Collections,
  CollectionType,
  Conflict,
  Conflicts,
  ConflictResolutionType,
  ImageComposite,
  ImageComposites,
  ImageLayer,
  ImageLayers,
  OrderedImageLayer,
  RarityValue,
  Trait,
  Traits,
  TraitSets,
  TraitValue,
  TraitValuePair,
  TraitValues,
  TraitSet,
} from "../models/models";

const path = require("path");
const os = require("os");
const fs = require("fs");
const tempDir = os.tmpdir();

const TRAITVALUES_RARITY_MAX_PRECISION: number = 4;

export class ArtworkGenerator {
  projectId: string;
  collectionId: string;
  compositeGroupId: string;
  traitSetId: string | null;
  startIndex: number;
  endIndex: number;
  batchSize: number;
  isFirstBatchInTraitSet: boolean;

  constructor(
    projectId: string,
    collectionId: string,
    compositeGroupId: string,
    traitSetId: string,
    startIndex: number,
    endIndex: number,
    batchSize: number,
    isFirstBatchInTraitSet: boolean
  ) {
    this.projectId = projectId;
    this.collectionId = collectionId;
    this.compositeGroupId = compositeGroupId;
    this.traitSetId = traitSetId == "-1" ? null : traitSetId;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.batchSize = batchSize;
    this.isFirstBatchInTraitSet = isFirstBatchInTraitSet;
  }

  async generate(): Promise<(ImageComposite | null)[]> {
    const collection = await Collections.withId(
      this.collectionId,
      this.projectId
    );
    const traits = await Traits.all(
      this.projectId,
      this.collectionId,
      this.traitSetId
    );
    const imageLayers = await ImageLayers.all(
      this.projectId,
      this.collectionId,
      this.traitSetId
    );
    const traitSet = this.traitSetId
      ? await TraitSets.withId(
          this.traitSetId,
          this.projectId,
          this.collectionId
        )
      : null;

    let conflicts: Conflict[] = [];
    const traitValueIdToImageLayers: { [traitValueId: string]: ImageLayer } =
      {};

    if (collection.type == CollectionType.Generative) {
      conflicts = await Conflicts.all(
        this.projectId,
        this.collectionId,
        this.traitSetId
      );
    }

    logger.info(
      "Generate Artwork for project: " +
        this.projectId +
        " collection: " +
        collection.name +
        "(" +
        this.collectionId +
        ", type: " +
        collection.type +
        ")"
    );

    imageLayers.forEach((imageLayer) => {
      if (imageLayer.traitValueId) {
        traitValueIdToImageLayers[imageLayer.traitValueId] = imageLayer;
      }
    });

    const valuesWithImagesInTraitSet = Object.keys(traitValueIdToImageLayers);

    let traitValues: { [traitId: string]: TraitValue[] } = {};

    // prefetch all trait values
    for (let i = 0; i < traits.length; i++) {
      const trait = traits[i];
      traitValues[trait.id] = await TraitValues.all(
        this.projectId,
        this.collectionId,
        this.compositeGroupId,
        trait,
        valuesWithImagesInTraitSet
      );
    }

    const projectDownloadPath = this.projectDownloadPath();

    // setup only necessary at the beginning of a run,
    // so only do this for batchNum = 0
    if (this.startIndex == 0) {
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
    }

    if (this.isFirstBatchInTraitSet) {
      // predownload all uncomposited artwork
      await Promise.all(
        imageLayers.map((imageLayer) => this.downloadImageFile(imageLayer))
      );
    }

    // generate artwork for each item in the collection supply
    let composites: (ImageComposite | null)[] = [];

    logger.info("Generating: " + this.startIndex + " - " + this.endIndex);
    logger.info("Trait Set (" + this.traitSetId + "): " + traitSet?.name);
    logger.info("Matching Traits: " + traits.length);
    logger.info("Matching Trait Values: " + Object.values(traitValues).length);
    logger.info("Matching Image Layers: " + imageLayers.length);

    if (collection.type != CollectionType.Prerendered) {
      if (traits.length == 0) {
        logger.info("no matching traits");
        return [];
      }

      if (Object.values(traitValues).length == 0) {
        logger.info("no matching trait values");
        return [];
      }
    }

    if (imageLayers.length == 0) {
      logger.info("no matching image layers");
      return [];
    }

    let continuousFailures = 0;

    let i = this.startIndex;
    while (i < this.endIndex) {
      let compositeData: ImageComposite | null = null;

      switch (collection.type) {
        case CollectionType.Generative:
          compositeData = await this.layeredArtworkForItem(
            i,
            collection,
            traitSet,
            traits,
            traitValues,
            traitValueIdToImageLayers,
            imageLayers,
            conflicts,
            projectDownloadPath
          );
          break;
        case CollectionType.Prerendered:
          compositeData = await this.prerenderedArtworkForItem(
            i,
            collection,
            imageLayers,
            projectDownloadPath
          );
          break;
      }

      if (compositeData) {
        continuousFailures = 0;

        const composite = await ImageComposites.create(
          compositeData,
          this.projectId,
          this.collectionId,
          this.compositeGroupId
        );

        composites.push(composite);

        // remove any possible values for always unique traits
        // so that they can only be used once
        traitValues = this.removeUsedAlwaysUniqueTraitValues(
          traits,
          traitValues,
          composite
        );
      } else {
        continuousFailures++;
        console.error("no composite data");

        if (continuousFailures > 10) {
          break;
        }
        continue;
      }

      i++;
    }

    // only do cleanup if we just finished the last batch of the run
    if (this.endIndex == collection.supply) {
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

  async layeredArtworkForItem(
    itemIndex: number,
    collection: Collection,
    traitSet: TraitSet | null,
    traits: Trait[],
    traitValues: { [traitId: string]: TraitValue[] },
    traitValueIdToImageLayers: { [traitValueId: string]: ImageLayer },
    imageLayers: ImageLayer[],
    conflicts: Conflict[],
    projectDownloadPath: string
  ): Promise<ImageComposite | null> {
    let traitValuePairs: TraitValuePair[] = [];

    let hasUnusedTraitValuePair = false;

    const numRetries = 20;
    let retriesRemaining = numRetries;
    let failedToFindUnusedTraitPair = false;

    let hash: string = "";

    while (!hasUnusedTraitValuePair) {
      // generate a pair mapping trait to a random trait value
      traitValuePairs = await this.randomTraitValues(traits, traitValues);

      hash = ImageComposites.traitsHash(traitValuePairs);
      hasUnusedTraitValuePair = await ImageComposites.isUniqueTraitsHash(
        hash,
        this.projectId,
        this.collectionId,
        this.compositeGroupId
      );

      retriesRemaining--;

      if (retriesRemaining == 0) {
        failedToFindUnusedTraitPair = true;
        console.error(
          "Unable to find unused trait pair after " + numRetries + " retries."
        );
        console.log(
          "generated trait value pairs: " +
            traitValuePairs
              .map((pair) => {
                return pair.trait.name + ": " + pair.traitValue?.name;
              })
              .join(", ")
        );
        break;
      }
    }

    if (failedToFindUnusedTraitPair) {
      return null;
    }

    // deal with any pairs that conflict / we dont want to happen
    traitValuePairs = await this.resolveConflicts(
      traitValuePairs,
      conflicts,
      traitValues
    );

    // for all trait value pairs, fetch the artwork representing random value
    const traitValueImagePairs = traitValuePairs.map((traitValuePair) => {
      const traitValueId = traitValuePair.traitValue?.id;
      const imageLayer = traitValueId
        ? // needs to be null not undefined for firestore
          traitValueIdToImageLayers[traitValueId] ?? null
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

    let succeeded = await this.compositeLayeredImages(
      inputFilePaths,
      outputFilePath
    );

    if (succeeded) {
      // upload the composite back to the bucket
      const bucket = storage.bucket();
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
        traitsHash: hash,
      } as ImageComposite;

      return imageComposite;
    } else {
      return null;
    }
  }

  async prerenderedArtworkForItem(
    itemIndex: number,
    collection: Collection,
    imageLayers: ImageLayer[],
    projectDownloadPath: string
  ): Promise<ImageComposite | null> {
    const imageLayer = imageLayers[itemIndex];
    const inputFilePath = imageLayer
      ? this.downloadPathForImageLayer(imageLayer)
      : null;

    const outputFilePath: string = path.join(
      projectDownloadPath,
      itemIndex + ".png"
    );

    let succeeded = await this.compositeLayeredImages(
      [inputFilePath],
      outputFilePath
    );

    if (succeeded) {
      // upload the composite back to the bucket
      const bucket = storage.bucket();
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
          // metadata: {
          //   contentType: "image/png",
          // },
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
        traits: [] as TraitValuePair[],
        traitsHash: itemIndex.toString(),
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
      return await this.randomValue<TraitValue>(
        traitValues[trait.id],
        trait.isAlwaysUnique
      ).then(
        (value) => ({ trait: trait, traitValue: value } as TraitValuePair)
      );
    });
    return await Promise.all(traitValueTasks);
  }

  async resolveConflicts(
    traitValuePairs: TraitValuePair[],
    conflicts: Conflict[],
    traitValuesDict: { [traitId: string]: TraitValue[] }
  ): Promise<TraitValuePair[]> {
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

      let trait1Value = traitValuePairs[trait1Index].traitValue;
      if (
        (conflict.trait1ValueId !== null &&
          conflict.trait1ValueId !== trait1Value?.id) ||
        trait1Value?.id == null
      ) {
        continue;
      }

      let trait2Value = traitValuePairs[trait2Index].traitValue;
      if (
        (conflict.trait2ValueId !== null &&
          conflict.trait2ValueId !== trait2Value?.id) ||
        trait2Value?.id == null
      ) {
        continue;
      }

      const trait1Name = traitValuePairs[trait1Index].trait.name;
      const trait2Name = traitValuePairs[trait2Index].trait.name;
      const trait1ValueName = conflict.trait1ValueId ? trait1Value.name : "Any";
      const trait2ValueName = conflict.trait2ValueId ? trait2Value.name : "Any";

      let resolution: string;

      // all matches means we have a conflict - time to handle resolution:
      switch (conflict.resolutionType) {
        case ConflictResolutionType.Trait1None:
          traitValuePairs[trait1Index].traitValue = null;
          resolution = "dropped " + trait1Name;
          break;
        case ConflictResolutionType.Trait2None:
          traitValuePairs[trait2Index].traitValue = null;
          resolution = "dropped " + trait2Name;
          break;
        case ConflictResolutionType.Trait1Random:
          const pair1 = traitValuePairs[trait1Index];
          const newRandomValue1 = await this.randomValue<TraitValue>(
            traitValuesDict[pair1.trait.id],
            pair1.trait.isAlwaysUnique,
            pair1.traitValue?.id
          );
          traitValuePairs[trait1Index].traitValue = newRandomValue1;
          resolution = "updated " + trait1Name + " to ";
          break;
        case ConflictResolutionType.Trait2Random:
          const pair2 = traitValuePairs[trait2Index];
          const newRandomValue2 = await this.randomValue<TraitValue>(
            traitValuesDict[pair2.trait.id],
            pair2.trait.isAlwaysUnique,
            pair2.traitValue?.id
          );
          traitValuePairs[trait2Index].traitValue = newRandomValue2;
          resolution = "updated " + trait2Name + " to ";
          break;
      }

      console.log(
        "resolved conflict for " +
          trait1Name +
          ":" +
          trait1ValueName +
          " (" +
          trait1Value.name +
          ") and " +
          trait2Name +
          ":" +
          trait2ValueName +
          " (" +
          trait2Value.name +
          ") " +
          resolution
      );
    }

    return traitValuePairs;
  }

  removeUsedAlwaysUniqueTraitValues(
    traits: Trait[],
    traitValues: { [traitId: string]: TraitValue[] },
    composite: ImageComposite
  ): { [traitId: string]: TraitValue[] } {
    for (let i = 0; i < traits.length; i++) {
      const trait = traits[i];
      if (trait.isAlwaysUnique) {
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
   * picturing a trait with 5 values (A-E) on a bar from 0 to 1
   * where each value's rarity covers some percentage of the bar
   * min 0 [--A--|-----B-----|-C-|--D--|-----E-----] max 1
   * 
   * we walk through the segments until our random number
   * between 0 and 1 lands within one of the segments

   * @param values array of possible trait values each with specified % rarity
   * @returns a secure pseudorandom value from the array factoring in rarity
   */
  async randomValue<T extends RarityValue>(
    values: T[],
    isTraitAlwaysUnique: boolean,
    excludeValueId: string | null = null
  ): Promise<T | null> {
    if (isTraitAlwaysUnique) {
      const randomIndex = Math.floor(Math.random() * values.length);
      const randomValue = values[randomIndex];

      return randomValue;
    }

    const precision = TRAITVALUES_RARITY_MAX_PRECISION;

    let value: T | null;

    const maxAttempts = 10;
    let attempts = 0;

    do {
      if (attempts == maxAttempts) {
        return null;
      }

      value = await this.randomNumber(precision).then((randomNumber) => {
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

      attempts++;
    } while (excludeValueId != null && value?.id === excludeValueId);

    return value;
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

  downloadPathForImageLayer(imageLayer: ImageLayer): string {
    return path.join(this.layerDownloadPath(), imageLayer.id + ".png");
  }

  async downloadImageFile(imageLayer: ImageLayer): Promise<string> {
    const bucket = storage.bucket();
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

  sortTraitValuePairs(pairs: TraitValuePair[]): TraitValuePair[] {
    return pairs.sort((a, b) => {
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

  compositeLayeredImages(
    optInputFilePaths: (string | null)[],
    outputFilePath: string
  ): Promise<boolean> {
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
      return {
        input: inputFilePath,
      };
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
