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
import Conflict, { Conflicts } from "../../../../../../models/conflict";
import TraitSet, { TraitSets } from "../../../../../../models/traitSet";
import Trait, { Traits } from "../../../../../../models/trait";
import TraitValue, { TraitValues } from "../../../../../../models/traitValue";
import { ConflictResolutionType } from "../../../../../../models/conflict";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../../../../../components/DestructiveModal";
import { useState } from "react";
import { useRouter } from "next/router";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  conflicts: Conflict[];
  traitSets: TraitSet[];
  traits: Trait[];
  traitValues: TraitValue[];
  projectId: string;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const conflicts = props.conflicts;
  const traitSets = props.traitSets;
  const traits = props.traits;
  const traitValues = props.traitValues;
  const projectId = props.projectId;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conflictIdToDelete, setConflictIdToDelete] = useState<string | null>(
    null
  );

  const router = useRouter();

  const confirmDeleteConflict = (
    event: React.MouseEvent,
    conflictId: string
  ) => {
    event.preventDefault();
    setConflictIdToDelete(conflictId);
    setDeleteModalOpen(true);
  };

  const deleteConflict = async () => {
    if (conflictIdToDelete) {
      await Conflicts.remove(conflictIdToDelete, projectId, collection.id);
    }
    setConflictIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteConflict = async () => {
    setConflictIdToDelete(null);
    setDeleteModalOpen(false);
  };

  if (!conflicts) {
    return (
      <Layout
        title="Conflicts"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="conflicts"
        />
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (conflicts.length == 0) {
    return (
      <Layout
        title="Conflicts"
        section="collections"
        projects={projects}
        selectedProjectId={undefined}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="conflicts"
        />
        <main className="px-8 py-12">
          <Link
            href={
              "/projects/" +
              project.id +
              "/collections/" +
              collection.id +
              "/conflicts/create"
            }
            passHref={true}
          >
            <button type="button" className="block w-full">
              <EmptyState
                title="No conflicts"
                message="Create your first conflict to define artwork/traits that can't appear together."
                buttonTitle="New Conflict"
              />
            </button>
          </Link>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Conflicts"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="conflicts"
          />
          <main>
            <div className="mt-4 mr-8 float-right">
              <span className="">
                <Link
                  href={
                    "/projects/" +
                    project.id +
                    "/collections/" +
                    collection.id +
                    "/conflicts/create"
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
                    Add Conflict
                  </button>
                </Link>
              </span>
            </div>

            <div className="flex flex-col clear-both px-8 py-4">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {traitSets.length > 0 ? (
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Trait Set
                            </th>
                          ) : (
                            ""
                          )}
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Trait 1 Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Trait 1 Value
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Trait 2 Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Trait 2 Value
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Resolution
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {conflicts.map((conflict) => {
                          let conflictResolutionValue = "";

                          switch (conflict.resolutionType) {
                            case ConflictResolutionType.Trait1None:
                              conflictResolutionValue = "Set Trait 1 to None";
                              break;
                            case ConflictResolutionType.Trait2None:
                              conflictResolutionValue = "Set Trait 2 to None";
                              break;
                            case ConflictResolutionType.Trait1Random:
                              conflictResolutionValue =
                                "Choose a new random value for Trait 1";
                              break;
                            case ConflictResolutionType.Trait2Random:
                              conflictResolutionValue =
                                "Choose a new random value for Trait 2";
                              break;
                          }

                          return (
                            <Link
                              key={conflict.id}
                              href={
                                "/projects/" +
                                project.id +
                                "/collections/" +
                                collection.id +
                                "/conflicts/" +
                                conflict.id
                              }
                              passHref={true}
                            >
                              <tr
                                key={conflict.id}
                                className="hover:bg-gray-100 cursor-pointer"
                              >
                                {traitSets.length > 0 ? (
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                      {conflict?.traitSetId
                                        ? traitSets.find((traitSet) => {
                                            return (
                                              traitSet.id ==
                                              conflict?.traitSetId
                                            );
                                          })?.name
                                        : ""}
                                    </div>
                                  </td>
                                ) : (
                                  ""
                                )}
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {conflict?.trait1Id
                                      ? traits.find((trait) => {
                                          return trait.id == conflict?.trait1Id;
                                        })?.name
                                      : ""}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 overflow-ellipsis">
                                    {conflict?.trait1ValueId
                                      ? traitValues.find((traitValue) => {
                                          return (
                                            traitValue.id ==
                                            conflict?.trait1ValueId
                                          );
                                        })?.name ?? "Any"
                                      : "Any"}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 overflow-ellipsis">
                                    {conflict?.trait2Id
                                      ? traits.find((trait) => {
                                          return trait.id == conflict?.trait2Id;
                                        })?.name
                                      : ""}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 overflow-ellipsis">
                                    {conflict?.trait2ValueId
                                      ? traitValues.find((traitValue) => {
                                          return (
                                            traitValue.id ==
                                            conflict?.trait2ValueId
                                          );
                                        })?.name ?? "Any"
                                      : "Any"}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 overflow-ellipsis">
                                    {conflictResolutionValue}
                                  </div>
                                </td>
                                <td align="right" width="100">
                                  <Link
                                    href={
                                      "/projects/" +
                                      project.id +
                                      "/collections/" +
                                      collection.id +
                                      "/conflicts/" +
                                      conflict.id
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
                                      confirmDeleteConflict(e, conflict.id)
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
            title="Delete Conflict"
            message={
              "Are you sure you want to delete this conflict? This action cannot be undone."
            }
            deleteAction={() => {
              deleteConflict();
            }}
            cancelAction={() => {
              cancelDeleteConflict();
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

    if (projectId && collectionId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const conflicts = await Conflicts.all(projectId, collectionId);
      const project = projects.find((project) => project.id == projectId);
      const traitSets = await TraitSets.all(projectId, collectionId);
      const traits = await Traits.all(projectId, collectionId);

      let traitValues: TraitValue[] = [];
      for (let i = 0; i < traits.length; i++) {
        const trait = traits[i];
        const traitValuesForTrait = await TraitValues.all(
          projectId,
          collectionId,
          trait.id
        );
        traitValues = traitValues.concat(traitValuesForTrait);
      }

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          conflicts: conflicts,
          traitSets: traitSets,
          traits: traits,
          traitValues: traitValues,
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
