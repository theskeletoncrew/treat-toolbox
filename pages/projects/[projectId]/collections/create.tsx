import FormDescription from "../../../../components/FormDescription";
import Header from "../../../../components/Header";
import Layout from "../../../../components/Layout";
import Project, { Projects } from "../../../../models/project";
import UserGroup, { UserGroups } from "../../../../models/userGroup";
import { CollectionForm } from "../../../../components/Forms/Collection";
import { GetServerSideProps } from "next";

interface Props {
  project: Project;
  projects: Project[];
  projectId: string;
  userGroups: UserGroup[];
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const projectId = props.projectId;
  const userGroups = props.userGroups;

  return (
    <Layout
      title="Create Drop"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Create a New Drop" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Drop"
              description="Enter details about your launch."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <CollectionForm projectId={projectId} userGroups={userGroups} />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId;
    const projects = await Projects.all();
    const userGroups = await UserGroups.all();

    return {
      props: {
        projects: projects,
        projectId: projectId,
        userGroups: userGroups,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
