import { db } from "../app-firebase";
import { Projects } from "./project";
import { Collections } from "./collection";
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
  WriteBatch,
} from "firebase/firestore";

export default interface ImageLayer {
  id: string;
  bucketFilename: string;
  url: string;
  name: string;
  bytes: number;
  traitSetId: string | null;
  traitId: string | null;
  traitValueId: string | null;
  companionLayerId: string | null;
  companionLayerZIndex: number | null;
}

export namespace ImageLayers {
  export const FB_COLLECTION_NAME = "imagelayers";

  export async function all(
    projectId: string,
    collectionId: string,
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<ImageLayer>> {
    const artworkQuery = query(
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

    let querySnapshot = await getDocs(artworkQuery);

    let imageLayers = querySnapshot.docs.map((artworkDoc) => {
      let imageLayer = artworkDoc.data() as ImageLayer;
      imageLayer.id = artworkDoc.id;
      return imageLayer;
    });

    return imageLayers;
  }

  export async function withId(
    projectId: string,
    collectionId: string,
    imageLayerId: string
  ): Promise<ImageLayer> {
    const artworkDocRef = doc(
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
        imageLayerId
    );

    let artworkDoc = await getDoc(artworkDocRef);

    let imageLayer = artworkDoc.data() as ImageLayer;
    imageLayer.id = artworkDoc.id;
    return imageLayer;
  }

  export async function create(
    imageLayer: ImageLayer,
    projectId: String,
    collectionId: String
  ): Promise<ImageLayer> {
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

    const docRef = await addDoc(docQuery, imageLayer);

    imageLayer.id = docRef.id;

    return {
      ...imageLayer,
    } as ImageLayer;
  }

  export async function update(
    updates: { [x: string]: any },
    id: string,
    projectId: string,
    collectionId: string,
    batch: WriteBatch | null = null
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

    if (batch) {
      batch.update(docRef, updates);
    } else {
      return await updateDoc(docRef, updates);
    }
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

  export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
}
