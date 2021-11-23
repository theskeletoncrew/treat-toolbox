import Header from "../../../../../../../components/Header";
import Layout from "../../../../../../../components/Layout";
import FormDescription from "../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../models/project";
import TraitSet, { TraitSets } from "../../../../../../../models/traitSet";
import Trait, { Traits } from "../../../../../../../models/trait";
import { GetServerSideProps } from "next";
import { TraitForm } from "../../../../../../../components/Forms/Trait";

interface Props {
  project: Project;
  projects: Project[];
  collectionId: string;
  traitSets: TraitSet[];
  trait: Trait;
  projectId: string;
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const collectionId = props.collectionId;
  const traitSets = props.traitSets;
  const trait = props.trait;
  const projectId = props.projectId;

  return (
    <Layout
      title="Edit Traits"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Edit Trait" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Trait"
              description="Enter details about your trait."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <TraitForm
                isEdit={true}
                trait={trait}
                projectId={projectId}
                collectionId={collectionId}
                traitSets={traitSets}
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
      const traitSets = await TraitSets.all(projectId, collectionId);
      const trait = await Traits.withId(projectId, collectionId, traitId);

      return {
        props: {
          projects: projects,
          collectionId: collectionId,
          traitSets: traitSets,
          trait: trait,
          projectId: projectId,
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
