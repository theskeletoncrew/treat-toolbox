import Layout from "../../../components/Layout";
import Header from "../../../components/Header";
import FormDescription from "../../../components/FormDescription";
import Project, { Projects } from "../../../models/project";
import { GetServerSideProps } from "next";
import UserGroup, { UserGroups } from "../../../models/userGroup";
import { UserGroupForm } from "../../../components/Forms/UserGroup";

interface Props {
  projects: Project[];
  userGroup: UserGroup;
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const userGroup = props.userGroup;

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
              <UserGroupForm isEdit={true} userGroup={userGroup} />
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
