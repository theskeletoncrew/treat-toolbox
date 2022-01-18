import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Conflict, {
  Conflicts,
  ConflictResolutionType,
} from "../../../models/conflict";
import TraitSet, { TraitSets } from "../../../models/traitSet";
import Trait from "../../../models/trait";
import TraitValue from "../../../models/traitValue";
import { useState } from "react";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Props {
  isEdit?: boolean;
  conflict?: Conflict | null;
  projectId: string;
  collectionId: string;
  traitSets: TraitSet[];
  traits: Trait[];
  traitsDict: { [traitSetId: string]: Trait[] };
  traitValuesDict: { [traitId: string]: TraitValue[] };
}

export const ConflictForm: React.FC<Props> = ({
  isEdit = false,
  conflict = null,
  projectId,
  collectionId,
  traitSets,
  traits,
  traitsDict,
  traitValuesDict,
}) => {
  const schema = yup
    .object({
      traitSetId:
        traitSets.length > 0
          ? yup
              .string()
              .notOneOf(["-1"], "This field is required")
              .required("This field is required")
              .transform((value) => {
                return value == "-1" ? null : value;
              })
          : yup.string().notRequired(),
      trait1Id: yup
        .string()
        .notOneOf(["-1"], "This field is required")
        .transform((value) => {
          return value == "-1" ? null : value;
        })
        .nullable(),
      trait1ValueId: yup
        .string()
        .transform((value) => {
          return value == "-1" ? null : value;
        })
        .nullable(),
      trait2Id: yup
        .string()
        .notOneOf(["-1"], "This field is required")
        .transform((value) => {
          return value == "-1" ? null : value;
        })
        .nullable(),
      trait2ValueId: yup
        .string()
        .transform((value) => {
          return value == "-1" ? null : value;
        })
        .nullable(),
      resolutionType: yup
        .number()
        .oneOf([
          ConflictResolutionType.Trait1None,
          ConflictResolutionType.Trait1Random,
          ConflictResolutionType.Trait2None,
          ConflictResolutionType.Trait2Random,
        ])
        .required("This field is required"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Conflict>({
    resolver: yupResolver(schema),
    defaultValues: conflict ?? {},
  });

  const router = useRouter();

  const onSubmit = async (data: Conflict) => {
    if (isEdit) {
      if (!conflict) {
        return false;
      }

      await Conflicts.update(data, conflict.id, projectId, collectionId);
    } else {
      await Conflicts.create(data, projectId, collectionId);
    }

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collectionId +
          "/conflicts",
        query: {},
      },
      undefined,
      { shallow: false }
    );

    return true;
  };

  const [traitSetId, setTraitSetId] = useState<string | null>(
    conflict?.traitSetId ?? null
  );
  const [trait1Id, setTrait1Id] = useState<string | null>(
    conflict?.trait1Id ?? null
  );
  const [trait2Id, setTrait2Id] = useState<string | null>(
    conflict?.trait2Id ?? null
  );

  const onChangeTraitSetId = async (traitSetId: string) => {
    setTraitSetId(traitSetId);
  };

  const onChangeTrait1Id = async (traitId: string) => {
    setTrait1Id(traitId);
  };

  const onChangeTrait2Id = async (traitId: string) => {
    setTrait2Id(traitId);
  };

  return (
    <TTForm handleSubmit={handleSubmit} submit={onSubmit}>
      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
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
                  {...register("traitSetId")}
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

                {errors.traitSetId && (
                  <span className=" text-red-800 text-xs">
                    {errors.traitSetId.message}
                  </span>
                )}
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
                {...register("trait1Id")}
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
                {(traitSetId ? traitsDict[traitSetId] ?? [] : traits).map(
                  (trait) => (
                    <option key={trait.id} value={trait.id}>
                      {trait.name}
                    </option>
                  )
                )}
              </select>

              {errors.trait1Id && (
                <span className=" text-red-800 text-xs">
                  {errors.trait1Id.message}
                </span>
              )}
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
                {...register("trait1ValueId")}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                defaultValue=""
              >
                <option key={"-1"} value="-1">
                  Any
                </option>
                {(trait1Id ? traitValuesDict[trait1Id] ?? [] : []).map(
                  (traitValue) => (
                    <option key={traitValue.id} value={traitValue.id}>
                      {traitValue.name}
                    </option>
                  )
                )}
              </select>

              {errors.trait1ValueId && (
                <span className=" text-red-800 text-xs">
                  {errors.trait1ValueId.message}
                </span>
              )}
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
                {...register("trait2Id")}
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
                {(traitSetId ? traitsDict[traitSetId] ?? [] : traits).map(
                  (trait) => (
                    <option key={trait.id} value={trait.id}>
                      {trait.name}
                    </option>
                  )
                )}
              </select>

              {errors.trait2Id && (
                <span className=" text-red-800 text-xs">
                  {errors.trait2Id.message}
                </span>
              )}
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
                {...register("trait2ValueId")}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                defaultValue=""
              >
                <option key={"-1"} value="-1">
                  Any
                </option>
                {(trait2Id ? traitValuesDict[trait2Id] ?? [] : []).map(
                  (traitValue) => (
                    <option key={traitValue.id} value={traitValue.id}>
                      {traitValue.name}
                    </option>
                  )
                )}
              </select>

              {errors.trait2ValueId && (
                <span className=" text-red-800 text-xs">
                  {errors.trait2ValueId.message}
                </span>
              )}
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
                id="resolutionType"
                {...register("resolutionType")}
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

              {errors.resolutionType && (
                <span className=" text-red-800 text-xs">
                  {errors.resolutionType.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </TTForm>
  );
};
