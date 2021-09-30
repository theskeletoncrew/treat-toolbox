import Layout from "../../../../../../components/Layout";
import DropsSubnav from "../../../../../../components/DropsSubnav";
import { EmptyState } from "../../../../../../components/EmptyState";
import Link from "next/dist/client/link";
import {
  TrashIcon,
  PencilAltIcon,
  DocumentAddIcon,
} from "@heroicons/react/outline";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import ImageCompositeGroup, {
  ImageCompositeGroups,
} from "../../../../../../models/imageCompositeGroup";
import ImageComposite, {
  ImageComposites,
} from "../../../../../../models/imageComposite";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../../../../../components/DestructiveModal";
import { ProgressModal } from "../../../../../../components/ProgressModal";
import { useState } from "react";
import { useRouter } from "next/router";
import { API } from "../../../../../../models/api";
import { collectionGroup } from "@firebase/firestore";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  compositeGroups: ImageCompositeGroup[];
  projectId: string;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const compositeGroups = props.compositeGroups;
  const projectId = props.projectId;

  const BATCH_SIZE = 100;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [generatingModalOpen, setGeneratingModalOpen] = useState(false);
  const [generatingBatch, setGeneratingBatch] = useState(0);
  const generatingTotal = collection.supply;
  const [compositeGroupIdToDelete, setCompositeGroupIdToDelete] = useState<
    string | null
  >(null);

  const router = useRouter();

  const confirmDeleteCompositeGroup = (
    event: React.MouseEvent,
    compositeGroupId: string
  ) => {
    event.preventDefault();
    setCompositeGroupIdToDelete(compositeGroupId);
    setDeleteModalOpen(true);
  };

  const deleteCompositeGroup = async () => {
    if (compositeGroupIdToDelete) {
      await ImageCompositeGroups.remove(
        compositeGroupIdToDelete,
        projectId,
        collection.id
      );
    }
    setCompositeGroupIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteCompositeGroup = async () => {
    setCompositeGroupIdToDelete(null);
    setDeleteModalOpen(false);
  };

  const generateNewCompositeGroup = async () => {
    let batchNum = 0;
    let totalCreated = 0;

    setGeneratingModalOpen(true);

    const compositeGroup = await ImageCompositeGroups.create(
      {} as ImageCompositeGroup,
      projectId,
      collection.id
    );

    let compositeIdsToCompositeHashes: { [key: string]: string } = {};

    const maxBatchNum = Math.floor(collection.supply / BATCH_SIZE);

    while (collection.supply > totalCreated) {
      setGeneratingBatch(Math.min(batchNum, maxBatchNum));

      const newComposites = await fetch(
        API.ENDPOINT +
          "/generate-artwork?projectId=" +
          projectId +
          "&collectionId=" +
          collection.id +
          "&compositeGroupId=" +
          compositeGroup.id +
          "&batchNum=" +
          batchNum +
          "&batchSize=" +
          BATCH_SIZE,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((json) => {
          console.log(json);
          return json;
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      await Promise.all(
        newComposites.map((newComposite: ImageComposite) => {
          newComposite.traitsHash = ImageComposites.traitsHash(newComposite);
          return ImageComposites.create(
            newComposite,
            projectId,
            collection.id,
            compositeGroup.id
          );
        })
      );

      batchNum += 1;
      totalCreated = batchNum * BATCH_SIZE;

      // when we think we're finished, detect and delete duplicates
      if (totalCreated >= collection.supply) {
        const numDuplicatesRemoved = await ImageComposites.removeDuplicates(
          projectId,
          collection.id,
          compositeGroup.id
        );

        totalCreated -= numDuplicatesRemoved;
      }
    }

    console.log("art generation complete");

    setGeneratingModalOpen(false);

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collection.id +
          "/composites/" +
          compositeGroup.id,
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  function cancelGenerateCompositeGroup() {
    // TODO: truly cancel the generating task
    // right now we just hide the progress modal
    setGeneratingModalOpen(false);
  }

  return (
    <Layout
      title="Composites"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <div>
        <DropsSubnav
          project={project}
          collection={collection}
          section="composites"
        />
        {!compositeGroups ? (
          <main className="px-8 py-12">
            <p>Not Found</p>
          </main>
        ) : compositeGroups.length == 0 ? (
          <main className="px-8 py-12">
            <button
              type="button"
              className="block w-full"
              onClick={(e) => generateNewCompositeGroup()}
            >
              <EmptyState
                title="No composite groups"
                message="Generate your first group of image composites."
                buttonTitle="Generate Composites"
              />
            </button>
          </main>
        ) : (
          <main>
            <div className="mt-4 mr-8 float-right">
              <span className="">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={(e) => generateNewCompositeGroup()}
                >
                  <DocumentAddIcon
                    className="-ml-1 mr-1 h-5 w-5"
                    aria-hidden="true"
                  />
                  Generate New Composites
                </button>
              </span>
            </div>

            <div className="flex flex-col clear-both px-8 py-4">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Generated Composite Sets
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {compositeGroups.map((compositeGroup) => (
                          <Link
                            key={compositeGroup.id}
                            href={
                              "/projects/" +
                              project.id +
                              "/collections/" +
                              collection.id +
                              "/composites/" +
                              compositeGroup.id
                            }
                            passHref={true}
                          >
                            <tr className="hover:bg-gray-100 cursor-pointer">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {compositeGroup?.id ?? "Unknown"}
                                </div>
                              </td>
                              <td align="right" width="100">
                                <a
                                  href="#"
                                  onClick={(e) =>
                                    confirmDeleteCompositeGroup(
                                      e,
                                      compositeGroup.id
                                    )
                                  }
                                  className="text-indigo-600 hover:text-indigo-900 inline-block mr-2"
                                >
                                  <TrashIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </a>
                              </td>
                            </tr>
                          </Link>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        <DestructiveModal
          title="Delete Composite Group"
          message={
            "Are you sure you want to delete ‘" +
            (compositeGroups.find(
              (compositeGroup) => compositeGroup.id == compositeGroupIdToDelete
            )?.id ?? "Unknown") +
            "’? This will remove all data associated with this composite run. This action cannot be undone."
          }
          deleteAction={() => {
            deleteCompositeGroup();
          }}
          cancelAction={() => {
            cancelDeleteCompositeGroup();
          }}
          show={deleteModalOpen}
        />

        <ProgressModal
          title="Generating Composite Group"
          message={
            BATCH_SIZE * generatingBatch +
            "-" +
            Math.min(BATCH_SIZE * (generatingBatch + 1), collection.supply) +
            " of " +
            generatingTotal
          }
          loadingPercent={Math.ceil(
            (100 * (BATCH_SIZE * generatingBatch)) / generatingTotal
          )}
          cancelAction={() => {
            cancelGenerateCompositeGroup();
          }}
          show={generatingModalOpen}
        />
      </div>
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
      const project = projects.find((project) => project.id == projectId);
      const compositeGroups = await ImageCompositeGroups.all(
        projectId,
        collectionId
      );

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          compositeGroups: compositeGroups,
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
