import { db } from "../app-firebase";
import {
  query,
  collection,
  doc,
  orderBy,
  OrderByDirection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Projects } from "./project";

export default interface Collection {
  id: string;
  name: string;
  supply: number;
  sellerFeeBasisPoints: number;
  symbol: string;
  status: DropStatus;
  startDate: Date | null;
  userGroupId: string;
  nftName: string;
}

export enum DropStatus {
  Pending = 0,
  Active,
  Ended,
}

export namespace Collections {
  export const FB_COLLECTION_NAME = "collections";

  export async function all(
    projectId: string,
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<Collection>> {
    const collectionsQuery = query(
      collection(
        db,
        Projects.FB_COLLECTION_NAME + "/" + projectId + "/" + FB_COLLECTION_NAME
      ),
      orderBy(orderByField, orderByDirection)
    );
    const querySnapshot = await getDocs(collectionsQuery);

    const collections = querySnapshot.docs.map((collectionDoc) => {
      const collection = collectionDoc.data() as Collection;
      collection.id = collectionDoc.id;
      collection.startDate = null;
      return collection;
    });

    return collections;
  }

  export async function withId(
    collectionId: string,
    projectId: string
  ): Promise<Collection> {
    const collectionDocRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        collectionId
    );

    const collectionDoc = await getDoc(collectionDocRef);
    const collection = collectionDoc.data() as Collection;
    collection.id = collectionDoc.id;
    collection.startDate = null;
    return collection;
  }

  export async function create(
    newCollection: Collection,
    projectId: string
  ): Promise<Collection> {
    const docQuery = collection(
      db,
      Projects.FB_COLLECTION_NAME + "/" + projectId + "/" + FB_COLLECTION_NAME
    );

    const docRef = await addDoc(docQuery, newCollection);

    newCollection.id = docRef.id;

    return {
      ...newCollection,
    } as Collection;
  }

  export async function update(
    updates: { [x: string]: any },
    id: string,
    projectId: string
  ): Promise<void> {
    const docRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await updateDoc(docRef, updates);
  }

  export async function remove(id: string, projectId: string): Promise<void> {
    const docRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await deleteDoc(docRef);
  }
}
