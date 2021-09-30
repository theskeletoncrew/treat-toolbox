import Layout from "../../../../../../../../components/Layout";
import Header from "../../../../../../../../components/Header";
import FormDescription from "../../../../../../../../components/FormDescription";
import { GetServerSideProps } from "next";
import Project, { Projects } from "../../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../../models/traitValue";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  trait: Trait;
  traitValues: TraitValue[];
}

export default function CreatePage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const trait = props.trait;
  const traitValues = props.traitValues;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    setIsSubmitting(true);

    const values = data
      .get("values")
      ?.toString()
      .trim()
      .split("\n")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (values && values.length > 1) {
      for (let i = 0; i < values?.length; i++) {
        const traitValue = {
          name: values[i],
          rarity: -1,
        } as TraitValue;

        await TraitValues.create(
          traitValue,
          project.id,
          collection.id,
          trait.id
        );
      }
    } else {
      alert(
        "You did not enter more than 1 valid value. Make sure values are separated by newlines"
      );
    }

    setIsSubmitting(false);

    router.push(
      {
        pathname:
          "/projects/" +
          project.id +
          "/collections/" +
          collection.id +
          "/traits/" +
          trait.id,
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

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
              description={
                "Add values for your '" +
                trait?.name +
                "' trait. Each value should be on its own line. These values are intended for unique, metadata-only traits (ex. names) where each NFT would get assigned one of these values. So if you are generating 10,000 NFTs for your drop, you should provide (at least) 10,000 values."
              }
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
                        Values
                      </label>
                      <textarea
                        name="values"
                        id="values"
                        rows={15}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
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
    const traitId = context.query.traitId?.toString();

    if (projectId && collectionId && traitId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const trait = await Traits.withId(projectId, collectionId, traitId);
      const traitValues = await TraitValues.all(
        projectId,
        collectionId,
        traitId
      );
      const project = projects.find((project) => project.id == projectId);

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          trait: trait,
          traitValues: traitValues,
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
