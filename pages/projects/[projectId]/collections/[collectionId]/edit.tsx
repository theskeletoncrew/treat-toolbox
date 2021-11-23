import Layout from "../../../../../components/Layout";
import Collection, { Collections } from "../../../../../models/collection";
import Project, { Projects } from "../../../../../models/project";
import UserGroup, { UserGroups } from "../../../../../models/userGroup";
import Header from "../../../../../components/Header";
import FormDescription from "../../../../../components/FormDescription";
import { CollectionForm } from "../../../../../components/Forms/Collection";
import { GetServerSideProps } from "next";

interface Props {
  projects: Project[];
  projectId: string;
  collection: Collection;
  userGroups: UserGroup[];
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const projectId = props.projectId;
  const collection = props.collection;
  const userGroups = props.userGroups;

  return (
    <Layout
      title="Edit Drop"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Edit Drop" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Drop"
              description="Enter details about your launch."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <CollectionForm
                projectId={projectId}
                collection={collection}
                userGroups={userGroups}
                isEdit={true}
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
      const userGroups = await UserGroups.all();

      return {
        props: {
          projects,
          projectId,
          collection,
          userGroups,
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
