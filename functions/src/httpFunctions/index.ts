import * as cors from "cors";
import * as express from "express";
import { ArtworkGenerator } from "../ArtworkGenerator";
import { CandyMachineDownloader } from "../CandyMachineDownloader";

const admin = require("firebase-admin");
admin.initializeApp();

const api = express();
api.use(cors({ origin: true }));

api.get("/generate-artwork", (req, res) => {
  const projectId = req.query.projectId?.toString();
  const collectionId = req.query.collectionId?.toString();
  const compositeGroupId = req.query.compositeGroupId?.toString();
  const batchNum = parseInt(req.query.batchNum?.toString() ?? "0");
  const batchSize = parseInt(req.query.batchSize?.toString() ?? "500");

  if (!projectId || !collectionId || !compositeGroupId) {
    res.status(400).send();
    return;
  }

  const artworkGenerator = new ArtworkGenerator(
    projectId,
    collectionId,
    compositeGroupId,
    batchNum,
    batchSize
  );
  artworkGenerator
    .generate()
    .then((imageComposites) => {
      res.status(201).send(imageComposites);
    })
    .catch((err) => {
      console.log("art generation failed");
      console.log(err);
      res.status(500).send();
    });
});

api.get("/download-archive", (req, res) => {
  const projectId = req.query.projectId?.toString();
  const collectionId = req.query.collectionId?.toString();
  const compositeGroupId = req.query.compositeGroupId?.toString();

  if (!projectId || !collectionId || !compositeGroupId) {
    res.status(400).send();
    return;
  }

  const downloader = new CandyMachineDownloader(
    projectId,
    collectionId,
    compositeGroupId
  );
  downloader
    .download()
    .then((archiveURL) => {
      res.status(200).send(archiveURL);
    })
    .catch((err) => {
      console.log("download failed");
      console.log(err);
      res.status(500).send();
    });
});

export { api };
