import { db } from "../app-firebase";
import {
  query,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Projects } from "./project";
import { Collections } from "./collection";

export default interface ImageCompositeGroup {
  id: string;
  timestamp: number;
  indexes: number[];
}

export namespace ImageCompositeGroups {
  export const FB_COLLECTION_NAME = "compositeGroups";

  export async function all(
    projectId: string,
    collectionId: string
  ): Promise<Array<any>> {
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
  }

  export async function withId(
    groupId: string,
    projectId: string,
    collectionId: string
  ): Promise<ImageCompositeGroup> {
    const groupDocRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        Collections.FB_COLLECTION_NAME +
        "/" +
        collectionId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        groupId
    );

    let groupDoc = await getDoc(groupDocRef);

    let group = groupDoc.data() as ImageCompositeGroup;
    group.id = groupDoc.id;

    return group;
  }

  export async function create(
    imageCompositeGroup: ImageCompositeGroup,
    projectId: string,
    collectionId: string
  ): Promise<ImageCompositeGroup> {
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
        FB_COLLECTION_NAME
    );

    let docRef = await addDoc(docQuery, imageCompositeGroup);

    imageCompositeGroup.id = docRef.id;

    return {
      ...imageCompositeGroup,
    } as ImageCompositeGroup;
  }

  export async function update(
    updates: { [x: string]: any },
    id: string,
    projectId: string,
    collectionId: string
  ): Promise<void> {
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
        FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await updateDoc(docRef, updates);
  }

  export async function remove(
    id: string,
    projectId: string,
    collectionId: string
  ) {
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
        FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await deleteDoc(docRef);
  }
}
