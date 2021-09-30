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
import { UserGroups } from "./userGroup";
import md5 from "crypto-js/md5";

export default interface User {
  id: string;
  address: string;
  name: string;
  email: string;
  twitterUsername: string;
  avatarURL: string;
  share: number;
}

export namespace Users {
  export const FB_COLLECTION_NAME = "users";

  export const all = async (
    groupId: string,
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<Array<User>> => {
    const usersQuery = query(
      collection(
        db,
        "/" +
          UserGroups.FB_COLLECTION_NAME +
          "/" +
          groupId +
          "/" +
          FB_COLLECTION_NAME
      ),
      orderBy(orderByField, orderByDirection)
    );

    const querySnapshot = await getDocs(usersQuery);

    let users = querySnapshot.docs.map((userDoc) => {
      let user = userDoc.data() as User;
      user.id = userDoc.id;
      return user;
    });

    return users;
  };

  export const withId = async (
    userId: string,
    groupId: string
  ): Promise<User> => {
    const userDocRef = doc(
      db,
      "/" +
        UserGroups.FB_COLLECTION_NAME +
        "/" +
        groupId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        userId
    );

    const userDoc = await getDoc(userDocRef);
    const user = userDoc.data() as User;
    user.id = userDoc.id;
    return user;
  };

  export const create = async (user: User, groupId: string): Promise<User> => {
    const docQuery = collection(
      db,
      "/" +
        UserGroups.FB_COLLECTION_NAME +
        "/" +
        groupId +
        "/" +
        FB_COLLECTION_NAME
    );

    const docRef = await addDoc(docQuery, user);

    user.id = docRef.id;

    return {
      ...user,
    } as User;
  };

  export const update = async (
    updates: { [x: string]: any },
    id: string,
    groupId: string,
    orderByField: string = "name",
    orderByDirection: OrderByDirection = "asc"
  ): Promise<void> => {
    const docRef = doc(
      db,
      UserGroups.FB_COLLECTION_NAME +
        "/" +
        groupId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        id
    );

    return await updateDoc(docRef, updates);
  };

  export const remove = async (id: string, groupId: string): Promise<void> => {
    const docRef = doc(
      db,
      UserGroups.FB_COLLECTION_NAME +
        "/" +
        groupId +
        "/" +
        FB_COLLECTION_NAME +
        "/" +
        id
    );
    return await deleteDoc(docRef);
  };

  export const gravatarURL = (email: string): string => {
    const hash = md5(email.trim().toLowerCase()).toString();
    return "https://www.gravatar.com/avatar/" + hash;
  };
}
