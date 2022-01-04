import Layout from "../../../../../../../../components/Layout";
import Header from "../../../../../../../../components/Header";
import FormDescription from "../../../../../../../../components/FormDescription";
import { DestructiveModal } from "../../../../../../../../components/DestructiveModal";
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
import Papaparse, { LocalFile } from "papaparse";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  trait: Trait;
  traitValues: TraitValue[];
}

type TraitValueCSVRow = [traitValue: string, rarity: string];
type ParsedTraitValues = { value: string; rarity: number }[];
type TraitIdentifier = {
  projectId: string;
  collectionId: string;
  traitId: string;
};

const updateTraitValues = async (
  parsedTraitValues: ParsedTraitValues,
  identifier: TraitIdentifier,
  existingTraitValues: TraitValue[]
) => {
  const totalRarity = parsedTraitValues.reduce(
    (sum, { rarity }) => sum + rarity,
    0
  );
  const expectedTotal = 1;
  if (totalRarity.toFixed(10) !== expectedTotal.toFixed(10)) {
    const message = `Total rarity did not add up to 1, got ${totalRarity.toFixed(
      2
    )} instead.`;
    alert(message);
    throw new Error(message);
  }

  const { projectId, collectionId, traitId } = identifier;
  const createTraitValues = parsedTraitValues.map(async ({ value, rarity }) => {
    const traitValue = {
      name: value,
      rarity,
    } as TraitValue;

    const existingTraitValue = existingTraitValues.find(
      ({ name }) => name === value
    );
    if (existingTraitValue) {
      return await TraitValues.update(
        traitValue,
        existingTraitValue.id,
        projectId,
        collectionId,
        traitId
      );
    } else {
      return await TraitValues.create(
        traitValue,
        projectId,
        collectionId,
        traitId
      );
    }
  });

  await Promise.all(createTraitValues);
};

const parseTraitValues = async (
  file: LocalFile
): Promise<ParsedTraitValues> => {
  return new Promise((resolve, reject) => {
    Papaparse.parse(file, {
      skipEmptyLines: true,
      complete: (results: Papaparse.ParseResult<TraitValueCSVRow>) => {
        const { data: rows } = results;
        const traitValueMap = rows.map(([traitValue, rarity]) => ({
          value: traitValue,
          rarity: parseFloat(rarity),
        }));
        resolve(traitValueMap);
      },
      error: reject,
    });
  });
};

export default function ImportTraitValuesPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const trait = props.trait;
  const traitValues = props.traitValues;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [okayToOverwrite, setOkayToOverwrite] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const submitTraitValues = async () => {
    if (!selectedFiles) {
      return;
    }

    const files = Array.from(selectedFiles);
    try {
      const parsedTraitValues = await parseTraitValues(files[0]);
      await updateTraitValues(
        parsedTraitValues,
        {
          projectId: project.id,
          collectionId: collection.id,
          traitId: trait.id,
        },
        traitValues
      );

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
    } catch (e) {
      console.log("file error: " + e);
      setIsSubmitting(false);
      setDeleteModalOpen(false);
      setOkayToOverwrite(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFiles) {
      return;
    }

    if (traitValues.length && !okayToOverwrite && !deleteModalOpen) {
      // We have existing traits that are going to be overwritten.
      // Confirm with user before we do this!
      setDeleteModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    await submitTraitValues();
  };

  return (
    <Layout
      title="Import Trait Values"
      section="collections"
      projects={projects}
      selectedProjectId={project.id}
    >
      <Header title="Import Trait Values" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Project"
              description={
                "Import values for your '" +
                trait?.name +
                "' trait. Provide us a csv-formatted file where each line looks like: `VALUE_NAME,RARITY`, where `RARITY` is decimal (.1 == 10%). The sum of all RARITY values should be 1."
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
                        Upload File
                      </label>
                      <label
                        htmlFor="files"
                        className="cursor-pointer w-full mt-1 flex justify-center px-6 pt-20 pb-20 border-2 border-gray-300 border-dashed rounded-md"
                      >
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-18 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="relative bg-white rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            Upload CSV file
                          </span>
                          <input
                            id="files"
                            name="files"
                            type="file"
                            className="sr-only"
                            accept=".csv"
                            onChange={(e) => setSelectedFiles(e.target.files)}
                          />
                          <p className="text-xs text-gray-500 pb-5">
                            Please select a file with comma-separated values.
                          </p>
                          <p className="text-xs text-gray-500 pb-5">
                            {selectedFiles
                              ? "[" + selectedFiles?.length + " files selected]"
                              : ""}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <DestructiveModal
        title="Overwrite existing trait values"
        message={`Are you sure you want to replace all existing trait values and rarities with those in the uploaded list? This action cannot be undone.`}
        deleteButtonTitle="Overwrite"
        deleteAction={() => {
          setOkayToOverwrite(true);
          submitTraitValues();
        }}
        cancelAction={() => {
          setOkayToOverwrite(false);
          setDeleteModalOpen(false);
        }}
        show={deleteModalOpen}
      />
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
