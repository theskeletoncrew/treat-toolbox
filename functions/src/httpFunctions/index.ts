import * as cors from "cors";
import * as express from "express";
import { ArtworkGenerator } from "../ArtworkGenerator";
import { CandyMachineDownloader } from "../CandyMachineDownloader";

const api = express();
api.use(cors({ origin: true }));

api.get("/generate-artwork", (req, res) => {
  const projectId = req.query.projectId?.toString();
  const collectionId = req.query.collectionId?.toString();
  const compositeGroupId = req.query.compositeGroupId?.toString();
  const traitSetId = req.query.traitSetId?.toString() ?? "-1";
  const startIndex = parseInt(req.query.startIndex?.toString() ?? "0");
  const batchSize = parseInt(req.query.batchSize?.toString() ?? "500");
  const isFirstBatchInTraitSet =
    (req.query.isFirstBatchInTraitSet?.toString() ?? "0") == "1";
  const endIndex = startIndex + batchSize;

  if (!projectId || !collectionId || !compositeGroupId) {
    console.log(
      "unable to find prerequisite project/collection/composite group"
    );
    res.status(400).send();
    return;
  }

  const artworkGenerator = new ArtworkGenerator(
    projectId,
    collectionId,
    compositeGroupId,
    traitSetId,
    startIndex,
    endIndex,
    batchSize,
    isFirstBatchInTraitSet
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
  const userGroupId = req.query.userGroupId?.toString();
  const batchSize = parseInt(req.query.batchSize?.toString() ?? "500");
  const batchNumber = parseInt(req.query.batchNumber?.toString() ?? "1");

  if (
    !projectId ||
    !collectionId ||
    !compositeGroupId ||
    !userGroupId ||
    !batchSize ||
    !batchNumber
  ) {
    res.status(400).send();
    return;
  }

  const downloader = new CandyMachineDownloader(
    projectId,
    collectionId,
    compositeGroupId,
    userGroupId,
    batchSize,
    batchNumber
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
