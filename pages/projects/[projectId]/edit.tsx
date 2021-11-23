import Layout from "../../../components/Layout";
import Project, { Projects } from "../../../models/project";
import Header from "../../../components/Header";
import FormDescription from "../../../components/FormDescription";
import { GetServerSideProps } from "next";
import { ProjectForm } from "../../../components/Forms/Project";

interface Props {
  projects: Project[];
  project: Project;
  projectId: string;
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const project = props.project;
  const projectId = props.projectId;

  return (
    <Layout
      title="Edit Project"
      section="projects"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Edit Project" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Project"
              description="Edit information about your project."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <ProjectForm isEdit={true} project={project} />
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
    const project = projects.find((project) => project.id == projectId);

    return {
      props: {
        projects,
        project,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
