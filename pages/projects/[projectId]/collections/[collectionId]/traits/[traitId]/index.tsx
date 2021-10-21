import Layout from "../../../../../../../components/Layout";
import DropsSubnav from "../../../../../../../components/DropsSubnav";
import { EmptyState } from "../../../../../../../components/EmptyState";
import Link from "next/dist/client/link";
import {
  TrashIcon,
  PencilAltIcon,
  DocumentAddIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
} from "@heroicons/react/outline";
import { GetServerSideProps } from "next";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../models/traitValue";
import { DestructiveModal } from "../../../../../../../components/DestructiveModal";
import { useState } from "react";
import { useRouter } from "next/router";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  trait: Trait;
  traitValues: TraitValue[];
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const trait = props.trait;
  const traitValues = props.traitValues;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [traitValueIdToDelete, setTraitValueIdToDelete] = useState<
    string | null
  >(null);

  const router = useRouter();

  const confirmDeleteTraitValue = (
    event: React.MouseEvent,
    traitId: string
  ) => {
    event.preventDefault();
    setTraitValueIdToDelete(traitId);
    setDeleteModalOpen(true);
  };

  const deleteTraitValue = async () => {
    if (traitValueIdToDelete) {
      await TraitValues.remove(
        traitValueIdToDelete,
        project.id,
        collection.id,
        trait.id
      );
    }
    setTraitValueIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteTraitValue = async () => {
    setTraitValueIdToDelete(null);
    setDeleteModalOpen(false);
  };

  const distributeRarity = async () => {
    const updatedRarity = 1 / traitValues.length;

    let updates: Promise<void>[] = [];
    traitValues.forEach((traitValue) => {
      updates.push(
        TraitValues.update(
          {
            rarity: updatedRarity,
          },
          traitValue.id,
          project.id,
          collection.id,
          trait.id
        )
      );
    });

    await Promise.all(updates);
    router.reload();
  };

  if (!trait) {
    return (
      <Layout
        title="Traits"
        section="collections"
        projects={projects}
        selectedProjectId={project.id}
      >
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (traitValues.length == 0) {
    return (
      <Layout
        title="Traits"
        section="collections"
        projects={projects}
        selectedProjectId={undefined}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="traits"
          />
          <main className="px-8 py-12">
            <div className="mb-4">
              <h1>{trait.name}</h1>
            </div>
            <Link
              href={
                "/projects/" +
                project.id +
                "/collections/" +
                collection.id +
                "/traits/" +
                trait.id +
                "/values/create"
              }
              passHref={true}
            >
              <button type="button" className="block w-full">
                <EmptyState
                  title="No trait values"
                  message={"Add some possible values for '" + trait.name + "'."}
                  buttonTitle="New Value"
                />
              </button>
            </Link>

            <p className="italic text-sm text-center mt-6 mb-6">or</p>

            <div className="w-full text-center">
              <Link
                href={
                  "/projects/" +
                  project.id +
                  "/collections/" +
                  collection.id +
                  "/traits/" +
                  trait.id +
                  "/values/create-list"
                }
                passHref={true}
              >
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <DocumentDuplicateIcon
                    className="-ml-1 mr-1 h-5 w-5"
                    aria-hidden="true"
                  />
                  Add a List of Values
                </button>
              </Link>
            </div>
          </main>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Traits"
        section="collections"
        projects={projects}
        selectedProjectId={project.id}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="traits"
          />
          <main className="px-8 py-12">
            <div className="mb-6 float-right">
              <span className="pr-4">
                <Link
                  href={
                    "/projects/" +
                    project.id +
                    "/collections/" +
                    collection.id +
                    "/traits/" +
                    trait.id +
                    "/values/create"
                  }
                  passHref={true}
                >
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <DocumentAddIcon
                      className="-ml-1 mr-1 h-5 w-5"
                      aria-hidden="true"
                    />
                    Add Value
                  </button>
                </Link>
              </span>

              <span className="pr-4">
                <Link
                  href={
                    "/projects/" +
                    project.id +
                    "/collections/" +
                    collection.id +
                    "/traits/" +
                    trait.id +
                    "/values/create-list"
                  }
                  passHref={true}
                >
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <DocumentDuplicateIcon
                      className="-ml-1 mr-1 h-5 w-5"
                      aria-hidden="true"
                    />
                    Add a List of Values
                  </button>
                </Link>
              </span>

              <span>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={(e) => distributeRarity()}
                >
                  <ChartPieIcon
                    className="-ml-1 mr-1 h-5 w-5"
                    aria-hidden="true"
                  />
                  Distribute Rarity Evenly
                </button>
              </span>
            </div>

            <div className="mb-4">
              {trait.isMetadataOnly ? (
                trait.name
              ) : (
                <h1>
                  {trait.name}, Total Rarity:{" "}
                  {traitValues
                    .map((a) => a.rarity)
                    .reduce((a, b) => a + b)
                    .toFixed(5)}
                </h1>
              )}
            </div>

            <div className="flex flex-col clear-both">
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
                            Value Name
                          </th>
                          {trait.isMetadataOnly ? (
                            ""
                          ) : (
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Rarity
                            </th>
                          )}
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {traitValues?.map((traitValue) => {
                          return (
                            <Link
                              key={traitValue.id}
                              href={
                                "/projects/" +
                                project.id +
                                "/collections/" +
                                collection.id +
                                "/traits/" +
                                trait.id +
                                "/values/" +
                                traitValue.id
                              }
                              passHref={true}
                            >
                              <tr
                                key={traitValue.id}
                                className="hover:bg-gray-100 cursor-pointer"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {traitValue?.name || "Unknown"}
                                  </div>
                                </td>

                                {trait.isMetadataOnly ? (
                                  ""
                                ) : (
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-sm truncate overflow-ellipsis max-h-14">
                                      {traitValue?.rarity}
                                    </div>
                                  </td>
                                )}
                                <td align="right">
                                  <Link
                                    href={
                                      "/projects/" +
                                      project.id +
                                      "/collections/" +
                                      collection.id +
                                      "/traits/" +
                                      trait.id +
                                      "/values/" +
                                      traitValue.id
                                    }
                                    passHref={true}
                                  >
                                    <a
                                      href="#"
                                      className="text-indigo-600 hover:text-indigo-900 inline-block mr-2"
                                    >
                                      <PencilAltIcon
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                      />
                                    </a>
                                  </Link>
                                  <a
                                    href="#"
                                    onClick={(e) =>
                                      confirmDeleteTraitValue(e, traitValue.id)
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <DestructiveModal
            title="Delete Value"
            message={
              "Are you sure you want to delete ‘" +
              (traitValues.find((value) => value.id == traitValueIdToDelete)
                ?.name ?? "Unknown") +
              "’? This action cannot be undone."
            }
            deleteAction={() => {
              deleteTraitValue();
            }}
            cancelAction={() => {
              cancelDeleteTraitValue();
            }}
            show={deleteModalOpen}
          />
        </div>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();
    const traitId = context.query.traitId?.toString();

    if (projectId && collectionId && traitId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const trait = await Traits.withId(projectId, collectionId, traitId);
      const traitValues = await TraitValues.all(
        projectId,
        collectionId,
        traitId
      );
      const project = projects.find((project) => project.id == projectId);

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          trait: trait,
          traitValues: traitValues,
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
