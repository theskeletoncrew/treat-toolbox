import Header from "../../components/Header";
import Layout from "../../components/Layout";
import Project, { Projects } from "../../models/project";
import FormDescription from "../../components/FormDescription";
import { ProjectForm } from "../../components/Forms/Project";
import { GetServerSideProps } from "next";

interface Props {
  projects: Project[];
  projectId: string;
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const projectId = props.projectId;

  return (
    <Layout
      title="Create Project"
      section="projects"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Create a New Project" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Project"
              description="First, setup general information about your project."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <ProjectForm />
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

    return {
      props: {
        projects,
        projectId,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
