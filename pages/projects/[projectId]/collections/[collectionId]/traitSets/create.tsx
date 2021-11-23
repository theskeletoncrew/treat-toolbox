import Header from "../../../../../../components/Header";
import Layout from "../../../../../../components/Layout";
import FormDescription from "../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import { GetServerSideProps } from "next";
import { TraitSetForm } from "../../../../../../components/Forms/TraitSet";

interface Props {
  projects: Project[];
  collection: Collection;
  projectId: string;
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const collection = props.collection;
  const projectId = props.projectId;

  return (
    <Layout
      title="Create Trait Sets"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Create a Trait Set" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Trait Set"
              description="Restrict a set of traits to only be combined together."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <TraitSetForm
                projectId={projectId}
                collectionId={collection.id}
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
      const collection = await Collections.withId(collectionId, projectId);

      return {
        props: {
          projects: projects,
          collection: collection,
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
