import { db } from "./firebase";

// DEFINITIONS

export interface Collection {
  id: string;
  name: string;
  type: CollectionType;
  nftName: string;
  supply: number;
  sellerFeeBasisPoints: number;
  symbol: string;
  url: string;
  userGroupId: string;
}

export enum CollectionType {
  Generative = 0,
  Prerendered,
  Tilemapped,
}

export interface Conflict {
  id: string;
  traitSetId: string | null;
  trait1Id: string;
  trait2Id: string;
  trait1ValueId: string | null;
  trait2ValueId: string | null;
  resolutionType: ConflictResolutionType;
}

export enum ConflictResolutionType {
  Trait2None = 0,
  Trait1None,
  Trait2Random,
  Trait1Random,
}

export interface ImageComposite {
  id: string;
  externalURL: string | null;
  traits: TraitValuePair[];
  traitsHash: string;
  additionalMetadataEntries: { [attributeTitle: string]: string };
}

export interface ImageCompositeGroup {
  id: string;
  timestamp: number;
  indexes: number[];
}

export interface ImageLayer {
  id: string;
  bucketFilename: string;
  url: string;
  name: string;
  bytes: number;
  traitSetId: string | null;
  traitId: string | null;
  traitValueId: string | null;
  companionLayerId: string | null;
  companionLayerZIndex: number | null;
}

export interface OrderedImageLayer {
  imageLayer: ImageLayer;
  zIndex: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  domain: string | undefined;
  url: string;
}

// GENERIC INTERFACES

export interface RarityValue {
  id: string;
  rarity: number;
}

export interface Trait {
  id: string;
  name: string;
  zIndex: number;
  traitSetIds: string[];
  isMetadataOnly: boolean;
  isArtworkOnly: boolean;
  isAlwaysUnique: boolean;
  excludeFromDuplicateDetection: boolean;
}

export interface TraitSet {
  id: string;
  name: string;
  supply: number;
  metadataEntries: { [attributeTitle: string]: string };
}

export interface TraitValue {
  id: string;
  name: string;
  rarity: number;
}

export interface TraitValuePair {
  trait: Trait;
  traitValue: TraitValue | null;
  imageLayer: ImageLayer | null;
}

export interface User {
  id: string;
  address: string;
  name: string;
  email: string;
  avatarURL: string | null;
  share: number;
}

// NAMESPACES

export namespace Collections {
  export async function withId(
    collectionId: string,
    projectId: string
  ): Promise<Collection> {
    const collectionDoc = await db
      .doc("/projects/" + projectId + "/collections/" + collectionId)
      .get();

    const collection = collectionDoc.data() as Collection;
    collection.id = collectionDoc.id;
    return collection;
  }
}

export namespace Conflicts {
  export async function all(
    projectId: string,
    collectionId: string,
    traitSetId: string | null
  ): Promise<Conflict[]> {
    const path =
      "/projects/" + projectId + "/collections/" + collectionId + "/conflicts";

    let conflictsQuery;
    if (traitSetId) {
      conflictsQuery = await db
        .collection(path)
        .where("traitSetId", "==", traitSetId)
        .orderBy("trait1Id", "asc")
        .get();
    } else {
      conflictsQuery = await db
        .collection(path)
        .orderBy("trait1Id", "asc")
        .get();
    }

    let conflicts = conflictsQuery.docs.map((conflictsDoc) => {
      let conflict = conflictsDoc.data() as Conflict;
      conflict.id = conflictsDoc.id;
      return conflict;
    });

    return conflicts;
  }
}

