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
} from "firebase/firestore";

export default interface ImageLayer {
  id: string;
  bucketFilename: string;
  url: string;
  name: string;
  bytes: number;
  traitId: string | null;
  traitValueId: string | null;
  companionLayerId: string | null;
  companionLayerZIndex: number | null;
}

export namespace ImageLayers {
  export const FB_COLLECTION_NAME = "imagelayers";

  export const all = async (
    projectId: string,
    collectionId: string,
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<ImageLayer>> => {
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
  };

  export const withId = async (
    projectId: string,
    collectionId: string,
    imageLayerId: string
  ): Promise<ImageLayer> => {
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
  };

  export const create = async (
    imageLayer: ImageLayer,
    projectId: String,
    collectionId: String
  ): Promise<ImageLayer> => {
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
  };

  export const update = async (
    updates: { [x: string]: any },
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
        FB_COLLECTION_NAME +
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
        FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await deleteDoc(docRef);
  };

  export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
}

// export const tempImageLayers: ImageLayer[] = [
//     {
//         id: '0',
//         collectionId: '0',
//         url: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
//         name: 'IMG_4985.HEIC',
//         bytes: 3.9 * 1024 * 1024,
//         zIndex: 1,
//         traitValueId: []
//     },
//     {
//         id: '1',
//         collectionId: '0',
//         url: 'https://images.unsplash.com/photo-1614926857083-7be149266cda?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=512&q=80',
//         name: 'IMG_5214.HEIC',
//         bytes: 4.0 * 1024 * 1024,
//         zIndex: 1,
//         traitValueId: []
//     },
//     {
//         id: '2',
//         collectionId: '0',
//         url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
//         name: 'IMG_4278.HEIC',
//         bytes: 4.1 * 1024 * 1024,
//         zIndex: 2,
//         traitValueId: []
//     },
//     {
//         id: '3',
//         collectionId: '0',
//         url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
//         name: 'IMG_6842.HEIC',
//         bytes: 2.9 * 1024 * 1024,
//         zIndex: 3,
//         traitValueId: []
//     },
// ]
