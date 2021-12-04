import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Collection, {
  Collections,
  CollectionType,
} from "../../../models/collection";
import UserGroup from "../../../models/userGroup";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Props {
  isEdit?: boolean;
  collection?: Collection | null;
  projectId: string;
  userGroups: UserGroup[];
}

const schema = yup
  .object({
    name: yup.string().trim().required("This field is required"),
    type: yup
      .number()
      .oneOf([
        CollectionType.Generative,
        CollectionType.Prerendered,
        // CollectionType.Tilemapped,
      ])
      .required("This field is required"),
    supply: yup
      .number()
      .typeError("Must be a positive whole number")
      .positive("Must be a positive whole number")
      .integer("Must be a positive whole number")
      .required("This field is required"),
    sellerFeeBasisPoints: yup
      .number()
      .typeError("Must be a positive whole number")
      .positive("Must be a positive whole number")
      .integer("Must be a positive whole number")
      .required("This field is required"),
    symbol: yup
      .string()
      .trim()
      .uppercase()
      .max(10, "Symbol must be 10 characters or less")
      .required("This field is required"),
    url: yup
      .string()
      .trim()
      .test("template-url", "Must be a valid url", (value, _) => {
        const testURL = value?.replace(/{{([\w ]*)}}/g, "-") ?? "";
        return yup
          .object({ url: yup.string().url().required() })
          .isValidSync({ url: testURL });
      })
      .required("Must be a valid url"),
    userGroupId: yup.string().trim().required("This field is required"),
    nftName: yup.string().trim().required("This field is required"),
  })
  .required();

export const CollectionForm: React.FC<Props> = ({
  isEdit = false,
  collection = null,
  projectId,
  userGroups,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Collection>({
    resolver: yupResolver(schema),
    defaultValues: collection ?? {},
  });

  const router = useRouter();
  const onSubmit = async (data: Collection) => {
    if (isEdit) {
      if (!collection) {
        return false;
      }
      await Collections.update(data, collection.id, projectId);
    } else {
      await Collections.create(data, projectId);
    }

    router.push(
      {
        pathname: "/projects/" + projectId,
        query: {},
      },
      undefined,
      { shallow: false }
    );

    return true;
  };

  return (
    <TTForm handleSubmit={handleSubmit} submit={onSubmit}>
      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Collection Name
          </label>
          <input
            type="text"
            {...register("name")}
            id="name"
            placeholder="Skulls 2021"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
          />
          {errors.name && (
            <span className=" text-red-800 text-xs">{errors.name.message}</span>
          )}
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="nftName"
            className="block text-sm font-medium text-gray-700"
          >
            NFT Name
          </label>
          <input
            type="text"
            {...register("nftName")}
            id="nftName"
            placeholder="Name of NFT in JSON File"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
          />
          {errors.nftName && (
            <span className=" text-red-800 text-xs">
              {errors.nftName.message}
            </span>
          )}
          <p className="mt-2 text-xs text-gray-500">
            This is the name that will be shown on the NFT.
            <br />
            You can substitute NFT metadata values by using the format:
            &#123;&#123;METADATA_TITLE&#125;&#125; or
            &#123;&#123;NUMBER&#125;&#125; for item number
          </p>
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Collection Type
          </label>
          <select
            {...register("type")}
            id="type"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
          >
            <option value={CollectionType.Generative}>Generative</option>
            <option value={CollectionType.Prerendered}>Prerendered</option>
            {/* <option value={CollectionType.Tilemapped}>Tilemapped</option> */}
          </select>
          {errors.type && (
            <span className=" text-red-800 text-xs">{errors.type.message}</span>
          )}
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="supply"
            className="block text-sm font-medium text-gray-700"
          >
            Supply
          </label>
          <input
            type="text"
            {...register("supply")}
            id="supply"
            placeholder="10000"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
          />
          {errors.supply && (
            <span className=" text-red-800 text-xs">
              {errors.supply.message}
            </span>
          )}
          <p className="mt-2 text-xs text-gray-500">
            This is the number of NFTs that will be available for sale
          </p>
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="sellerFeeBasisPoints"
            className="block text-sm font-medium text-gray-700"
          >
            Seller Fee Basis Points (ex. 500 for 5%)
          </label>
          <input
            type="text"
            {...register("sellerFeeBasisPoints")}
            id="sellerFeeBasisPoints"
            placeholder="500"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
          />
          {errors.sellerFeeBasisPoints && (
            <span className=" text-red-800 text-xs">
              {errors.sellerFeeBasisPoints.message}
            </span>
          )}
          <p className="mt-2 text-xs text-gray-500">
            This is the fee on secondary market sales creators will split (enter
            &ldquo;500&rdquo; for 5%)
          </p>
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="symbol"
            className="block text-sm font-medium text-gray-700"
          >
            Symbol
          </label>
          <input
            type="text"
            {...register("symbol")}
            id="symbol"
            placeholder="SKULL"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
          />
          {errors.symbol && (
            <span className=" text-red-800 text-xs">
              {errors.symbol.message}
            </span>
          )}
        </div>

        <div>
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700"
            >
              External NFT URL
            </label>
            <input
              type="text"
              {...register("url")}
              id="url"
              className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
              placeholder="https://skeletoncrew.rip/skulls/{{NUMBER}}"
            />
            <p className="mt-2 text-xs text-gray-500">
              This is the external url used for each NFT
              <br />
              You can substitute NFT metadata values by using the format:
              &#123;&#123;METADATA_TITLE&#125;&#125; or
              &#123;&#123;NUMBER&#125;&#125; for item number
            </p>
          </div>
          {errors.url && (
            <span className=" text-red-800 text-xs">{errors.url.message}</span>
          )}
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="creators"
            className="block text-sm font-medium text-gray-700"
          >
            Creators
          </label>
          <select
            {...register("userGroupId")}
            id="userGroupId"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
          >
            <option value="">Unassigned</option>
            {userGroups.map((userGroup) => {
              return (
                <option key={userGroup.id} value={userGroup.id}>
                  {userGroup.name}
                </option>
              );
            })}
          </select>
          {errors.userGroupId && (
            <span className=" text-red-800 text-xs">
              {errors.userGroupId.message}
            </span>
          )}
        </div>
      </div>
    </TTForm>
  );
};
