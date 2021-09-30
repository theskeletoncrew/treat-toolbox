import Link from "next/link";
import Image from "next/image";
import Layout from "../../components/Layout";
import { EmptyState } from "../../components/EmptyState";
import {
  TrashIcon,
  PencilAltIcon,
  DocumentAddIcon,
} from "@heroicons/react/outline";
import HeaderWithAddButton from "../../components/HeaderWithAddButton";
import UserGroup, { UserGroups } from "../../models/userGroup";
import User, { Users } from "../../models/user";
import Project, { Projects } from "../../models/project";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../components/DestructiveModal";
import { useState } from "react";
import { useRouter } from "next/router";

interface Props {
  projects: Project[];
  userGroups: UserGroup[];
  users: { [key: string]: User[] };
}

export default function IndexPage(props: Props) {
  const projects = props.projects;
  const userGroups = props.userGroups;
  const users = props.users;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupIdToDelete, setGroupIdToDelete] = useState<string | null>(null);

  const router = useRouter();

  const confirmDeleteGroup = (event: React.MouseEvent, groupId: string) => {
    event.preventDefault();
    setGroupIdToDelete(groupId);
    setDeleteModalOpen(true);
  };

  const deleteGroup = async () => {
    if (groupIdToDelete) {
      await UserGroups.remove(groupIdToDelete);
    }
    setGroupIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteGroup = async () => {
    setGroupIdToDelete(null);
    setDeleteModalOpen(false);
  };

  if (!userGroups || userGroups.length == 0) {
    return (
      <Layout
        title="User Groups"
        section="usergroups"
        projects={projects}
        selectedProjectId={undefined}
      >
        <main className="px-8 py-12">
          <Link href={"/usergroups/create"} passHref={true}>
            <button type="button" className="block w-full">
              <EmptyState
                title="No user groups"
                message="Get started by creating your first group."
                buttonTitle="New Group"
              />
            </button>
          </Link>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="User Groups"
        section="usergroups"
        projects={projects}
        selectedProjectId={undefined}
      >
        <div>
          <HeaderWithAddButton
            title="User Groups"
            addTitle="Add User Group"
            addHref="/usergroups/create"
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
                            Members
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          ></th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userGroups.map((userGroup) => {
                          return (
                            <Link
                              key={userGroup.id}
                              href={"/usergroups/" + userGroup.id}
                              passHref={true}
                            >
                              <tr className="hover:bg-gray-100 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {userGroup?.name || "Unknown"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {users[userGroup.id].length}
                                  </div>
                                </td>
                                <td className="py-4" align="right">
                                  <div className="relative float-right text-sm text-gray-500 max-w-sm truncate overflow-ellipsis max-h-14">
                                    <div className="overflow-hidden">
                                      <div className="flex -space-x-2 relative">
                                        {users[userGroup.id].map((user) => {
                                          return user.avatarURL ? (
                                            <div
                                              key={user.address}
                                              className="relative inline-block w-6 h-6 rounded-full ring-2 ring-white"
                                            >
                                              <Image
                                                className="rounded-full"
                                                src={user.avatarURL}
                                                alt=""
                                                layout="fill"
                                              />
                                            </div>
                                          ) : (
                                            ""
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td align="right" width="100">
                                  <Link
                                    href={
                                      "/usergroups/" + userGroup.id + "/edit"
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
                                      confirmDeleteGroup(e, userGroup.id)
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
            title="Delete User Group"
            message={
              "Are you sure you want to delete ‘" +
              (userGroups.find((group) => group.id == groupIdToDelete)?.name ??
                "Unknown") +
              "’? This action cannot be undone."
            }
            deleteAction={() => {
              deleteGroup();
            }}
            cancelAction={() => {
              cancelDeleteGroup();
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
    const userGroups = await UserGroups.all();

    // fetch users in each group
    const results = await Promise.all(
      userGroups.map(async (group) => {
        const groupUsers = await Users.all(group.id);
        return {
          groupId: group.id,
          groupUsers: groupUsers,
        };
      })
    );

    // convert to a keyed dictionary {groupId : users}
    const users: { [key: string]: User[] } = {};
    results.forEach((result) => {
      const key = result.groupId;
      users[key] = result.groupUsers;
    });

    return {
      props: {
        projects,
        userGroups,
        users,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
