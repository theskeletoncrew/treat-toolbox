import Link from "next/link";
import Layout from "../components/Layout";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import HeaderWithAddButton from "../components/HeaderWithAddButton";
import Project, { Projects } from "../models/project";
import { EmptyState } from "../components/EmptyState";
import { DestructiveModal } from "../components/DestructiveModal";
import { useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

interface Props {
  projects: Project[];
}

export default function IndexPage(props: Props) {
  let projects = props.projects;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState<string | null>(
    null
  );

  const router = useRouter();

  const confirmDeleteProject = (event: React.MouseEvent, projectId: string) => {
    event.preventDefault();
    setProjectIdToDelete(projectId);
    setDeleteModalOpen(true);
  };

  const deleteProject = async () => {
    if (projectIdToDelete) {
      await Projects.remove(projectIdToDelete);
    }
    setProjectIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteProject = async () => {
    setProjectIdToDelete(null);
    setDeleteModalOpen(false);
  };

  if (!projects || projects.length == 0) {
    return (
      <Layout
        title="Projects"
        section="projects"
        projects={projects}
        selectedProjectId={undefined}
      >
        <main className="px-8 py-12">
          <Link href={"/projects/create"} passHref={true}>
            <button type="button" className="block w-full">
              <EmptyState
                title="No projects"
                message="Get started by creating your first project."
                buttonTitle="New Project"
              />
            </button>
          </Link>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Projects"
        section="projects"
        projects={projects}
        selectedProjectId={undefined}
      >
        <div>
          <HeaderWithAddButton
            title="Projects"
            addTitle="Create"
            addHref="/projects/create"
          />
          <main className="px-8 py-12">
            <div className="flex flex-col">
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
                            Description
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((project) => {
                          return (
                            <Link
                              key={project.id}
                              href={"/projects/" + project.id}
                              passHref={true}
                            >
                              <tr
                                key={project.id}
                                className="hover:bg-gray-100 cursor-pointer"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {project.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 max-w-xs truncate overflow-ellipsis max-h-14">
                                    {project.description}
                                  </div>
                                </td>
                                <td align="right">
                                  <Link
                                    href={"/projects/" + project.id + "/edit"}
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
                                      confirmDeleteProject(e, project.id)
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
            title="Delete Project"
            message={
              "Are you sure you want to delete ‘" +
              (projects.find((project) => project.id == projectIdToDelete)
                ?.name ?? "Unknown") +
              "’? This will remove all data associated with this project, including drops, images, and traits. This action cannot be undone."
            }
            deleteAction={() => {
              deleteProject();
            }}
            cancelAction={() => {
              cancelDeleteProject();
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
    const projects = await Projects.all();

    return {
      props: {
        projects,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
