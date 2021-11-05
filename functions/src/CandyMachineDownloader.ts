import { logger } from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import {
  Collections,
  ImageComposites,
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

  archiver = require("archiver");

  constructor(
    projectId: string,
    collectionId: string,
    compositeGroupId: string,
    userGroupId: string
  ) {
    this.projectId = projectId;
    this.collectionId = collectionId;
    this.compositeGroupId = compositeGroupId;
    this.userGroupId = userGroupId;
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

    const project = await Projects.withId(this.projectId);
    const collection = await Collections.withId(
      this.collectionId,
      this.projectId
    );
    const creators = await Users.all(this.userGroupId);

    const composites = await ImageComposites.all(
      this.projectId,
      this.collectionId,
      this.compositeGroupId
    );

    // shuffle the order of the array
    const shuffledIndexes = [...composites.keys()]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    const archiveDir = "/candy-machine-" + filePath;

    for (
      let orderNumber = 0;
      orderNumber < shuffledIndexes.length;
      orderNumber++
    ) {
      const randomCompositeNumber = shuffledIndexes[orderNumber];
      const compositeDownloadPath = this.pathForComposite(
        randomCompositeNumber
      );
      const compositeFilename = orderNumber + ".png";

      const composite = composites[randomCompositeNumber];

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
