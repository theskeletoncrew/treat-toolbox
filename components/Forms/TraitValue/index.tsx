import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Trait from "../../../models/trait";
import TraitValue, { TraitValues } from "../../../models/traitValue";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Props {
  isEdit?: boolean;
  traitValue?: TraitValue | null;
  projectId: string;
  collectionId: string;
  trait: Trait;
}

export const TraitValueForm: React.FC<Props> = ({
  isEdit = false,
  traitValue = null,
  projectId,
  collectionId,
  trait,
}) => {
  const schema = yup
    .object({
      name: yup.string().trim().required("This field is required"),
      rarity: trait.isAlwaysUnique
        ? yup.number().notRequired()
        : yup
            .number()
            .typeError("Must be a number between 0 and 1")
            .positive("Must be a number between 0 and 1")
            .max(1, "Must be a number between 0 and 1")
            .required("This field is required"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TraitValue>({
    resolver: yupResolver(schema),
    defaultValues: traitValue ?? {},
  });

  const router = useRouter();

  const onSubmit = async (data: TraitValue) => {
    if (isEdit) {
      if (!traitValue) {
        return false;
      }

      await TraitValues.update(
        data,
        traitValue.id,
        projectId,
        collectionId,
        trait.id
      );
    } else {
      await TraitValues.create(data, projectId, collectionId, trait.id);
    }

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/traits/" +
          trait.id,
        query: {},
      },
      undefined,
      { shallow: false }
    );

    return true;
  };

  return (
    <TTForm handleSubmit={handleSubmit} submit={onSubmit}>
      <div className="shadow sm:rounded-md sm:overflow-hidden">
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
              placeholder="Blue"
              className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
            />
            {errors.name && (
              <span className=" text-red-800 text-xs">
                {errors.name.message}
              </span>
            )}
          </div>

          {trait.isAlwaysUnique ? (
            ""
          ) : (
            <div>
              <label
                htmlFor="rarity"
                className="block text-sm font-medium text-gray-700"
              >
                Rarity
              </label>
              <input
                type="text"
                {...register("rarity")}
                id="rarity"
                placeholder="0.5"
                className="mt-1 w-20 block shadow-sm sm:text-sm rounded-md"
              />
              {errors.rarity && (
                <span className=" text-red-800 text-xs">
                  {errors.rarity.message}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </TTForm>
  );
};
