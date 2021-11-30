import { logger } from "firebase-functions";
import {
  Collections,
  ImageComposite,
  ImageComposites,
  ImageCompositeGroups,
  Projects,
  Users,
} from "../models/models";
import { storage } from "../models/firebase";
import { CandyMachine } from "../models/candymachine";

export class CandyMachineDownloader {
  projectId: string;
  collectionId: string;
  compositeGroupId: string;
  userGroupId: string;
  batchSize: number;
  batchNumber: number;

  archiver = require("archiver");

  constructor(
    projectId: string,
    collectionId: string,
    compositeGroupId: string,
    userGroupId: string,
    batchSize: number,
    batchNumber: number
  ) {
    this.projectId = projectId;
    this.collectionId = collectionId;
    this.compositeGroupId = compositeGroupId;
    this.userGroupId = userGroupId;
    this.batchSize = batchSize;
    this.batchNumber = batchNumber;
  }

  async download(): Promise<string> {
    logger.info("beginning downloads for archive");
    const bucket = storage.bucket();

    // generate random name for a file
    const file = bucket.file(
      "/candy-machine-" + this.compositeGroupId + "-" + this.batchNumber
    );

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

    const project = await Projects.withId(this.projectId);
    const collection = await Collections.withId(
      this.collectionId,
      this.projectId
    );
    const creators = await Users.all(this.userGroupId);

    const compositeGroup = await ImageCompositeGroups.withId(
      this.compositeGroupId,
      this.projectId,
      this.collectionId
    );

    const composites = await ImageComposites.all(
      this.projectId,
      this.collectionId,
      this.compositeGroupId
    );

    const archiveDir = "/candy-machine-" + this.compositeGroupId;

    const startIndex = (this.batchNumber - 1) * this.batchSize;
    const endIndex = Math.min(
      startIndex + this.batchSize,
      compositeGroup.indexes.length
    );
    const indexes = compositeGroup.indexes.slice(startIndex, endIndex);

    for (let i = 0; i < indexes.length; i++) {
      const randomCompositeNumber = indexes[i];
      const orderNumber = startIndex + i;
      const composite = composites[randomCompositeNumber];

      const compositeDownloadPath = this.pathForComposite(composite);
      const compositeFilename = orderNumber + ".png";

      // create metadata json file
      const isSuccessful = await CandyMachine.exportItem(
        orderNumber,
        project,
        creators,
        collection,
        this.compositeGroupId,
        composite
      );

      if (!isSuccessful) {
        continue;
      }

      // TODO: why does validation always fail if I don't disable it?
      const compositeFile = await bucket
        .file(compositeDownloadPath)
        .download({ validation: false });

      archive.append(compositeFile[0], {
        name: archiveDir + "/" + compositeFilename,
      });

      const metadataPath = this.pathForCandyMachineMetadata(orderNumber);
      const metadataFilename = orderNumber + ".json";

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

  pathForComposite(composite: ImageComposite): string {
    const generatedFilename = composite.externalURL?.split("/").pop();

    const compositeFilePath =
      this.projectId +
      "/" +
      this.collectionId +
      "/generated/" +
      this.compositeGroupId +
      "/" +
      generatedFilename;

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
