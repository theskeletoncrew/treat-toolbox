import { db } from "./firebase";

export interface Collection {
  id: string;
  name: string;
  supply: number;
  status: DropStatus;
  startDate: Date;
}

export enum DropStatus {
  Pending = 0,
  Active,
  Ended,
}

export interface Trait {
  id: string;
  name: string;
  zIndex: number;
  isMetadataOnly: boolean;
  excludeFromDuplicateDetection: boolean;
}

export interface TraitValue {
  id: string;
  name: string;
  rarity: number;
}

export interface ImageLayer {
  id: string;
  bucketFilename: string;
  url: string;
  name: string;
  bytes: number;
  traitId: string | null;
  traitValueId: string | null;
  companionLayerId: string | null;
  companionLayerZIndex: number | null;
}

export interface Conflict {
  id: string;
  trait1Id: string;
  trait2Id: string;
  trait1ValueId: string | null;
  trait2ValueId: string | null;
  resolutionType: ConflictResolutionType;
}

export enum ConflictResolutionType {
  Trait1Wins = 0,
  Trait2Wins,
}

export interface OrderedImageLayer {
  imageLayer: ImageLayer;
  zIndex: number;
}

export interface TraitValuePair {
  trait: Trait;
  traitValue: TraitValue | null;
  imageLayer: ImageLayer | null;
}

export interface ImageComposite {
  id: string;
  externalURL: string | null;
  traits: TraitValuePair[];
  traitsHash: string;
}

export namespace ImageComposites {
  export const create = async (
    imageComposite: ImageComposite,
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<ImageComposite> => {
    imageComposite.traitsHash = traitsHash(imageComposite.traits);

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
  };

  export const isUniqueTraitsHash = async (
    hash: string,
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<boolean> => {
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
  };

  export const traitsHash = (traitValuePairs: TraitValuePair[]): string => {
    return traitValuePairs
      .sort((a, b) => {
        const zIndexA = a.trait.zIndex;
        const zIndexB = b.trait.zIndex;
        return zIndexA < zIndexB ? -1 : zIndexA == zIndexB ? 0 : 1;
      })
      .reduce(function (result, traitPair) {
        if (
          traitPair.trait.isMetadataOnly ||
          traitPair.trait.excludeFromDuplicateDetection ||
          traitPair.traitValue == null
        ) {
          return result;
        }

        return result + (traitPair.traitValue.id ?? "");
      }, "");
  };
}
