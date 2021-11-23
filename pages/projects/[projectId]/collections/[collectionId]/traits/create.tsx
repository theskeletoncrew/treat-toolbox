import Header from "../../../../../../components/Header";
import Layout from "../../../../../../components/Layout";
import FormDescription from "../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../models/project";
import TraitSet, { TraitSets } from "../../../../../../models/traitSet";
import { GetServerSideProps } from "next";
import { TraitForm } from "../../../../../../components/Forms/Trait";

interface Props {
  projects: Project[];
  collectionId: string;
  traitSets: TraitSet[];
  projectId: string;
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const collectionId = props.collectionId;
  const traitSets = props.traitSets;
  const projectId = props.projectId;

  return (
    <Layout
      title="Create Traits"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Create a Trait" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Trait"
              description="Enter details about your trait."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <TraitForm
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

    if (projectId && collectionId) {
      const projects = await Projects.all();
      const traitSets = await TraitSets.all(projectId, collectionId);

      return {
        props: {
          projects: projects,
          collectionId: collectionId,
          traitSets: traitSets,
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
