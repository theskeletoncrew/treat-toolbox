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
import Collection, { Collections } from "./collection";
import { Traits } from "./trait";

export default interface TraitSet {
  id: string;
  name: string;
  supply: number;
  metadataEntries: { [attributeTitle: string]: string };
}

export namespace TraitSets {
  export const FB_COLLECTION_NAME = "traitSets";

  export async function all(
    projectId: string,
    collectionId: string,
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<TraitSet>> {
    const traitSetsQuery = query(
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
      ),
      orderBy(orderByField, orderByDirection)
    );

    const querySnapshot = await getDocs(traitSetsQuery);

    const traitSets = querySnapshot.docs.map((traitSetDoc) => {
      const traitSet = traitSetDoc.data() as TraitSet;
      traitSet.id = traitSetDoc.id;
      return traitSet;
    });

    return traitSets;
  }

  export async function defaultTraitSet(
    projectId: string,
    collection: Collection
  ): Promise<TraitSet> {
    const allTraits = await Traits.all(projectId, collection.id);

    return {
      id: "-1",
      name: "Default",
      supply: collection.supply,
    } as TraitSet;
  }

  export async function withId(
    projectId: string,
    collectionId: string,
    traitSetId: string
  ): Promise<TraitSet> {
    const traitSetDocRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        Collections.FB_COLLECTION_NAME +
        "/" +
        collectionId +
        "/" +
        TraitSets.FB_COLLECTION_NAME +
        "/" +
        traitSetId
    );

    const traitSetDoc = await getDoc(traitSetDocRef);

    let traitSet = traitSetDoc.data() as TraitSet;
    traitSet.id = traitSetDoc.id;
    return traitSet;
  }

  export async function create(
    traitSet: TraitSet,
    projectId: string,
    collectionId: string
  ): Promise<TraitSet> {
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

    const docRef = await addDoc(docQuery, traitSet);

    traitSet.id = docRef.id;

    return {
      ...traitSet,
    } as TraitSet;
  }

  export async function update(
    updates: { [x: string]: any },
    id: String,
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
    return await deleteDoc(docRef);
  }
}
