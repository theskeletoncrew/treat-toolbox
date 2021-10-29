import Collection from "./collection";
import Project from "./project";
import ImageComposite from "./imageComposite";
import User from "./user";
import { storage } from "../app-firebase";
import { ref, uploadString } from "firebase/storage";

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
    itemNumber: number,
    project: Project,
    creators: User[],
    collection: Collection,
    compositeGroupId: string,
    imageComposite: ImageComposite | null
  ): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      const item = constructCandyMachineItem(
        itemNumber,
        project,
        creators,
        collection,
        imageComposite
      );

      const itemJSON = JSON.stringify(item, null, 4);

      const storageRef = ref(
        storage,
        project.id +
          "/" +
          collection.id +
          "/generated/" +
          compositeGroupId +
          "/" +
          itemNumber +
          ".json"
      );

      uploadString(storageRef, itemJSON)
        .then(
          (snapshot) => {
            resolve(true);
          },
          (e) => {
            reject(e);
          }
        )
        .catch((e) => {
          reject(e);
        });
    });
  }

  function constructCandyMachineItem(
    itemNumber: number,
    project: Project,
    creators: User[],
    collection: Collection,
    imageComposite: ImageComposite | null
  ): CandyMachineItem {
    const attributes =
      imageComposite?.traits.map((elem) => {
        return {
          trait_type: elem.trait.name,
          value: elem.traitValue?.name ?? "None",
        } as TraitValuePair;
      }) ?? [];

    const humanReadableItemNumber = itemNumber + 1;

    return {
      name: collection.symbol + " #" + humanReadableItemNumber, // shift for 0 index
      symbol: collection.symbol,
      description: project.description,
      seller_fee_basis_points: collection.sellerFeeBasisPoints,
      external_url:
        project.url +
        "/" +
        collection.symbol.toLowerCase() +
        "/" +
        humanReadableItemNumber,
      image: itemNumber + ".png",
      attributes: attributes,
      collection: {
        name: collection.name,
        family: project.name,
      } as CollectionItem,
      properties: {
        category: "image",
        files: [
          {
            uri: itemNumber + ".png",
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
