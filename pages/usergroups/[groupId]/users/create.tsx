import Header from "../../../../components/Header";
import Layout from "../../../../components/Layout";
import Image from "next/image";
import FormDescription from "../../../../components/FormDescription";
import { GetServerSideProps } from "next";
import Project, { Projects } from "../../../../models/project";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import User, { Users } from "../../../../models/user";
import UserGroup, { UserGroups } from "../../../../models/userGroup";

interface Props {
  projects: Project[];
  userGroupId: string;
  userGroup: UserGroup;
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const userGroupId = props.userGroupId;
  const userGroup = props.userGroup;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAvatarURL, setCurrentAvatarURL] = useState<string | null>(null);

  const router = useRouter();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    setIsSubmitting(true);

    const address = data.get("address")?.toString().trim();
    const name = data.get("name")?.toString().trim();
    const email = data.get("email")?.toString().trim();
    const twitterUsername = data.get("twitterUsername")?.toString().trim();
    const avatarURL = email ? Users.gravatarURL(email) : null;
    const share = parseInt(data.get("share")?.toString().trim() ?? "0");

    const user = {
      address: address,
      name: name,
      email: email,
      twitterUsername: twitterUsername,
      avatarURL: avatarURL,
      share: share,
    } as User;

    await Users.create(user, userGroupId);

    setIsSubmitting(false);

    router.push(
      {
        pathname: "/usergroups/" + userGroupId,
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout
      title="Create User"
      section="projects"
      projects={projects}
      selectedProjectId={undefined}
    >
      <Header title="Edit User Group" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Add New User"
              description="Users are represented by Solana addresses, such as their wallet address. They could also be a multi-sig address owned by several users or an organization."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form action="#" method="POST" onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Public Solana Address (ex. Wallet){" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
                        placeholder="AaGhxCk3PCghrS7je44gdtWrKZGQiJRHmuJtZAv9xy6P"
                      />

                      <label
                        htmlFor="name"
                        className="block mt-4 text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
                        placeholder="John Doe"
                      />

                      <label
                        htmlFor="email"
                        className="block mt-4 text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
                        placeholder="anon@robomonkepunks.io"
                        onBlur={(e) => {
                          const { value } = e.currentTarget;
                          const email = value.toString();
                          setCurrentAvatarURL(
                            email ? Users.gravatarURL(email) : null
                          );
                        }}
                      />

                      <label
                        htmlFor="share"
                        className="block mt-4 text-sm font-medium text-gray-700"
                      >
                        Share (in percent, without decimals, 0-100%)
                      </label>
                      <input
                        type="text"
                        name="share"
                        id="share"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
                        placeholder="50"
                      />

                      <label
                        htmlFor="twitterUsername"
                        className="block mt-4 text-sm font-medium text-gray-700"
                      >
                        Twitter URL
                      </label>
                      <input
                        type="text"
                        name="twitterUsername"
                        id="twitterUsername"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
                        placeholder="https://twitter.com/skeletoncrewrip"
                      />

                      <div className="sm:col-span-6 mt-4">
                        <label
                          htmlFor="avatar"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Avatar
                        </label>
                        <div className="relative h-12 w-12 max-w-xsblock group rounded-full bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                          {currentAvatarURL ? (
                            <Image
                              src={currentAvatarURL}
                              alt="User Avatar"
                              className="object-cover pointer-events-none"
                              layout="fill"
                            />
                          ) : (
                            <svg
                              className="h-full w-full text-gray-300"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const userGroupId = context.query.groupId?.toString();
    const projects = await Projects.all();

    if (userGroupId) {
      const userGroup = await UserGroups.withId(userGroupId);

      return {
        props: {
          projects,
          userGroupId,
          userGroup,
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
