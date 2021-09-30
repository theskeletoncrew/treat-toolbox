import Layout from "../../../components/Layout";
import Link from "next/link";
import Header from "../../../components/Header";
import {
  TrashIcon,
  PencilAltIcon,
  DocumentAddIcon,
} from "@heroicons/react/outline";
import { EmptyState } from "../../../components/EmptyState";
import UserGroup, { UserGroups } from "../../../models/userGroup";
import User, { Users } from "../../../models/user";
import Project, { Projects } from "../../../models/project";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../../components/DestructiveModal";
import { useState } from "react";
import { useRouter } from "next/router";

interface Props {
  projects: Project[];
  userGroup: UserGroup;
  users: User[];
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const userGroup = props.userGroup;
  const users = props.users;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  const router = useRouter();

  const confirmDeleteUser = (event: React.MouseEvent, userId: string) => {
    event.preventDefault();
    setUserIdToDelete(userId);
    setDeleteModalOpen(true);
  };

  const deleteUser = async () => {
    if (userIdToDelete) {
      await Users.remove(userIdToDelete, userGroup.id);
    }
    setUserIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteUser = async () => {
    setUserIdToDelete(null);
    setDeleteModalOpen(false);
  };

  if (!userGroup) {
    return (
      <Layout
        title="Edit User Group"
        section="usergroups"
        projects={projects}
        selectedProjectId={undefined}
      >
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (users.length == 0) {
    return (
      <Layout
        title="Edit User Group"
        section="usergroups"
        projects={projects}
        selectedProjectId={undefined}
      >
        <main className="px-8 py-12">
          <Link
            href={"/usergroups/" + userGroup.id + "/users/create"}
            passHref={true}
          >
            <button type="button" className="block w-full">
              <EmptyState
                title="No users"
                message="Add your first user."
                buttonTitle="New User"
              />
            </button>
          </Link>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Edit User Group"
        section="usergroups"
        projects={projects}
        selectedProjectId={undefined}
      >
        <Header title={userGroup.name + " Users "} />
        <main className="px-8 py-12">
          <div className="float-right align-middle">
            <Link
              href={"/usergroups/" + userGroup.id + "/users/create"}
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
                Add User
              </button>
            </Link>
          </div>

          <div className="flex flex-col clear-both">
            <div className="-my-2 mt-1 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Address
                        </th>
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
                          E-mail
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Share
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        ></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => {
                        return (
                          <Link
                            key={user.id}
                            href={
                              "/usergroups/" +
                              userGroup.id +
                              "/users/" +
                              user.id +
                              "/edit"
                            }
                            passHref={true}
                          >
                            <tr className="hover:bg-gray-100 cursor-pointer">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-gray-900 font-mono">
                                  {user.address}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {user.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {user.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {user.share}
                                </div>
                              </td>
                              <td align="right">
                                <Link
                                  href={
                                    "/usergroups/" +
                                    userGroup.id +
                                    "/users/" +
                                    user.id +
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
                                  onClick={(e) => confirmDeleteUser(e, user.id)}
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

          {/* <div className="w-1/2 float-right border-2 border-gray-100 rounded-md mt-4 p-3">

                        <p>Add Existing User</p>
                        <div className="mt-1 rounded-md shadow-sm">
                            <div className="relative flex-grow focus-within:z-10">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    name="search-users"
                                    id="search-users"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 rounded pl-10 sm:block text-xs border-gray-300"
                                    placeholder="John Doe, AaGhxCk3PCghrS7je44gdtWrKZGQiJRHmuJtZAv9xy6P"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="clear-both"></div> */}

          <DestructiveModal
            title="Delete User"
            message={
              "Are you sure you want to delete the user ‘" +
              (users.find((user) => user.id == userIdToDelete)?.name ??
                "Unknown") +
              "’? This action cannot be undone."
            }
            deleteAction={() => {
              deleteUser();
            }}
            cancelAction={() => {
              cancelDeleteUser();
            }}
            show={deleteModalOpen}
          />
        </main>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const userGroupId = context.query.groupId?.toString();

    if (userGroupId) {
      const projects = await Projects.all();
      const userGroup = await UserGroups.withId(userGroupId);
      const users = await Users.all(userGroupId);

      return {
        props: {
          projects,
          userGroup,
          users,
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