export namespace ImageComposites {
  export async function all(
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<ImageComposite[]> {
    const compositesQuery = db
      .collection(
        "/projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/compositeGroups/" +
          compositeGroupId +
          "/composites"
      )
      .get();

    const composites = (await compositesQuery).docs.map((compositeDoc) => {
      const composite = compositeDoc.data() as ImageComposite;
      composite.id = compositeDoc.id;
      return composite;
    });

    return composites;
  }

  export async function create(
    imageComposite: ImageComposite,
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<ImageComposite> {
    const docQuery = db.collection(
      "/projects/" +
        projectId +
        "/collections/" +
        collectionId +
        "/compositeGroups/" +
        compositeGroupId +
        "/composites"
    );

    await docQuery.add(imageComposite);

    return {
      ...imageComposite,
    } as ImageComposite;
  }

  export async function isUniqueTraitsHash(
    hash: string,
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<boolean> {
    const compositesQuery = db
      .collection(
        "/projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/compositeGroups/" +
          compositeGroupId +
          "/composites"
      )
      .where("traitsHash", "==", hash)
      .limit(1);

    const querySnapshot = await compositesQuery.get();
    const isUnique = querySnapshot.docs.length == 0;

    return isUnique;
  }

  export const traitsHash = (traitValuePairs: TraitValuePair[]): string => {
    return traitValuePairs
      .sort((a, b) => {
        const zIndexA = a.trait.zIndex;
        const zIndexB = b.trait.zIndex;
        return zIndexA < zIndexB ? -1 : zIndexA == zIndexB ? 0 : 1;
      })
      .reduce(function (result, traitPair) {
        if (
          traitPair.trait.excludeFromDuplicateDetection ||
          traitPair.traitValue == null
        ) {
          return result;
        }

        return result + (traitPair.traitValue.id ?? "");
      }, "");
  };
}

export namespace ImageCompositeGroups {
  export async function withId(
    groupId: string,
    projectId: string,
    collectionId: string
  ): Promise<ImageCompositeGroup> {
    const groupDoc = await db
      .doc(
        "projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/compositeGroups/" +
          groupId
      )
      .get();
    const compositeGroup = groupDoc.data() as ImageCompositeGroup;
    compositeGroup.id = groupDoc.id;
    return compositeGroup;
  }
}

export namespace ImageLayers {
  export async function all(
    projectId: string,
    collectionId: string,
    traitSetId: string | null
  ): Promise<ImageLayer[]> {
    const path =
      "/projects/" +
      projectId +
      "/collections/" +
      collectionId +
      "/imagelayers";

    let imageLayerQuery: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

    if (traitSetId) {
      imageLayerQuery = await db
        .collection(path)
        .where("traitSetId", "==", traitSetId)
        .orderBy("name", "asc")
        .get();
    } else {
      imageLayerQuery = await db.collection(path).orderBy("name", "asc").get();
    }

    let imageLayers = imageLayerQuery.docs.map((imageLayerDoc) => {
      let imageLayer = imageLayerDoc.data() as ImageLayer;
      imageLayer.id = imageLayerDoc.id;
      return imageLayer;
    });

    return imageLayers;
  }
}

export namespace Projects {
  export async function withId(projectId: string): Promise<Project> {
    const projectDoc = await db.doc("projects/" + projectId).get();
    const project = projectDoc.data() as Project;
    project.id = projectDoc.id;
    return project;
  }
}

export namespace Traits {
  export async function all(
    projectId: string,
    collectionId: string,
    traitSetId: string | null
  ): Promise<Trait[]> {
    const path =
      "/projects/" + projectId + "/collections/" + collectionId + "/traits";

    let traitsQuery: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

    if (traitSetId) {
      traitsQuery = await db
        .collection(path)
        .where("traitSetIds", "array-contains", traitSetId)
        .orderBy("zIndex", "asc")
        .get();
    } else {
      traitsQuery = await db.collection(path).orderBy("zIndex", "asc").get();
    }

    const traits = traitsQuery.docs.map((traitDoc) => {
      const trait = traitDoc.data() as Trait;
      trait.id = traitDoc.id;
      return trait;
    });

    return traits;
  }
}

export namespace TraitSets {
  export async function withId(
    traitSetId: string,
    projectId: string,
    collectionId: string
  ): Promise<TraitSet> {
    const traitSetDoc = await db
      .doc(
        "projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/traitSets/" +
          traitSetId
      )
      .get();
    const traitSet = traitSetDoc.data() as TraitSet;
    traitSet.id = traitSetDoc.id;
    return traitSet;
  }
}

export namespace TraitValues {
  /**
   * fetch all trait values for a given trait
   *
   * @param traitId the id of the trait
   * @param isAlwaysUnique whether the trait should be uniqued for every NFT
   * @param validTraitValueIds trait value ids that are valid for the current traitSet (if they have images)
   * @returns an array of TraitValue for the given trait
   */
  export async function all(
    projectId: string,
    collectionId: string,
    compositeGroupId: string,
    trait: Trait,
    validTraitValueIds: string[]
  ): Promise<TraitValue[]> {
    const traitValuesQuery = await db
      .collection(
        "/projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/traits/" +
          trait.id +
          "/traitValues"
      )
      .get();

    const traitValues = traitValuesQuery.docs.map((traitValueDoc) => {
      const traitValue = traitValueDoc.data() as TraitValue;
      traitValue.id = traitValueDoc.id;
      return traitValue;
    });

    if (trait.isAlwaysUnique) {
      console.log(
        "loading metadata only: /projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/compositeGroups/" +
          compositeGroupId +
          "/composites"
      );

      const existingCompositesQuery = await db
        .collection(
          "/projects/" +
            projectId +
            "/collections/" +
            collectionId +
            "/compositeGroups/" +
            compositeGroupId +
            "/composites"
        )
        .get();

      const existingComposites: ImageComposite[] =
        existingCompositesQuery.docs.map((existingCompositeDoc) => {
          const existingComposite =
            existingCompositeDoc.data() as ImageComposite;
          return existingComposite;
        });

      const existingValueIds: string[] = existingComposites.reduce(function (
        result,
        composite
      ) {
        const traitPair = composite.traits.find((traitPair) => {
          traitPair.trait.id == trait.id;
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

    return traitValues.filter((traitValue: TraitValue) => {
      return trait.isMetadataOnly || validTraitValueIds.includes(traitValue.id);
    });
  }
}

export namespace Users {
  export async function all(userGroupId: string): Promise<User[]> {
    const usersQuery = await db
      .collection("/userGroups/" + userGroupId + "/users")
      .get();

    let users = usersQuery.docs.map((userDoc) => {
      let user = userDoc.data() as User;
      user.id = userDoc.id;
      return user;
    });

    return users;
  }
}
