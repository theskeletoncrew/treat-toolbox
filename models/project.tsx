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

export default interface Project {
  id: string;
  name: string;
  description: string;
  domain: string | undefined;
  url: string;
}

export namespace Projects {
  export const FB_COLLECTION_NAME = "projects";

  export async function all(
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<Project>> {
    const projectQuery = query(
      collection(db, FB_COLLECTION_NAME),
      orderBy(orderByField, orderByDirection)
    );

    const querySnapshot = await getDocs(projectQuery);

    const projects = querySnapshot.docs.map((projectDoc) => {
      const project = projectDoc.data() as Project;
      project.id = projectDoc.id;
      return project;
    });

    return projects;
  }

  export async function withId(projectId: string): Promise<Project> {
    const projectDocRef = doc(db, FB_COLLECTION_NAME + "/" + projectId);

    const projectDoc = await getDoc(projectDocRef);
    const project = projectDoc.data() as Project;
    project.id = projectDoc.id;
    return project;
  }

  export async function create(project: Project): Promise<Project> {
    const docQuery = collection(db, FB_COLLECTION_NAME);

    const docRef = await addDoc(docQuery, project);

    project.id = docRef.id;

    return {
      ...project,
    } as Project;
  }

  export async function update(
    updates: { [x: string]: any },
    id: string
  ): Promise<void> {
    const docRef = doc(db, FB_COLLECTION_NAME + "/" + id);
    return await updateDoc(docRef, updates);
  }

  export const remove = async (id: string) => {
    const docRef = doc(db, FB_COLLECTION_NAME + "/" + id);
    return await deleteDoc(docRef);
  };
}
