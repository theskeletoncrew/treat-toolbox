import { Collection, Project, ImageComposite, User } from "./models";
import { storage } from "../models/firebase";

interface CandyMachineItem {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  external_url: string;
  image: string;
  attributes: TraitValuePair[];
  collection: CollectionItem;
  properties: PropertiesItem;
}

interface TraitValuePair {
  trait_type: string;
  value: string;
}

interface CollectionItem {
  name: string;
  family: string;
}

interface PropertiesItem {
  category: string;
  files: FileItem[];
  creators: CreatorItem[];
}

interface FileItem {
  uri: string;
  type: string;
}

interface CreatorItem {
  address: string;
  share: number;
}

export namespace CandyMachine {
  export function exportItem(
    orderNumber: number,
    project: Project,
    creators: User[],
    collection: Collection,
    compositeGroupId: string,
    imageComposite: ImageComposite | null
  ): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      console.log("constructing item " + orderNumber);

      const item = constructCandyMachineItem(
        orderNumber,
        project,
        creators,
        collection,
        imageComposite
      );

      const itemJSON = JSON.stringify(item, null, 4);

      storage
        .bucket()
        .file(
          project.id +
            "/" +
            collection.id +
            "/generated/" +
            compositeGroupId +
            "/" +
            orderNumber +
            ".json"
        )
        .save(itemJSON)
        .then(
          (snapshot) => {
            resolve(true);
          },
          (e) => {
            console.log("uploading exception: " + e);
            reject(e);
          }
        )
        .catch((e) => {
          console.log("uploading exception: " + e);
          reject(e);
        });
    });
  }

  function constructCandyMachineItem(
    orderNumber: number,
    project: Project,
    creators: User[],
    collection: Collection,
    imageComposite: ImageComposite | null
  ): CandyMachineItem {
    const attributes =
      imageComposite?.traits
        .filter((traitPair) => {
          return !traitPair.trait.isArtworkOnly;
        })
        .map((elem) => {
          return {
            trait_type: elem.trait.name,
            value: elem.traitValue?.name ?? "None",
          } as TraitValuePair;
        }) ?? [];

    const humanReadableOrderNumber = orderNumber + 1;

    return {
      name: collection.symbol + " #" + humanReadableOrderNumber, // shift for 0 index
      symbol: collection.symbol,
      description: project.description,
      seller_fee_basis_points: collection.sellerFeeBasisPoints,
      external_url:
        project.url +
        "/" +
        collection.symbol.toLowerCase() +
        "/" +
        humanReadableOrderNumber,
      image: orderNumber + ".png",
      attributes: attributes,
      collection: {
        name: collection.name,
        family: project.name,
      } as CollectionItem,
      properties: {
        category: "image",
        files: [
          {
            uri: orderNumber + ".png",
            type: "image/png",
          } as FileItem,
        ],
        creators: creators.map((creator) => {
          return {
            address: creator.address,
            share: creator.share,
          } as CreatorItem;
        }),
      } as PropertiesItem,
    } as CandyMachineItem;
  }
}
