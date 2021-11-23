import Header from "../../../../../../../components/Header";
import Layout from "../../../../../../../components/Layout";
import FormDescription from "../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import TraitSet, { TraitSets } from "../../../../../../../models/traitSet";
import Trait, { Traits } from "../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../models/traitValue";
import Conflict, { Conflicts } from "../../../../../../../models/conflict";
import { ConflictForm } from "../../../../../../../components/Forms/Conflict";
import { GetServerSideProps } from "next";

interface Props {
  projects: Project[];
  collection: Collection;
  conflict: Conflict;
  traitSets: TraitSet[];
  traits: Trait[];
  traitsDict: { [traitSetId: string]: Trait[] };
  traitValuesDict: { [traitId: string]: TraitValue[] };
  projectId: string;
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const collection = props.collection;
  const conflict = props.conflict;
  const traitSets = props.traitSets;
  const traits = props.traits;
  const traitsDict = props.traitsDict;
  const traitValuesDict = props.traitValuesDict;
  const projectId = props.projectId;

  return (
    <Layout
      title="Edit Conflict"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Edit Conflict" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Conflict"
              description="Enter details about your conflict."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <ConflictForm
                isEdit={true}
                conflict={conflict}
                projectId={projectId}
                collectionId={collection.id}
                traitSets={traitSets}
                traits={traits}
                traitsDict={traitsDict}
                traitValuesDict={traitValuesDict}
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
    const conflictId = context.query.conflictId?.toString();

    if (projectId && collectionId && conflictId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const traitSets = await TraitSets.all(projectId, collectionId);

      const conflict = await Conflicts.withId(
        conflictId,
        projectId,
        collectionId
      );

      const traits = await Traits.all(
        projectId,
        collectionId,
        "name",
        "asc",
        true
      );

      const traitsDict: { [traitSetId: string]: Trait[] } = {};
      if (traitSets.length == 0) {
        traitsDict["-1"] = traits;
      } else {
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
          projects: projects,
          collection: collection,
          conflict: conflict,
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
