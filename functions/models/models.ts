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
}
