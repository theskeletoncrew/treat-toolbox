import Layout from "../../../../../../../components/Layout";
import Header from "../../../../../../../components/Header";
import FormDescription from "../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import ImageLayer, {
  ImageLayers,
} from "../../../../../../../models/imageLayer";
import Trait, { Traits } from "../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../models/traitValue";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

interface Props {
  projects: Project[];
  projectId: string;
  collection: Collection;
  imageLayer: ImageLayer;
  imageLayers: ImageLayer[];
  traits: Trait[];
  initialTraitValues: TraitValue[];
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const projectId = props.projectId;
  const collection = props.collection;
  const imageLayer = props.imageLayer;
  const imageLayers = props.imageLayers;
  const traits = props.traits;
  const initialTraitValues = props.initialTraitValues;

  const [selectedTraitId, setSelectedTraitId] = useState<string | null>(
    imageLayer.traitId
  );
  const [traitValues, setTraitValues] = useState(initialTraitValues);

  const onChangeTraitId = async (traitId: string) => {
    setSelectedTraitId(traitId);
    if (traitId == "-1") {
      setTraitValues(Array<TraitValue>());
    } else {
      const values = await TraitValues.all(projectId, collection.id, traitId);
      setTraitValues(values);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    setIsSubmitting(true);

    const traitId = data.get("trait")?.toString().trim();
    const traitValueId = data.get("traitValue")?.toString().trim();
    const companionLayerId = data.get("companionLayerId")?.toString().trim();
    const companionLayerZIndex = parseInt(
      data.get("companionLayerZIndex")?.toString().trim() ?? ""
    );

    await ImageLayers.update(
      {
        url: imageLayer.url,
        name: imageLayer.name,
        bytes: imageLayer.bytes,
        traitId: traitId,
        traitValueId: traitValueId,
        companionLayerId: companionLayerId,
        companionLayerZIndex: companionLayerZIndex,
      },
      imageLayer.id,
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
          "/artwork",
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout
      title="Edit Artwork"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Edit Artwork" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Artwork"
              description="Enter details about your artwork."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form action="#" method="POST" onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Background-1"
                        value={imageLayer.name}
                        disabled
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="trait"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Associated Trait
                      </label>
                      <select
                        id="trait"
                        name="trait"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue={imageLayer.traitId ?? "-1"}
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
                        id="traitValue"
                        name="traitValue"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue={imageLayer.traitValueId ?? ""}
                      >
                        <option key={"-1"} value="-1"></option>
                        {traitValues.map((traitValue) => (
                          <option key={traitValue.id} value={traitValue.id}>
                            {traitValue.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="companionLayerId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Companion Layer
                      </label>
                      <select
                        id="companionLayerId"
                        name="companionLayerId"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        defaultValue={imageLayer.companionLayerId ?? ""}
                      >
                        <option key={"-1"} value="-1"></option>
                        {imageLayers.map((imageLayer) => (
                          <option key={imageLayer.id} value={imageLayer.id}>
                            {imageLayer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="companionLayerZIndex"
                        className="block text-sm font-medium"
                      >
                        Companion Layer Z-Index
                      </label>
                      <input
                        type="text"
                        name="companionLayerZIndex"
                        id="companionLayerZIndex"
                        placeholder="0"
                        defaultValue={imageLayer.companionLayerZIndex ?? ""}
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
    const imageLayerId = context.query.artworkId?.toString();

    if (projectId && collectionId && imageLayerId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const traits = await Traits.all(projectId, collectionId, "name");
      const imageLayer = await ImageLayers.withId(
        projectId,
        collectionId,
        imageLayerId
      );
      const imageLayers = await ImageLayers.all(projectId, collectionId);

      let initialTraitValues: Array<TraitValue>;
      if (imageLayer.traitId) {
        initialTraitValues = await TraitValues.all(
          projectId,
          collectionId,
          imageLayer.traitId
        );
      } else {
        initialTraitValues = [];
      }

      return {
        props: {
          projects: projects,
          projectId: projectId,
          collection: collection,
          imageLayer: imageLayer,
          imageLayers: imageLayers,
          traits: traits,
          initialTraitValues: initialTraitValues,
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
