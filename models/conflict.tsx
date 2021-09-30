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

export default interface Conflict {
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

export namespace Conflicts {
  export const FB_COLLECTION_NAME = "conflicts";

  export const all = async (
    projectId: string,
    collectionId: string,
    orderByField: string = "trait1Id",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<Conflict>> => {
    const conflictsQuery = query(
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
          Conflicts.FB_COLLECTION_NAME
      ),
      orderBy(orderByField, orderByDirection)
    );

    const querySnapshot = await getDocs(conflictsQuery);

    const conflicts = querySnapshot.docs.map((conflictDoc) => {
      const conflict = conflictDoc.data() as Conflict;
      conflict.id = conflictDoc.id;
      return conflict;
    });

    return conflicts;
  };

  export const withId = async (
    conflictId: string,
    projectId: string,
    collectionId: string
  ): Promise<Conflict> => {
    const conflictDocRef = doc(
      db,
      Projects.FB_COLLECTION_NAME +
        "/" +
        projectId +
        "/" +
        Collections.FB_COLLECTION_NAME +
        "/" +
        collectionId +
        "/" +
        Conflicts.FB_COLLECTION_NAME +
        "/" +
        conflictId
    );

    const conflictDoc = await getDoc(conflictDocRef);

    let conflict = conflictDoc.data() as Conflict;
    conflict.id = conflictDoc.id;
    return conflict;
  };

  export const create = async (
    conflict: Conflict,
    projectId: string,
    collectionId: string
  ): Promise<Conflict> => {
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
        Conflicts.FB_COLLECTION_NAME
    );

    const docRef = await addDoc(docQuery, conflict);

    conflict.id = docRef.id;

    return {
      ...conflict,
    } as Conflict;
  };

  export const update = async (
    updates: { [x: string]: any },
    id: String,
    projectId: string,
    collectionId: string
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
        Conflicts.FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await updateDoc(docRef, updates);
  };

  export const remove = async (
    id: string,
    projectId: string,
    collectionId: string
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
        Conflicts.FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await deleteDoc(docRef);
  };
}
