import Layout from "../../../../../../components/Layout";
import Header from "../../../../../../components/Header";
import FormDescription from "../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import ImageLayer, { ImageLayers } from "../../../../../../models/imageLayer";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { storage } from "../../../../../../app-firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { ProgressModal } from "../../../../../../components/ProgressModal";

interface Props {
  projects: Project[];
  collection: Collection;
  projectId: string;
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const collection = props.collection;
  const projectId = props.projectId;

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadingFileIndex, setUploadingFileIndex] = useState(0);
  const [uploadingFileProgress, setUploadingFileProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  function cancelUploadingFiles() {
    // TODO: truly cancel the uploading task
    // right now we just hide the progress modal
    setUploadModalOpen(false);
  }

  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFiles) {
      return;
    }

    const files = Array.from(selectedFiles);

    setTotalFiles(files.length);
    setUploadModalOpen(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadingFile(file.name);
      setUploadingFileIndex(i);

      const uuid = uuidv4();
      const originalFilename = file.name;
      const extension = originalFilename.substr(
        originalFilename.lastIndexOf(".") + 1
      );
      const bucketFilename = uuid + "." + extension;
      console.log(
        "starting file: " +
          file.name +
          " to: " +
          projectId +
          "/" +
          collection.id +
          "/" +
          bucketFilename
      );
      const storageRef = ref(
        storage,
        projectId + "/" + collection.id + "/" + bucketFilename
      );

      await new Promise<void>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on("state_changed", (snapshot) => {
          const progress = Math.round(
            snapshot.bytesTransferred / snapshot.totalBytes
          );
          setUploadingFileProgress(progress);
        });
        uploadTask.then(
          (snapshot) => {
            const filePromises = Array<Promise<void>>();

            let url: string;
            const task1 = getDownloadURL(storageRef)
              .then((downloadURL) => {
                url = downloadURL;
              })
              .catch((error) => {
                console.log("error getting d/l url: " + error);
              });
            filePromises.push(task1);

            let metadata: any;
            const task2 = getMetadata(storageRef)
              .then((downloadMetadata) => {
                metadata = downloadMetadata;
              })
              .catch((error) => {
                console.log("error getting metadata: " + error);
              });
            filePromises.push(task2);

            return Promise.all(filePromises)
              .then(async () => {
                const imageLayer = {
                  bucketFilename: bucketFilename,
                  url: url,
                  name: originalFilename,
                  bytes: metadata.size,
                  traitId: null,
                  traitValueId: null,
                } as ImageLayer;

                await ImageLayers.create(imageLayer, projectId, collection.id);

                console.log(imageLayer);
                resolve();
              })
              .catch((error) => {
                console.log("file error: " + error);
                reject(error);
              });
          },
          (error) => {
            console.log("upload error");
            console.log(error);
            reject(error);
          }
        );
      });
    }

    setUploadModalOpen(false);

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collection.id +
          "/artwork",
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout
      title="Create Artwork"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Create Artwork" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Artwork"
              description="Upload your artwork. Once uploaded, you will have an opportunity to assign traits and configure layering."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form
                action="#"
                method="POST"
                encType="multipart/form-data"
                onSubmit={onSubmit}
              >
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="artwork"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Upload Files
                      </label>
                      <label
                        htmlFor="files"
                        className="cursor-pointer w-full mt-1 flex justify-center px-6 pt-20 pb-20 border-2 border-gray-300 border-dashed rounded-md"
                      >
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-18 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="relative bg-white rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            Upload artwork
                          </span>
                          <input
                            id="files"
                            name="files"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={(e) => setSelectedFiles(e.target.files)}
                          />
                          <p className="text-xs text-gray-500 pb-5">
                            Transparent PNGs recommended
                          </p>
                          <p className="text-xs text-gray-500 pb-5">
                            {selectedFiles
                              ? "[" + selectedFiles?.length + " files selected]"
                              : ""}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <ProgressModal
          title="Uploading Artwork"
          message={
            "Uploading " +
            uploadingFile +
            " (" +
            uploadingFileIndex +
            " of " +
            totalFiles +
            ")"
          }
          loadingPercent={Math.ceil(
            (100 * (uploadingFileIndex + 1 * uploadingFileProgress)) /
              totalFiles
          )}
          cancelAction={() => {
            cancelUploadingFiles();
          }}
          show={uploadModalOpen}
        />
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();

    if (projectId && collectionId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);

      return {
        props: {
          projects: projects,
          collection: collection,
          projectId: projectId,
        },
      };
    }
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    props: {},
  };
};
