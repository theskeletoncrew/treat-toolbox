import Header from "../../../../../../components/Header";
import Layout from "../../../../../../components/Layout";
import FormDescription from "../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import TraitSet, { TraitSets } from "../../../../../../models/traitSet";
import Trait, { Traits } from "../../../../../../models/trait";
import TraitValue, { TraitValues } from "../../../../../../models/traitValue";
import Conflict, {
  Conflicts,
  ConflictResolutionType,
} from "../../../../../../models/conflict";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  traitSets: TraitSet[];
  traits: Trait[];
  traitsDict: { [traitSetId: string]: Trait[] };
  traitValuesDict: { [traitId: string]: TraitValue[] };
  projectId: string;
}

export default function CreatePage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const traitSets = props.traitSets;
  const traits = props.traits;
  const traitsDict = props.traitsDict;
  const traitValuesDict = props.traitValuesDict;
  const projectId = props.projectId;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [traitSetId, setTraitSetId] = useState<string | null>(null);
  const [trait1Id, setTrait1Id] = useState<string | null>(null);
  const [trait2Id, setTrait2Id] = useState<string | null>(null);

  const onChangeTraitSetId = async (traitSetId: string) => {
    setTraitSetId(traitSetId);
  };

  const onChangeTrait1Id = async (traitId: string) => {
    setTrait1Id(traitId);
  };

  const onChangeTrait2Id = async (traitId: string) => {
    setTrait2Id(traitId);
  };

  const router = useRouter();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    setIsSubmitting(true);

    const traitSetId = data.get("traitSetId")?.toString().trim() ?? null;
    const trait1Id = data.get("trait1Id")?.toString().trim();
    const trait2Id = data.get("trait2Id")?.toString().trim();
    const trait1ValueId = data.get("trait1ValueId")?.toString().trim();
    const trait2ValueId = data.get("trait2ValueId")?.toString().trim();

    const resolutionTypeStr = data.get("resolution")?.toString().trim();
    const resolutionType = resolutionTypeStr ? parseInt(resolutionTypeStr) : 0;

    const conflict = {
      traitSetId: traitSetId,
      trait1Id: trait1Id,
      trait2Id: trait2Id,
      trait1ValueId: trait1ValueId == "-1" ? null : trait1ValueId,
      trait2ValueId: trait2ValueId == "-1" ? null : trait2ValueId,
      resolutionType: resolutionType,
    } as Conflict;

    await Conflicts.create(conflict, projectId, collection.id);

    setIsSubmitting(false);

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collection.id +
          "/conflicts",
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout
      title="Create Conflicts"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Create a Conflict" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Conflict"
              description="Enter details about your conflict."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form action="#" method="POST" onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    {traitSets.length == 0 ? (
                      ""
                    ) : (
                      <div>
                        <label
                          htmlFor="traitSetId"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Trait Set
                        </label>

                        <select
                          id="traitSetId"
                          name="traitSetId"
                          className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          defaultValue="-1"
                          onChange={(e) => {
                            const { value } = e.currentTarget;
                            const traitSetId = value.toString();
                            if (traitSetId) {
                              onChangeTraitSetId(traitSetId);
                            }
                          }}
                        >
                          <option value="-1">
                            {traitSets.length == 0 ? "Default" : "Unassigned"}
                          </option>
                          {traitSets.map((traitSet) => (
                            <option key={traitSet.id} value={traitSet.id}>
                              {traitSet.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label
                        htmlFor="trait1Id"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Trait 1
                      </label>

                      <select
                        id="trait1Id"
                        name="trait1Id"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue="-1"
                        onChange={(e) => {
                          const { value } = e.currentTarget;
                          const traitId = value.toString();
                          if (traitId) {
                            onChangeTrait1Id(traitId);
                          }
                        }}
                      >
                        <option value="-1">Unassigned</option>
                        {(traitSetId ? traitsDict[traitSetId] : traits).map(
                          (trait) => (
                            <option key={trait.id} value={trait.id}>
                              {trait.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="trait1ValueId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Trait 1 Value
                      </label>
                      <select
                        id="trait1ValueId"
                        name="trait1ValueId"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue=""
                      >
                        <option key={"-1"} value="-1">
                          Any
                        </option>
                        {(trait1Id ? traitValuesDict[trait1Id] : []).map(
                          (traitValue) => (
                            <option key={traitValue.id} value={traitValue.id}>
                              {traitValue.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <p className="text-gray-500 italic text-sm pl-4">
                      conflicts with...
                    </p>

                    <div>
                      <label
                        htmlFor="trait2Id"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Trait 2
                      </label>

                      <select
                        id="trait2Id"
                        name="trait2Id"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue="-1"
                        onChange={(e) => {
                          const { value } = e.currentTarget;
                          const traitId = value.toString();
                          if (traitId) {
                            onChangeTrait2Id(traitId);
                          }
                        }}
                      >
                        <option value="-1">Unassigned</option>
                        {(traitSetId ? traitsDict[traitSetId] : traits).map(
                          (trait) => (
                            <option key={trait.id} value={trait.id}>
                              {trait.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="trait2ValueId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Trait 2 Values
                      </label>
                      <select
                        id="trait2ValueId"
                        name="trait2ValueId"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue=""
                      >
                        <option key={"-1"} value="-1">
                          Any
                        </option>
                        {(trait2Id ? traitValuesDict[trait2Id] : []).map(
                          (traitValue) => (
                            <option key={traitValue.id} value={traitValue.id}>
                              {traitValue.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <p className="text-gray-500 italic text-sm pl-4">
                      if both are randomly selected...
                    </p>

                    <div>
                      <label
                        htmlFor="resolution"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Resolve by
                      </label>
                      <select
                        id="resolution"
                        name="resolution"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue="0"
                      >
                        <option
                          key={ConflictResolutionType.Trait1None.toString()}
                          value={ConflictResolutionType.Trait1None.toString()}
                        >
                          Set Trait 1 to None
                        </option>
                        <option
                          key={ConflictResolutionType.Trait2None.toString()}
                          value={ConflictResolutionType.Trait2None.toString()}
                        >
                          Set Trait 2 to None
                        </option>
                        <option
                          key={ConflictResolutionType.Trait1Random.toString()}
                          value={ConflictResolutionType.Trait1Random.toString()}
                        >
                          Choose a new random value for Trait 1
                        </option>
                        <option
                          key={ConflictResolutionType.Trait2Random.toString()}
                          value={ConflictResolutionType.Trait2Random.toString()}
                        >
                          Choose a new random value for Trait 2
                        </option>
                      </select>
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

    if (projectId && collectionId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const project = projects.find((project) => project.id == projectId);
      const traitSets = await TraitSets.all(projectId, collectionId);

      const traits = await Traits.all(
        projectId,
        collectionId,
        "name",
        "asc",
        true
      );

      const traitsDict: { [traitSetId: string]: Trait[] } = {};
      if (traitSets.length > 0) {
        for (let i = 0; i < traitSets.length; i++) {
          const traitSet = traitSets[i];
          const traitSetTraits = traits.filter((trait) => {
            return trait.traitSetIds.includes(traitSet.id);
          });
          traitsDict[traitSet.id] = traitSetTraits;
        }
      }

      const traitValuesDict: { [traitId: string]: TraitValue[] } = {};
      for (let i = 0; i < traits.length; i++) {
        const trait = traits[i];
        const traitValues = await TraitValues.all(
          projectId,
          collectionId,
          trait.id
        );
        traitValuesDict[trait.id] = traitValues;
      }

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          traitSets: traitSets,
          traits: traits,
          traitsDict: traitsDict,
          traitValuesDict: traitValuesDict,
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
