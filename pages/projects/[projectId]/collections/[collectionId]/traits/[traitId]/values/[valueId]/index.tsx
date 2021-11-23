import Layout from "../../../../../../../../../components/Layout";
import Header from "../../../../../../../../../components/Header";
import FormDescription from "../../../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../../../models/traitValue";
import { TraitValueForm } from "../../../../../../../../../components/Forms/TraitValue";
import { GetServerSideProps } from "next";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  trait: Trait;
  traitValue: TraitValue;
}

export default function EditPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const trait = props.trait;
  const traitValue = props.traitValue;

  return (
    <Layout
      title="Trait Values"
      section="collections"
      projects={projects}
      selectedProjectId={project.id}
    >
      <Header title="Edit Value" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Trait Value"
              description={
                "Edit the value for your '" + trait.name + "' trait."
              }
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <TraitValueForm
                isEdit={true}
                traitValue={traitValue}
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
    const valueId = context.query.valueId?.toString();

    if (projectId && collectionId && traitId && valueId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const trait = await Traits.withId(projectId, collectionId, traitId);
      const traitValue = await TraitValues.withId(
        projectId,
        collectionId,
        traitId,
        valueId
      );
      const project = projects.find((project) => project.id == projectId);

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          trait: trait,
          traitValue: traitValue,
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
