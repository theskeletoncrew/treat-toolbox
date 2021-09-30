import Layout from "../../../components/Layout";
import Header from "../../../components/Header";
import FormDescription from "../../../components/FormDescription";
import Project, { Projects } from "../../../models/project";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import UserGroup, { UserGroups } from "../../../models/userGroup";

interface Props {
  projects: Project[];
  userGroup: UserGroup;
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const userGroup = props.userGroup;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    setIsSubmitting(true);

    const name = data.get("name")?.toString().trim();

    await UserGroups.update(
      {
        name: name,
      },
      userGroup.id
    );

    setIsSubmitting(false);

    router.push(
      {
        pathname: "/usergroups",
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout
      title="Create Project"
      section="projects"
      projects={projects}
      selectedProjectId={undefined}
    >
      <Header title="Edit User Group" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="User Group"
              description="User Groups are a collection of addresses that represent users. These are useful for assigning owners to a project, recipients for an airdrop, etc."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form action="#" method="POST" onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Group Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={userGroup.name}
                        placeholder="NFT Launch DAO Admins"
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
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
    const groupId = context.query.groupId?.toString();

    if (groupId) {
      const projects = await Projects.all();
      const userGroup = await UserGroups.withId(groupId);

      return {
        props: {
          projects,
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
