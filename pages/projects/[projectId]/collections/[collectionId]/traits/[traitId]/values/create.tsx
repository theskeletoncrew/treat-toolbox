import Layout from "../../../../../../../../components/Layout";
import Header from "../../../../../../../../components/Header";
import FormDescription from "../../../../../../../../components/FormDescription";
import { GetServerSideProps } from "next";
import Project, { Projects } from "../../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../../models/trait";
import { TraitValueForm } from "../../../../../../../../components/Forms/TraitValue";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  trait: Trait;
}

export default function CreatePage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const trait = props.trait;

  return (
    <Layout
      title="Trait Values"
      section="collections"
      projects={projects}
      selectedProjectId={project.id}
    >
      <Header title="Create a Value" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Project"
              description={"Add a value for your '" + trait?.name + "' trait."}
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <TraitValueForm
                projectId={project.id}
                collectionId={collection.id}
                trait={trait}
              />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();
    const traitId = context.query.traitId?.toString();

    if (projectId && collectionId && traitId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const trait = await Traits.withId(projectId, collectionId, traitId);
      const project = projects.find((project) => project.id == projectId);

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          trait: trait,
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
