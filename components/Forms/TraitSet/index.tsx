import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import TraitSet, { TraitSets } from "../../../models/traitSet";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Props {
  isEdit?: boolean;
  traitSet?: TraitSet | null;
  projectId: string;
  collectionId: string;
}

interface ITraitSet {
  id: string;
  name: string;
  supply: number;
  metadataEntry1Title: string;
  metadataEntry1Value: string;
  metadataEntry2Title: string;
  metadataEntry2Value: string;
}

const schema = yup
  .object({
    name: yup.string().trim().required("This field is required"),
    supply: yup
      .number()
      .typeError("Must be a positive whole number")
      .positive("Must be a positive whole number")
      .required("This field is required"),
    metadataEntry1Title: yup.string().trim(),
    metadataEntry1Value: yup.string().trim(),
    metadataEntry2Title: yup.string().trim(),
    metadataEntry2Value: yup.string().trim(),
  })
  .required();

export const TraitSetForm: React.FC<Props> = ({
  isEdit = false,
  traitSet = null,
  projectId,
  collectionId,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITraitSet>({
    resolver: yupResolver(schema),
  });

  const router = useRouter();

  const onSubmit = async (data: ITraitSet) => {
    let metadataEntries: { [attributeTitle: string]: string } = {};
    if (data.metadataEntry1Title && data.metadataEntry1Value) {
      metadataEntries[data.metadataEntry1Title] = data.metadataEntry1Value;
    }
    if (data.metadataEntry2Title && data.metadataEntry2Value) {
      metadataEntries[data.metadataEntry2Title] = data.metadataEntry2Value;
    }

    const traitSetData = {
      name: data.name,
      supply: data.supply,
      metadataEntries: metadataEntries,
    } as TraitSet;

    if (isEdit) {
      if (!traitSet) {
        return false;
      }
      await TraitSets.update(
        traitSetData,
        traitSet.id,
        projectId,
        collectionId
      );
    } else {
      await TraitSets.create(traitSetData, projectId, collectionId);
    }

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/traitSets",
        query: {},
      },
      undefined,
      { shallow: false }
    );

    return true;
  };

  const entries = traitSet?.metadataEntries ?? {};
  const keys = Object.keys(entries);
  const title1 = keys.length >= 0 ? keys[0] : "";
  const value1 = keys.length >= 0 ? traitSet?.metadataEntries[title1] : "";
  const title2 = keys.length >= 1 ? keys[1] : "";
  const value2 = keys.length >= 1 ? traitSet?.metadataEntries[title2] : "";

  return (
    <TTForm handleSubmit={handleSubmit} submit={onSubmit}>
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
            id="name"
            {...register("name")}
            defaultValue={traitSet?.name}
            placeholder="Uniques Set"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
          />
          {errors.name && (
            <span className=" text-red-800 text-xs">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label htmlFor="supply" className="block text-sm font-medium">
            Supply
          </label>
          <input
            type="text"
            id="supply"
            {...register("supply")}
            defaultValue={traitSet?.supply}
            placeholder="0"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent"
          />
          {errors.supply && (
            <span className=" text-red-800 text-xs">
              {errors.supply.message}
            </span>
          )}
          <p className="text-xs text-gray-600 mt-2">
            How many items in the drop should come from this trait set?
          </p>
        </div>

        <div>
          <label
            htmlFor={"metadataTitle1"}
            className="block text-sm font-medium"
          >
            Metadata Title 1
          </label>
          <input
            type="text"
            id="metadataEntry1Title"
            {...register("metadataEntry1Title")}
            defaultValue={title1}
            placeholder="Title"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent"
          />
          {errors.metadataEntry1Title && (
            <span className=" text-red-800 text-xs">
              {errors.metadataEntry1Title?.message}
            </span>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Title for attribute 1 to add to metadata for NFTs in this set (or
            leave blank)
          </p>
        </div>

        <div>
          <label
            htmlFor="metadataEntry1Value"
            className="block text-sm font-medium"
          >
            Metadata Value 1
          </label>
          <input
            type="text"
            id={"metadataEntry1Value"}
            {...register("metadataEntry1Value")}
            defaultValue={value1}
            placeholder="Value"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent"
          />
          {errors.metadataEntry1Value && (
            <span className=" text-red-800 text-xs">
              {errors.metadataEntry1Value?.message}
            </span>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Value for attribute 1 to add to metadata for NFTs in this set (or
            leave blank)
          </p>
        </div>

        <div>
          <label
            htmlFor={"metadataTitle2"}
            className="block text-sm font-medium"
          >
            Metadata Title 2
          </label>
          <input
            type="text"
            id="metadataEntry2Title"
            {...register("metadataEntry2Title")}
            defaultValue={title2}
            placeholder="Title"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent"
          />
          {errors.metadataEntry2Title && (
            <span className=" text-red-800 text-xs">
              {errors.metadataEntry2Title?.message}
            </span>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Title for attribute 2 to add to metadata for NFTs in this set (or
            leave blank)
          </p>
        </div>

        <div>
          <label
            htmlFor="metadataEntry2Value"
            className="block text-sm font-medium"
          >
            Metadata Value 2
          </label>
          <input
            type="text"
            id={"metadataEntry2Value"}
            {...register("metadataEntry2Value")}
            defaultValue={value2}
            placeholder="Value"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-transparent"
          />
          {errors.metadataEntry2Value && (
            <span className=" text-red-800 text-xs">
              {errors.metadataEntry2Value?.message}
            </span>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Value for attribute 2 to add to metadata for NFTs in this set (or
            leave blank)
          </p>
        </div>
      </div>
    </TTForm>
  );
};
