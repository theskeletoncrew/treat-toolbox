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
import Trait, { Traits } from "../../../../../../models/trait";
import TraitSet, { TraitSets } from "../../../../../../models/traitSet";
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
  projectId: string;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const traitSets = props.traitSets ?? [];
  const traits = props.traits;
  const projectId = props.projectId;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [traitSetIdToDelete, setTraitSetIdToDelete] = useState<string | null>(
    null
  );

  const router = useRouter();

  const confirmDeleteTraitSet = (event: React.MouseEvent, traitId: string) => {
    event.preventDefault();
    setTraitSetIdToDelete(traitId);
    setDeleteModalOpen(true);
  };

  const deleteTraitSet = async () => {
    if (traitSetIdToDelete) {
      await TraitSets.remove(traitSetIdToDelete, projectId, collection.id);
    }
    setTraitSetIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteTraitSet = async () => {
    setTraitSetIdToDelete(null);
    setDeleteModalOpen(false);
  };

  if (!traitSets) {
    return (
      <Layout
        title="Trait Sets"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="traitSets"
        />
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (traitSets.length == 0) {
    return (
      <Layout
        title="Trait Sets"
        section="collections"
        projects={projects}
        selectedProjectId={undefined}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="traitSets"
        />
        <main className="px-8 py-12">
          <Link
            href={
              "/projects/" +
              project.id +
              "/collections/" +
              collection.id +
              "/traitSets/create"
            }
            passHref={true}
          >
            <button type="button" className="block w-full">
              <EmptyState
                title="No traits sets"
                message="Create a trait set."
                buttonTitle="New Trait Set"
              />
            </button>
          </Link>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Trait Sets"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="traitSets"
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
                    "/traitSets/create"
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
                    Add Trait Set
                  </button>
                </Link>
              </span>
            </div>
            <div className="ml-10 mt-4 px-4 float-left">
              <h1>
                Total Supply:{" "}
                {traitSets.map((a) => a.supply).reduce((a, b) => a + b)}
              </h1>
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
                            Supply
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Metadata
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {traitSets.map((traitSet) => (
                          <Link
                            key={traitSet.id}
                            href={
                              "/projects/" +
                              project.id +
                              "/collections/" +
                              collection.id +
                              "/traitSets/" +
                              traitSet.id +
                              "/edit"
                            }
                            passHref={true}
                          >
                            <tr
                              key={traitSet.id}
                              className="hover:bg-gray-100 cursor-pointer"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {traitSet?.name || "Unknown"}
                                </div>
                              </td>
                              <td className="px-6 py-4" width="100">
                                <div className="text-sm text-gray-500 overflow-ellipsis">
                                  {traitSet.supply || "0"}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 overflow-ellipsis">
                                  {!traitSet.metadataEntries
                                    ? ""
                                    : Object.keys(traitSet.metadataEntries)
                                        .map((key) => {
                                          return (
                                            key +
                                            ": " +
                                            traitSet.metadataEntries[key]
                                          );
                                        })
                                        .join(", ")}
                                </div>
                              </td>
                              <td align="right" width="100">
                                <Link
                                  href={
                                    "/projects/" +
                                    project.id +
                                    "/collections/" +
                                    collection.id +
                                    "/traitSets/" +
                                    traitSet.id +
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
                                  onClick={(e) =>
                                    confirmDeleteTraitSet(e, traitSet.id)
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
            title="Delete Trait Set"
            message={
              "Are you sure you want to delete ‘" +
              (traitSets.find((traitSet) => traitSet.id == traitSetIdToDelete)
                ?.name ?? "Unknown") +
              "’? This will remove all data associated with this trait set. This action cannot be undone."
            }
            deleteAction={() => {
              deleteTraitSet();
            }}
            cancelAction={() => {
              cancelDeleteTraitSet();
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

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          traitSets: traitSets,
          traits: traits,
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
