import { logger } from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import { Collection } from "../models/models";
import { db, storage } from "../models/firebase";

export class CandyMachineDownloader {
  projectId: string;
  collectionId: string;
  compositeGroupId: string;

  archiver = require("archiver");

  constructor(
    projectId: string,
    collectionId: string,
    compositeGroupId: string
  ) {
    this.projectId = projectId;
    this.collectionId = collectionId;
    this.compositeGroupId = compositeGroupId;
  }

  async download(): Promise<string> {
    logger.info("beginning downloads for archive");
    const bucket = storage.bucket();

    // generate random name for a file
    const filePath = uuidv4();
    const file = bucket.file("/candy-machine-" + filePath);

    const outputStreamBuffer = file.createWriteStream({
      gzip: true,
      contentType: "application/zip",
    });

    const archive = this.archiver("zip", {
      gzip: true,
      zlib: { level: 9 },
    });

    archive.on("error", (err: Error) => {
      throw err;
    });

    archive.pipe(outputStreamBuffer);

    const collection = await this.fetchCollection();
    const archiveDir = "/candy-machine-" + filePath;

    for (let i = 0; i < collection.supply; i++) {
      const compositePath = this.pathForComposite(i);
      const compositeFilename = i + ".png";

      // TODO: why does validation always fail if I don't disable it?
      const compositeFile = await bucket
        .file(compositePath)
        .download({ validation: false });

      archive.append(compositeFile[0], {
        name: archiveDir + "/" + compositeFilename,
      });

      const metadataPath = this.pathForCandyMachineMetadata(i);
      const metadataFilename = i + ".json";

      // TODO: why does validation always fail if I don't disable it?
      const metadataFile = await bucket
        .file(metadataPath)
        .download({ validation: false });

      archive.append(metadataFile[0], {
        name: archiveDir + "/" + metadataFilename,
      });
    }

    const promise = new Promise<string>((resolve, reject) => {
      archive.on("error", reject);
      archive.on("warn", logger.warn);

      archive.on("finish", async () => {
        logger.info("uploaded zip: " + filePath);

        // get url to download zip file with far future expiration date
        const archiveURL = await file.publicUrl();
        logger.info("archive created");
        logger.info(archiveURL);

        resolve('{ "url": "' + archiveURL + '"}');
      });
    });

    archive.finalize();

    return promise;
  }

  async fetchCollection(): Promise<Collection> {
    const collectionDoc = await db
      .doc("/projects/" + this.projectId + "/collections/" + this.collectionId)
      .get();

    const collection = collectionDoc.data() as Collection;
    collection.id = collectionDoc.id;
    return collection;
  }

  pathForComposite(itemIndex: number): string {
    const compositeFilePath =
      this.projectId +
      "/" +
      this.collectionId +
      "/generated/" +
      this.compositeGroupId +
      "/" +
      itemIndex +
      ".png";

    return compositeFilePath;
  }

  pathForCandyMachineMetadata(itemIndex: number): string {
    const metadataFilePath =
      this.projectId +
      "/" +
      this.collectionId +
      "/generated/" +
      this.compositeGroupId +
      "/" +
      itemIndex +
      ".json";

    return metadataFilePath;
  }
}
