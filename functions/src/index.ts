import * as functions from "firebase-functions";
import * as httpFunctions from "./httpFunctions";

export const api = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .https.onRequest(httpFunctions.api);
