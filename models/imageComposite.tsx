import { db } from "../app-firebase";
import {
  query,
  collection,
  doc,
  where,
  limit,
  orderBy,
  OrderByDirection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Projects } from "./project";
import { Collections } from "./collection";
import Trait from "./trait";
import TraitValue from "./traitValue";
import ImageLayer from "./imageLayer";
import { ImageCompositeGroups } from "./imageCompositeGroup";

export default interface ImageComposite {
  id: string;
  externalURL: string | null;
  traits: TraitValuePair[];
  traitsHash: string;
}

export interface TraitValuePair {
  trait: Trait;
  traitValue: TraitValue | null;
  imageLayer: ImageLayer | null;
}

export namespace ImageComposites {
  export const FB_COLLECTION_NAME = "composites";

  export const all = async (
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<Array<any>> => {
    const compositesQuery = query(
      collection(
        db,
        Projects.FB_COLLECTION_NAME +
          "/" +
          projectId +
          "/" +
          Collections.FB_COLLECTION_NAME +
          "/" +
          collectionId +
          "/" +
          ImageCompositeGroups.FB_COLLECTION_NAME +
          "/" +
          compositeGroupId +
          "/" +
          FB_COLLECTION_NAME
      )
    );

    const querySnapshot = await getDocs(compositesQuery);

    const composites = querySnapshot.docs.map((compositeDoc) => {
      const composite = compositeDoc.data();
      composite.id = compositeDoc.id;
      return composite;
    });

    return composites;
  };

  export const withId = async (
    id: string,
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<ImageComposite> => {
    const compositeDocRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        Collections.FB_COLLECTION_NAME +
        "/" +
        collectionId +
        "/" +
        ImageCompositeGroups.FB_COLLECTION_NAME +
        "/" +
        compositeGroupId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        id
    );

    let compositeDoc = await getDoc(compositeDocRef);

    let composite = compositeDoc.data() as ImageComposite;
    composite.id = compositeDoc.id;
    return composite;
  };

  export const create = async (
    imageComposite: ImageComposite,
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<ImageComposite> => {
    const docQuery = collection(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        Collections.FB_COLLECTION_NAME +
        "/" +
        collectionId +
        "/" +
        ImageCompositeGroups.FB_COLLECTION_NAME +
        "/" +
        compositeGroupId +
        "/" +
        FB_COLLECTION_NAME
    );

    let docRef = await addDoc(docQuery, imageComposite);

    return {
      ...imageComposite,
    } as ImageComposite;
  };

  export const update = async (
    updates: { [x: string]: any },
    id: string,
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<void> => {
    const docRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        Collections.FB_COLLECTION_NAME +
        "/" +
        collectionId +
        "/" +
        ImageCompositeGroups.FB_COLLECTION_NAME +
        "/" +
        compositeGroupId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        id
    );

    return await updateDoc(docRef, updates);
  };

  export const remove = async (
    id: string,
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ) => {
    const docRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        Collections.FB_COLLECTION_NAME +
        "/" +
        collectionId +
        "/" +
        ImageCompositeGroups.FB_COLLECTION_NAME +
        "/" +
        compositeGroupId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await deleteDoc(docRef);
  };

  export const traitsHash = (composite: ImageComposite): string => {
    return composite.traits
      .sort((a, b) => {
        const zIndexA = a.trait.zIndex;
        const zIndexB = b.trait.zIndex;
        return zIndexA < zIndexB ? -1 : zIndexA == zIndexB ? 0 : 1;
      })
      .reduce(function (result, traitPair) {
        if (traitPair.trait.isMetadataOnly || traitPair.traitValue == null) {
          return result;
        }

        return result + (traitPair.traitValue.id ?? "");
      }, "");
  };

  export const removeDuplicates = async (
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ): Promise<number> => {
    const compositesQuery = query(
      collection(
        db,
        Projects.FB_COLLECTION_NAME +
          "/" +
          projectId +
          "/" +
          Collections.FB_COLLECTION_NAME +
          "/" +
          collectionId +
          "/" +
          ImageCompositeGroups.FB_COLLECTION_NAME +
          "/" +
          compositeGroupId +
          "/" +
          FB_COLLECTION_NAME
      ),
      orderBy("traitsHash", "asc")
    );

    const querySnapshot = await getDocs(compositesQuery);

    const composites = querySnapshot.docs.map((compositeDoc) => {
      return compositeDoc.data() as ImageComposite;
    });

    let compositeIdsToDelete: string[] = [];

    let lastCompositeHash: string = "";
    for (let i = 0; i < composites.length; i++) {
      const composite = composites[i];
      if (composite.traitsHash == lastCompositeHash) {
        console.log(
          composite.id +
            " was a duplicate of " +
            composites[i - 1].id +
            ", both with hash " +
            composites[i - 1].traitsHash
        );
        compositeIdsToDelete.push(composite.id);
      } else {
        lastCompositeHash = composite.traitsHash;
      }
    }

    console.log(compositeIdsToDelete.length + " Duplicates!");

    // do the deletion
    await Promise.all(
      compositeIdsToDelete.map((id) => {
        return ImageComposites.remove(
          id,
          projectId,
          collectionId,
          compositeGroupId
        );
      })
    );

    return compositeIdsToDelete.length;
  };
}
