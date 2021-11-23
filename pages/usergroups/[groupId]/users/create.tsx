import Header from "../../../../components/Header";
import Layout from "../../../../components/Layout";
import FormDescription from "../../../../components/FormDescription";
import { GetServerSideProps } from "next";
import Project, { Projects } from "../../../../models/project";
import { UserForm } from "../../../../components/Forms/User";

interface Props {
  projects: Project[];
  userGroupId: string;
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const userGroupId = props.userGroupId;

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
              <UserForm userGroupId={userGroupId} />
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
      return {
        props: {
          projects,
          userGroupId,
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
