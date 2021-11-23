import Link from "next/link";
import Layout from "../../../components/Layout";
import { EmptyState } from "../../../components/EmptyState";
import {
  TrashIcon,
  PencilAltIcon,
  DocumentAddIcon,
} from "@heroicons/react/outline";
import Project, { Projects } from "../../../models/project";
import Collection, { Collections } from "../../../models/collection";
import Header from "../../../components/Header";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../../components/DestructiveModal";
import { useState } from "react";
import { useRouter } from "next/router";

interface Props {
  projects: Project[];
  projectId: string;
  project: Project;
  collections: Collection[];
}

export default function IndexPage(props: Props) {
  const projects = props.projects;
  const projectId = props.projectId;
  const project = props.project;
  const collections = props.collections;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionIdToDelete, setCollectionIdToDelete] = useState<
    string | null
  >(null);

  const router = useRouter();

  const confirmDeleteCollection = (
    event: React.MouseEvent,
    collectionId: string
  ) => {
    event.preventDefault();
    setCollectionIdToDelete(collectionId);
    setDeleteModalOpen(true);
  };

  const deleteCollection = async () => {
    if (collectionIdToDelete) {
      await Collections.remove(collectionIdToDelete, projectId);
    }
    setCollectionIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteCollection = async () => {
    setCollectionIdToDelete(null);
    setDeleteModalOpen(false);
  };

  if (!project) {
    return (
      <Layout
        title="Project"
        section="projects"
        projects={projects}
        selectedProjectId={projectId}
      >
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (collections.length == 0) {
    return (
      <Layout
        title="Projects"
        section="projects"
        projects={projects}
        selectedProjectId={undefined}
      >
        <div>
          <Header title={project.name} />
          <main className="px-8 py-12">
            <Link
              href={"/projects/" + projectId + "/collections/create"}
              passHref={true}
            >
              <button type="button" className="block w-full">
                <EmptyState
                  title="No drops"
                  message="Create your first drop."
                  buttonTitle="New Drop"
                />
              </button>
            </Link>
          </main>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Project"
        section="projects"
        projects={projects}
        selectedProjectId={projectId}
      >
        <div>
          <Header title={project.name} />
          <main className="px-8 py-12">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div>
                <div className="px-4 py-3 sm:px-6 flex lg:ml-4 float-right">
                  <span className="sm:ml-3">
                    <Link
                      href={"/projects/" + project.id + "/collections/create"}
                      passHref={true}
                    >
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <DocumentAddIcon
                          className="-ml-1 mr-1 h-5 w-5"
                          aria-hidden="true"
                        />
                        Add Drop
                      </button>
                    </Link>
                  </span>
                </div>
                <h3 className="px-4 py-5 sm:px-6 text-lg leading-6 font-medium text-gray-900">
                  Drops
                </h3>
              </div>
              <div className="flex flex-col border-t border-gray-200">
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
                              Collection
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            ></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {collections.map((collection) => {
                            return (
                              <Link
                                key={collection.id}
                                href={
                                  "/projects/" +
                                  project.id +
                                  "/collections/" +
                                  collection.id
                                }
                                passHref={true}
                              >
                                <tr
                                  key={collection.id}
                                  className="hover:bg-gray-100 cursor-pointer"
                                >
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-sm truncate overflow-ellipsis max-h-14">
                                      {collection.name}
                                    </div>
                                  </td>
                                  <td align="right">
                                    <Link
                                      href={
                                        "/projects/" +
                                        project.id +
                                        "/collections/" +
                                        collection.id +
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
                                        confirmDeleteCollection(
                                          e,
                                          collection.id
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
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DestructiveModal
              title="Delete Drop"
              message={
                "Are you sure you want to delete ‘" +
                (collections.find(
                  (collection) => collection.id == collectionIdToDelete
                )?.name ?? "Unknown") +
                "’? This will remove all data associated with this drop, including images and traits. This action cannot be undone."
              }
              deleteAction={() => {
                deleteCollection();
              }}
              cancelAction={() => {
                cancelDeleteCollection();
              }}
              show={deleteModalOpen}
            />
          </main>
        </div>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const projects = await Projects.all();

    if (projectId) {
      const collections = await Collections.all(projectId);
      const project = projects.find((project) => project.id == projectId);

      return {
        props: {
          projectId,
          projects,
          project,
          collections,
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
