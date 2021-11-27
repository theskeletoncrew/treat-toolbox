import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Collection, { CollectionType } from "../../../models/collection";
import TraitSet from "../../../models/traitSet";
import Trait, { Traits } from "../../../models/trait";
import TraitValue, { TraitValues } from "../../../models/traitValue";
import ImageLayer, { ImageLayers } from "../../../models/imageLayer";
import { useState } from "react";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Props {
  imageLayer: ImageLayer;
  projectId: string;
  collection: Collection;
  imageLayers: ImageLayer[];
  traitSets: TraitSet[];
  initialTraits: Trait[];
  initialTraitValues: TraitValue[];
}

export const ArtworkForm: React.FC<Props> = ({
  imageLayer,
  projectId,
  collection,
  imageLayers,
  traitSets,
  initialTraits,
  initialTraitValues,
}) => {
  const schema = yup
    .object({
      traitSetId:
        traitSets.length > 0
          ? yup
              .string()
              .notOneOf(["-1"], "This field is required")
              .required("This field is required")
          : yup.string().notRequired(),
      traitId: yup
        .string()
        .notOneOf(["-1"], "This field is required")
        .required("This field is required"),
      traitValueId: yup
        .string()
        .notOneOf(["-1"], "This field is required")
        .required("This field is required"),
      companionLayerId: yup.string().notRequired(),
      companionLayerZIndex: yup.mixed().when("companionLayerId", {
        is: (companionLayerId: any) => companionLayerId != "-1",
        then: yup
          .number()
          .typeError("Must be a positive number")
          .positive("Must be a positive number")
          .required("Must be a positive number"),
      }),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ImageLayer>({
    resolver: yupResolver(schema),
    defaultValues: imageLayer ?? {},
  });

  const router = useRouter();

  const onSubmit = async (data: ImageLayer) => {
    if (!imageLayer) {
      return false;
    }

    await ImageLayers.update(data, imageLayer.id, projectId, collection.id);

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

    return true;
  };

  const [selectedTraitSetId, setSelectedTraitSetId] = useState<string | null>(
    imageLayer.traitSetId
  );
  const [selectedTraitId, setSelectedTraitId] = useState<string | null>(
    imageLayer.traitId
  );
  const [traits, setTraits] = useState(initialTraits);
  const [traitValues, setTraitValues] = useState(initialTraitValues);

  const onChangeTraitSetId = async (traitSetId: string) => {
    setSelectedTraitSetId(traitSetId);
    if (traitSetId == "-1") {
      setTraits(Array<Trait>());
    } else {
      const traits = await Traits.all(projectId, collection.id);
      const filteredTraits = traits.filter((trait) => {
        return trait.traitSetIds.includes(traitSetId);
      });
      setTraits(filteredTraits);
    }
  };

  const onChangeTraitId = async (traitId: string) => {
    setSelectedTraitId(traitId);
    if (traitId == "-1") {
      setTraitValues(Array<TraitValue>());
    } else {
      const values = await TraitValues.all(projectId, collection.id, traitId);
      setTraitValues(values);
    }
  };

  if (collection.type == CollectionType.Prerendered) {
    return (
      <div className="shadow sm:rounded-md sm:overflow-hidden">
        <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Background-1"
              value={imageLayer.name}
              disabled
              className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <TTForm handleSubmit={handleSubmit} submit={onSubmit}>
        <div className="shadow sm:rounded-md sm:overflow-hidden">
          <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                placeholder="Background-1"
                value={imageLayer.name}
                disabled
                className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent bg-gray-50 text-gray-500"
              />

              {errors.name && (
                <span className=" text-red-800 text-xs">
                  {errors.name.message}
                </span>
              )}
            </div>

            {traitSets.length == 0 ? (
              ""
            ) : (
              <div>
                <label
                  htmlFor="traitSetId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Associated Trait Set
                </label>
                <select
                  id="traitSetId"
                  {...register("traitSetId")}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  defaultValue={imageLayer.traitSetId ?? "-1"}
                  onChange={(e) => {
                    const { value } = e.currentTarget;
                    const traitId = value.toString();
                    if (traitId) {
                      onChangeTraitSetId(traitId);
                    }
                  }}
                >
                  <option value="-1">Unassigned</option>
                  {traitSets.map((traitSet) => (
                    <option key={traitSet.id} value={traitSet.id}>
                      {traitSet.name}
                    </option>
                  ))}
                </select>

                {errors.traitSetId && (
                  <span className=" text-red-800 text-xs">
                    {errors.traitSetId.message}
                  </span>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="traitId"
                className="block text-sm font-medium text-gray-700"
              >
                Associated Trait
              </label>
              <select
                id="traitId"
                {...register("traitId")}
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

              {errors.traitId && (
                <span className=" text-red-800 text-xs">
                  {errors.traitId.message}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="traitValueId"
                className="block text-sm font-medium text-gray-700"
              >
                Associated Trait Value
              </label>
              <select
                id="traitValueId"
                {...register("traitValueId")}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                defaultValue={imageLayer.traitValueId ?? ""}
              >
                <option value="-1">Unassigned</option>
                {traitValues.map((traitValue) => (
                  <option key={traitValue.id} value={traitValue.id}>
                    {traitValue.name}
                  </option>
                ))}
              </select>

              {errors.traitValueId && (
                <span className=" text-red-800 text-xs">
                  {errors.traitValueId.message}
                </span>
              )}
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
                {...register("companionLayerId")}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                defaultValue={imageLayer.companionLayerId ?? ""}
              >
                <option key={"-1"} value="-1">
                  None
                </option>
                {imageLayers.map((imageLayer) => (
                  <option key={imageLayer.id} value={imageLayer.id}>
                    {imageLayer.name}
                  </option>
                ))}
              </select>

              {errors.companionLayerId && (
                <span className=" text-red-800 text-xs">
                  {errors.companionLayerId.message}
                </span>
              )}
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
                id="companionLayerZIndex"
                {...register("companionLayerZIndex")}
                placeholder="0"
                defaultValue={imageLayer.companionLayerZIndex ?? ""}
                className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
              />

              {errors.companionLayerZIndex && (
                <span className=" text-red-800 text-xs">
                  {errors.companionLayerZIndex.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </TTForm>
    );
  }
};
