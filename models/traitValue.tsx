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
import { Collections } from "./collection";
import { Traits } from "./trait";

export default interface TraitValue {
  id: string;
  name: string;
  rarity: number;
}

export namespace TraitValues {
  export const FB_COLLECTION_NAME = "traitValues";

  export async function all(
    projectId: string,
    collectionId: string,
    traitId: string,
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<TraitValue>> {
    const traitValuesQuery = query(
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
          Traits.FB_COLLECTION_NAME +
          "/" +
          traitId +
          "/" +
          FB_COLLECTION_NAME
      ),
      orderBy(orderByField, orderByDirection)
    );
    const querySnapshot = await getDocs(traitValuesQuery);

    const traitValues = querySnapshot.docs.map((traitValuesDoc) => {
      const traitValue = traitValuesDoc.data() as TraitValue;
      traitValue.id = traitValuesDoc.id;
      return traitValue;
    });

    return traitValues;
  }

  export async function withId(
    projectId: string,
    collectionId: string,
    traitId: string,
    traitValueId: string
  ): Promise<TraitValue> {
    const traitValueDocRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        Collections.FB_COLLECTION_NAME +
        "/" +
        collectionId +
        "/" +
        Traits.FB_COLLECTION_NAME +
        "/" +
        traitId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        traitValueId
    );

    const traitValueDoc = await getDoc(traitValueDocRef);
    const traitValue = traitValueDoc.data() as TraitValue;
    traitValue.id = traitValueDoc.id;
    return traitValue;
  }

  export async function create(
    traitValue: TraitValue,
    projectId: string,
    collectionId: string,
    traitId: string
  ): Promise<TraitValue> {
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
        Traits.FB_COLLECTION_NAME +
        "/" +
        traitId +
        "/" +
        FB_COLLECTION_NAME
    );

    const docRef = await addDoc(docQuery, traitValue);

    traitValue.id = docRef.id;

    return {
      ...traitValue,
    } as TraitValue;
  }

  export async function update(
    updates: { [x: string]: any },
    id: string,
    projectId: string,
    collectionId: string,
    traitId: string
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
        Traits.FB_COLLECTION_NAME +
        "/" +
        traitId +
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
    collectionId: string,
    traitId: string
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
        Traits.FB_COLLECTION_NAME +
        "/" +
        traitId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await deleteDoc(docRef);
  }
}
