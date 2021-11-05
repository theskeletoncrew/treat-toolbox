import Header from "../../../../../../../components/Header";
import Layout from "../../../../../../../components/Layout";
import FormDescription from "../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../models/trait";
import TraitSet, { TraitSets } from "../../../../../../../models/traitSet";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  traits: Trait[];
  traitSet: TraitSet;
  projectId: string;
}

export default function EditPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const traits = props.traits;
  const traitSet = props.traitSet;
  const projectId = props.projectId;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    setIsSubmitting(true);

    const name = data.get("name")?.toString().trim();

    const supplyStr = data.get("supply")?.toString().trim();
    const supply = supplyStr ? parseInt(supplyStr) : 0;

    await TraitSets.update(
      {
        name: name,
        supply: supply,
      },
      traitSet.id,
      projectId,
      collection.id
    );

    setIsSubmitting(false);

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collection.id +
          "/traitSets",
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

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
              <form action="#" method="POST" onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={traitSet.name}
                        placeholder="Uniques Set"
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="supply"
                        className="block text-sm font-medium"
                      >
                        Supply
                      </label>
                      <input
                        type="text"
                        name="supply"
                        id="supply"
                        defaultValue={traitSet.supply}
                        placeholder="0"
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        How many items in the drop should come from this trait
                        set?
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
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
      const collection = await Collections.withId(collectionId, projectId);
      const traits = await Traits.all(projectId, collectionId);
      const traitSet = await TraitSets.withId(
        projectId,
        collectionId,
        traitSetId
      );
      const project = projects.find((project) => project.id == projectId);

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          traits: traits,
          traitSet: traitSet,
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
