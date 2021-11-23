import Header from "../../../../../../../components/Header";
import Layout from "../../../../../../../components/Layout";
import FormDescription from "../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../models/project";
import TraitSet, { TraitSets } from "../../../../../../../models/traitSet";
import { GetServerSideProps } from "next";
import { TraitSetForm } from "../../../../../../../components/Forms/TraitSet";

interface Props {
  projects: Project[];
  projectId: string;
  collectionId: string;
  traitSet: TraitSet;
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const projectId = props.projectId;
  const collectionId = props.collectionId;
  const traitSet = props.traitSet;

  return (
    <Layout
      title="Edit Trait Sets"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Edit Trait Set" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Trait Set"
              description="Enter details about your trait set."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <TraitSetForm
                isEdit={true}
                traitSet={traitSet}
                projectId={projectId}
                collectionId={collectionId}
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
    const traitSetId = context.query.traitSetId?.toString();

    if (projectId && collectionId && traitSetId) {
      const projects = await Projects.all();
      const traitSet = await TraitSets.withId(
        projectId,
        collectionId,
        traitSetId
      );

      return {
        props: {
          projects: projects,
          projectId: projectId,
          collectionId: collectionId,
          traitSet: traitSet,
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
