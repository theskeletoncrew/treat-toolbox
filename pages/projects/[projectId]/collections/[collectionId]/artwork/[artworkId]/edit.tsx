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
import TraitSet, { TraitSets } from "../../../../../../../models/traitSet";
import Trait, { Traits } from "../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../models/traitValue";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { ArtworkForm } from "../../../../../../../components/Forms/Artwork";

interface Props {
  projects: Project[];
  projectId: string;
  collection: Collection;
  imageLayer: ImageLayer;
  imageLayers: ImageLayer[];
  traitSets: TraitSet[];
  initialTraits: Trait[];
  initialTraitValues: TraitValue[];
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const projectId = props.projectId;
  const collection = props.collection;
  const imageLayer = props.imageLayer;
  const imageLayers = props.imageLayers;
  const traitSets = props.traitSets;
  const initialTraits = props.initialTraits;
  const initialTraitValues = props.initialTraitValues;

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
              <ArtworkForm
                imageLayer={imageLayer}
                projectId={projectId}
                collection={collection}
                imageLayers={imageLayers}
                traitSets={traitSets}
                initialTraits={initialTraits}
                initialTraitValues={initialTraitValues}
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
    const imageLayerId = context.query.artworkId?.toString();

    if (projectId && collectionId && imageLayerId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const traitSets = await TraitSets.all(projectId, collectionId);
      const imageLayer = await ImageLayers.withId(
        projectId,
        collectionId,
        imageLayerId
      );
      const imageLayers = await ImageLayers.all(projectId, collectionId);

      const traitSetId = imageLayer.traitSetId;
      let initialTraits: Array<Trait>;
      const traits = await Traits.all(projectId, collectionId, "name");
      if (traitSetId) {
        initialTraits = traits.filter((trait) => {
          return trait.traitSetIds.includes(traitSetId);
        });
      } else {
        initialTraits = traits;
      }

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
          traitSets: traitSets,
          initialTraits: initialTraits,
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
