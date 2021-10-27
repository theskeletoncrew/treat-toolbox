import Layout from "../../../../../../../components/Layout";
import Link from "next/link";
import DropsSubnav from "../../../../../../../components/DropsSubnav";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../models/traitValue";
import { GetServerSideProps } from "next";
import ImageComposite, {
  ImageComposites,
  TraitValuePair,
} from "../../../../../../../models/imageComposite";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  compositeGroupId: string;
  composites: ImageComposite[];
  traits: Trait[];
  traitValuesDict: { [traitId: string]: TraitValue[] };
  projectId: string;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const composites = props.composites;
  const compositeGroupId = props.compositeGroupId;
  const traits = props.traits;
  const traitValuesDict = props.traitValuesDict;
  const projectId = props.projectId;

  if (!projects) {
    return " " + projectId + " ";
  } else if (composites.length == 0) {
    return (
      <Layout
        title="Composites"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="composites"
        />
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Composites"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="composites"
          />
          <main style={{ display: "inline" }}>
            <div className="mt-4 mr-8 float-right">
              <Link
                href={
                  "/projects/" +
                  projectId +
                  "/collections/" +
                  collection.id +
                  "/composites/" +
                  compositeGroupId
                }
                passHref={true}
              >
                <a>
                  <button
                    type="button"
                    className="inline-flex items-center mr-2 px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back to Composite Group
                  </button>
                </a>
              </Link>
            </div>
            {traits.map((trait) => {
              return (
                <div key={trait.id} className="m-10">
                  <h2 className="font-bold text-lg mb-4">{trait.name}</h2>
                  <table className="min-w-full divide-y divide-gray-200 border-gray-100 border-2">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80"
                        >
                          Value
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80"
                        >
                          Expected Rarity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80"
                        >
                          Actual Rarity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80"
                        >
                          Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {traitValuesDict[trait.id].map((traitValue, idx) => {
                        const numCompositesWithTraitValue = composites.filter(
                          (composite) => {
                            const traitPair: TraitValuePair | undefined =
                              composite.traits.find(
                                (compositeTraitValuePair) => {
                                  return (
                                    compositeTraitValuePair.trait.id == trait.id
                                  );
                                }
                              );
                            return traitPair?.traitValue?.id == traitValue.id;
                          }
                        ).length;

                        const rarity =
                          numCompositesWithTraitValue / composites.length;
                        const rarityRounded =
                          Math.round((rarity + Number.EPSILON) * 10000) / 10000;
                        const diff = rarity - traitValue.rarity;
                        const diffRounded =
                          Math.round((diff + Number.EPSILON) * 10000) / 10000;

                        return (
                          <tr
                            key={traitValue.id}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-6 py-3">{traitValue.name}</td>
                            <td className="px-6 py-3">{traitValue.rarity}</td>
                            <td className="px-6 py-3">
                              {rarityRounded}{" "}
                              <span className="italic text-xs">
                                ({numCompositesWithTraitValue}/
                                {composites.length})
                              </span>
                            </td>
                            {diffRounded > 0 ? (
                              <td className="px-6 py-3 text-green-700">
                                +{diffRounded}
                              </td>
                            ) : (
                              <td className="px-6 py-3 text-red-700">
                                {diffRounded}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </main>
        </div>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();
    const compositeGroupId = context.query.compositeGroupId?.toString();

    if (projectId && collectionId && compositeGroupId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const project = projects.find((project) => project.id == projectId);
      const composites = await ImageComposites.all(
        projectId,
        collectionId,
        compositeGroupId
      );

      const traits = await Traits.all(projectId, collectionId);

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
          compositeGroupId: compositeGroupId,
          composites: composites,
          traits: traits,
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
