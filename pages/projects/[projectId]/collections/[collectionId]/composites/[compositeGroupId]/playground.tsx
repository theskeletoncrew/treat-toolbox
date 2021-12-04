import Header from "../../../../../../../components/Header";
import Layout from "../../../../../../../components/Layout";
import Link from "next/link";
import FormDescription from "../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../models/traitValue";
import ImageCompositeGroup, {
  ImageCompositeGroups,
} from "../../../../../../../models/imageCompositeGroup";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import ImageLayer, {
  ImageLayers,
} from "../../../../../../../models/imageLayer";
import { TraitValuePair } from "../../../../../../../models/imageComposite";
import Image from "next/image";

interface Props {
  projects: Project[];
  collection: Collection;
  compositeGroup: ImageCompositeGroup;
  projectId: string;
  traits: Trait[];
  traitValuesDict: { [traitId: string]: TraitValue[] };
  imageLayers: ImageLayer[];
}

interface PlaygroundLayer {
  imageLayer: ImageLayer;
  zIndex: number;
}

interface PlaygroundPair {
  trait: Trait;
  traitValue: TraitValue | null;
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const collection = props.collection;
  const compositeGroup = props.compositeGroup;
  const projectId = props.projectId;
  const traits = props.traits;
  const traitValuesDict = props.traitValuesDict;
  const imageLayers = props.imageLayers;

  const startingPlaygroundPairs = traits.map((trait) => {
    return {
      trait: trait,
      traitValue: null,
    } as PlaygroundPair;
  });

  const [traitId, setTraitId] = useState<string | null>(null);
  const [playgroundPairs, setPlaygroundPairs] = useState<PlaygroundPair[]>(
    startingPlaygroundPairs
  );
  const [playgroundImageLayers, setPlaygroundImageLayers] = useState<
    PlaygroundLayer[]
  >([]);

  const onChangeTraitId = async (traitId: string) => {
    setTraitId(traitId);
  };

  const onSetTrait = async (event: FormEvent) => {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);

    const traitId = data.get("traitId")?.toString().trim();
    const traitValueId = data.get("traitValueId")?.toString().trim();

    if (!traitId || !traitValueId) {
      return;
    }

    const trait = traits.find((trait) => {
      return trait.id == traitId;
    });

    if (trait) {
      const traitValue = traitValuesDict[trait.id].find((value) => {
        return value.id == traitValueId;
      });

      const newTraitValuePair = {
        trait: trait,
        traitValue: traitValue,
      } as PlaygroundPair;

      const existingPairIndex = playgroundPairs.findIndex((pair) => {
        return pair.trait.id == traitId;
      });

      if (existingPairIndex != -1) {
        playgroundPairs[existingPairIndex] = newTraitValuePair;
        setPlaygroundPairs(playgroundPairs);
      } else {
        setPlaygroundPairs([...playgroundPairs, newTraitValuePair]);
      }

      console.log(playgroundPairs);

      let playgroundLayers: PlaygroundLayer[] = [];

      for (let i = 0; i < playgroundPairs.length; i++) {
        const pair = playgroundPairs[i];

        const imageLayer = imageLayers.find((layer) => {
          return (
            layer.traitId == pair.trait.id &&
            layer.traitValueId == pair.traitValue?.id
          );
        });

        if (!imageLayer) {
          continue;
        }

        const playgroundLayer = {
          imageLayer: imageLayer,
          zIndex: pair.trait.zIndex,
        } as PlaygroundLayer;

        playgroundLayers.push(playgroundLayer);

        const companionLayerId = imageLayer.companionLayerId;
        const companionLayerZIndex = imageLayer.companionLayerZIndex;
        if (!companionLayerId || !companionLayerZIndex) {
          continue;
        }

        const companionLayer = imageLayers.find((layer) => {
          return layer.id == imageLayer?.companionLayerId;
        });

        const companionPlaygroundLayer = {
          imageLayer: companionLayer,
          zIndex: companionLayerZIndex,
        } as PlaygroundLayer;
        playgroundLayers.push(companionPlaygroundLayer);
      }

      setPlaygroundImageLayers([]);
      setPlaygroundImageLayers(playgroundLayers);

      console.log(playgroundLayers);
    }

