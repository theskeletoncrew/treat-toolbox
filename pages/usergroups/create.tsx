import Layout from "../../components/Layout";
import Header from "../../components/Header";
import FormDescription from "../../components/FormDescription";
import Project, { Projects } from "../../models/project";
import { GetServerSideProps } from "next";
import { UserGroupForm } from "../../components/Forms/UserGroup";

interface Props {
  projects: Project[];
}

export default function CreatePage(props: Props) {
  const projects = props.projects;

  return (
    <Layout
      title="Create Project"
      section="projects"
      projects={projects}
      selectedProjectId={undefined}
    >
      <Header title="Create a New User Group" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="User Group"
              description="User Groups are a collection of addresses that represent users. These are useful for assigning owners to a project, recipients for an airdrop, etc."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <UserGroupForm />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
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
