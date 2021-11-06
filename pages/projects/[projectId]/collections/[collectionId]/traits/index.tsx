import Layout from "../../../../../../components/Layout";
import DropsSubnav from "../../../../../../components/DropsSubnav";
import { EmptyState } from "../../../../../../components/EmptyState";
import Link from "next/dist/client/link";
import {
  TrashIcon,
  PencilAltIcon,
  DocumentAddIcon,
  DuplicateIcon,
} from "@heroicons/react/outline";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../models/trait";
import TraitSet, { TraitSets } from "../../../../../../models/traitSet";
import TraitValue, { TraitValues } from "../../../../../../models/traitValue";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../../../../../components/DestructiveModal";
import { useState } from "react";
import { useRouter } from "next/router";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  traitSets: TraitSet[];
  traits: Trait[];
  traitValues: { [key: string]: TraitValue[] };
  projectId: string;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const traitSets = props.traitSets;
  const traits = props.traits;
  const traitValues = props.traitValues;
  const projectId = props.projectId;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [traitIdToDelete, setTraitIdToDelete] = useState<string | null>(null);

  const router = useRouter();

  const confirmDeleteTrait = (event: React.MouseEvent, traitId: string) => {
    event.preventDefault();
    setTraitIdToDelete(traitId);
    setDeleteModalOpen(true);
  };

  const deleteTrait = async () => {
    if (traitIdToDelete) {
      await Traits.remove(traitIdToDelete, projectId, collection.id);
    }
    setTraitIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteTrait = async () => {
    setTraitIdToDelete(null);
    setDeleteModalOpen(false);
  };

  const duplicateTrait = async (event: React.MouseEvent, traitId: string) => {
    event.preventDefault();
    const trait = traits.find((trait) => trait.id == traitId);
    if (trait) {
      const duplicateTrait = await Traits.create(
        trait,
        projectId,
        collection.id
      );

      const traitValues = await TraitValues.all(
        projectId,
        collection.id,
        traitId
      );

      const promises: Promise<TraitValue>[] = [];

      traitValues.forEach((traitValue) => {
        promises.push(
          TraitValues.create(
            traitValue,
            projectId,
            collection.id,
            duplicateTrait.id
          )
        );
      });

      Promise.all(promises).then(() => {
        router.reload();
      });
    }
  };

  if (!traits) {
    return (
      <Layout
        title="Traits"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="traits"
        />
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (traits.length == 0) {
    return (
      <Layout
        title="Traits"
        section="collections"
        projects={projects}
        selectedProjectId={undefined}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="traits"
        />
        <main className="px-8 py-12">
          <Link
            href={
              "/projects/" +
              project.id +
              "/collections/" +
              collection.id +
              "/traits/create"
            }
            passHref={true}
          >
            <button type="button" className="block w-full">
              <EmptyState
                title="No traits"
                message="Create your first trait."
                buttonTitle="New Trait"
              />
            </button>
          </Link>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Traits"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="traits"
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
                    "/traits/create"
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
                    Add Trait
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
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Values
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Layer
                          </th>
                          {traitSets.length == 0 ? (
                            ""
                          ) : (
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Trait Sets
                            </th>
                          )}
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Values Rarity Sum
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Always Unique
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Metadata Only
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Artwork Only
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Exclude from duplicate detection
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {traits.map((trait) => (
                          <Link
                            key={trait.id}
                            href={
                              "/projects/" +
                              project.id +
                              "/collections/" +
                              collection.id +
                              "/traits/" +
                              trait.id
                            }
                            passHref={true}
                          >
                            <tr
                              key={trait.id}
                              className="hover:bg-gray-100 cursor-pointer"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {trait?.name || "Unknown"}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className="text-sm text-gray-500 overflow-ellipsis"
                                  title={traitValues[trait.id]
                                    .flatMap((value) => value.name)
                                    .join(", ")}
                                >
                                  [{traitValues[trait.id].length}]{" "}
                                  {traitValues[trait.id]
                                    .slice(0, 20)
                                    .flatMap((value) => value.name)
                                    .join(", ")}
                                  {traitValues[trait.id].length > 20
                                    ? "..."
                                    : ""}
                                </div>
                              </td>
                              <td className="px-6 py-4" width="100">
                                <div className="text-sm text-gray-500 overflow-ellipsis">
                                  {trait?.zIndex || "0"}
                                </div>
                              </td>
                              {traitSets.length == 0 ? (
                                ""
                              ) : (
                                <td className="px-6 py-4" width="100">
                                  <div
                                    className="text-sm text-gray-500 overflow-ellipsis"
                                    title={traitSets
                                      .filter((traitSet) => {
                                        return trait?.traitSetIds.includes(
                                          traitSet.id
                                        );
                                      })
                                      .map((traitSet) => {
                                        return traitSet.name;
                                      })
                                      .join(", ")}
                                  >
                                    {trait?.traitSetIds?.length || "0"}
                                  </div>
                                </td>
                              )}
                              <td className="px-6 py-4" width="100">
                                <div className="text-sm text-gray-500 overflow-ellipsis">
                                  {trait.isAlwaysUnique
                                    ? "n/a"
                                    : Number(
                                        100 *
                                          traitValues[trait.id].reduce(
                                            (result, traitValue) => {
                                              return result + traitValue.rarity;
                                            },
                                            0
                                          )
                                      ).toFixed(2) + "%"}
                                </div>
                              </td>
                              <td className="px-6 py-4" width="100">
                                <div className="text-sm text-gray-500 overflow-ellipsis">
                                  {trait?.isAlwaysUnique ? "yes" : "no"}
                                </div>
                              </td>
                              <td className="px-6 py-4" width="100">
                                <div className="text-sm text-gray-500 overflow-ellipsis">
                                  {trait?.isMetadataOnly ? "yes" : "no"}
                                </div>
                              </td>
                              <td className="px-6 py-4" width="100">
                                <div className="text-sm text-gray-500 overflow-ellipsis">
                                  {trait?.isArtworkOnly ? "yes" : "no"}
                                </div>
                              </td>
                              <td className="px-6 py-4" width="100">
                                <div className="text-sm text-gray-500 overflow-ellipsis">
                                  {trait?.excludeFromDuplicateDetection
                                    ? "yes"
                                    : "no"}
                                </div>
                              </td>
                              <td align="right" width="100">
                                <Link
                                  href={
                                    "/projects/" +
                                    project.id +
                                    "/collections/" +
                                    collection.id +
                                    "/traits/" +
                                    trait.id +
                                    "/edit"
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
                                  onClick={(e) => duplicateTrait(e, trait.id)}
                                  className="text-indigo-600 hover:text-indigo-900 inline-block mr-2"
                                >
                                  <DuplicateIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </a>
                                <a
                                  href="#"
                                  onClick={(e) =>
                                    confirmDeleteTrait(e, trait.id)
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

          <DestructiveModal
            title="Delete Trait"
            message={
              "Are you sure you want to delete ‘" +
              (traits.find((trait) => trait.id == traitIdToDelete)?.name ??
                "Unknown") +
              "’? This will remove all data associated with this trait, including all trait values. This action cannot be undone."
            }
            deleteAction={() => {
              deleteTrait();
            }}
            cancelAction={() => {
              cancelDeleteTrait();
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
      const traitSets = await TraitSets.all(projectId, collectionId);
      const traits = await Traits.all(projectId, collectionId);
      const project = projects.find((project) => project.id == projectId);

      // fetch values in each trait
      const results = await Promise.all(
        traits.map(async (trait) => {
          const values = await TraitValues.all(
            projectId,
            collectionId,
            trait.id
          );
          return {
            traitId: trait.id,
            values: values,
          };
        })
      );

      // convert to a keyed dictionary {groupId : users}
      const traitValues: { [key: string]: TraitValue[] } = {};
      results.forEach((result) => {
        const key = result.traitId;
        traitValues[key] = result.values;
      });

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
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