    setTraitId(null);

    const traitIdElem = document.getElementById("traitId") as HTMLInputElement;
    if (traitIdElem) {
      traitIdElem.value = "-1";
    }
  };

  return (
    <Layout
      title="Create Composite"
      section="composites"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Create a Composite" />
      <div className="mt-4 mr-8 float-right">
        <Link
          href={
            "/projects/" +
            projectId +
            "/collections/" +
            collection.id +
            "/composites/" +
            compositeGroup.id
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
      <main className="px-8 py-12 mt-4">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div>
              <FormDescription
                title="Composite"
                description="Enter details about your NFT."
              >
                <div
                  id="imageContainer"
                  className="relative px-6 w-96 h-96 mt-4 border border-gray-300"
                >
                  {playgroundImageLayers
                    .sort((pairA, pairB) => {
                      return pairA.zIndex < pairB.zIndex
                        ? -1
                        : pairA.zIndex == pairB.zIndex
                        ? 0
                        : 1;
                    })
                    .map((pair) => (
                      <div
                        key={pair.imageLayer.id}
                        className="absolute top-0 left-0"
                      >
                        {pair.imageLayer?.url ? (
                          <Image
                            src={pair.imageLayer?.url ?? ""}
                            alt={"Layer" + pair.zIndex}
                            width="384"
                            height="384"
                            unoptimized
                          />
                        ) : (
                          ""
                        )}
                        <br />
                      </div>
                    ))}
                </div>
                <ul>
                  {playgroundPairs
                    .sort((pairA, pairB) => {
                      return pairA.trait.zIndex < pairB.trait.zIndex
                        ? -1
                        : pairA.trait.zIndex == pairB.trait.zIndex
                        ? 0
                        : 1;
                    })
                    .map((pair, i) => (
                      <li
                        key={i}
                        className="border-2 rounded-lg text-center p-4 float-left m-4"
                      >
                        <strong>{pair.trait.name.toUpperCase()}</strong>
                        <br />
                        {pair.traitValue?.name ?? "None"}
                      </li>
                    ))}
                </ul>
              </FormDescription>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form action="#" method="POST" onSubmit={onSetTrait}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <label
                        htmlFor="traitId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Trait
                      </label>

                      <select
                        id="traitId"
                        name="traitId"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue="-1"
                        onChange={(e) => {
                          const { value } = e.currentTarget;
                          const traitId = value.toString();
                          if (traitId) {
                            onChangeTraitId(traitId);
                          }
                        }}
                      >
                        <option value="-1">Unassigned</option>
                        {traits.map((trait) => (
                          <option key={trait.id} value={trait.id}>
                            {trait.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="traitValue"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Associated Trait Value
                      </label>
                      <select
                        id="traitValueId"
                        name="traitValueId"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue=""
                      >
                        <option key={"-1"} value="-1"></option>
                        {(traitId ? traitValuesDict[traitId] : []).map(
                          (traitValue) => (
                            <option key={traitValue.id} value={traitValue.id}>
                              {traitValue.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Set
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
    const compositeGroupId = context.query.compositeGroupId?.toString();

    if (projectId && collectionId && compositeGroupId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const compositeGroup = await ImageCompositeGroups.withId(
        compositeGroupId,
        projectId,
        collectionId
      );
      const traits = await Traits.all(projectId, collectionId, "name");
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
      const imageLayers = await ImageLayers.all(projectId, collection.id);

      return {
        props: {
          projects: projects,
          collection: collection,
          compositeGroup: compositeGroup,
          projectId: projectId,
          traits: traits,
          traitValuesDict: traitValuesDict,
          imageLayers: imageLayers,
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
