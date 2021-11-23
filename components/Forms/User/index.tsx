import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import User, { Users } from "../../../models/user";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
const web3 = require("@solana/web3.js");

interface Props {
  userGroupId: string;
  isEdit?: boolean;
  user?: User | null;
}

const schema = yup
  .object({
    address: yup
      .string()
      .trim()
      .required("This field is required")
      .test("test-solana-address", "Invalid Solana Address", (value) => {
        try {
          new web3.PublicKey(value);
          return true;
        } catch (e) {
          return false;
        }
      }),
    name: yup.string().trim(),
    email: yup.string().email(),
    share: yup
      .number()
      .typeError("Must be a positive whole number between 0 and 100")
      .integer("Must be a positive whole number between 0 and 100")
      .positive("Must be a positive whole number between 0 and 100")
      .max(100, "Must be a positive whole number between 0 and 100")
      .required("This field is required"),
  })
  .required();

export const UserForm: React.FC<Props> = ({
  userGroupId,
  isEdit = false,
  user = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    resolver: yupResolver(schema),
  });

  const [currentAvatarURL, setCurrentAvatarURL] = useState<string | null>(
    user?.avatarURL ?? null
  );

  const router = useRouter();
  const onSubmit = async (data: User) => {
    data.avatarURL = data.email ? Users.gravatarURL(data.email) : null;

    if (isEdit) {
      if (!user) {
        return false;
      }
      await Users.update(data, user.id, userGroupId);
    } else {
      await Users.create(data, userGroupId);
    }

    router.push(
      {
        pathname: "/usergroups/" + userGroupId,
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
        <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
          <div className="col-span-6 sm:col-span-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Public Solana Address (ex. Wallet){" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="address"
              {...register("address")}
              defaultValue={user?.address}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
              placeholder="AaGhxCk3PCghrS7je44gdtWrKZGQiJRHmuJtZAv9xy6P"
            />
            {errors.address && (
              <span className=" text-red-800 text-xs">
                {errors.address.message}
              </span>
            )}

            <label
              htmlFor="name"
              className="block mt-4 text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              defaultValue={user?.name}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
              placeholder="John Doe"
            />

            <label
              htmlFor="email"
              className="block mt-4 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="text"
              id="email"
              {...register("email")}
              defaultValue={user?.email}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
              placeholder="anon@robomonkepunks.io"
              onBlur={(e) => {
                const { value } = e.currentTarget;
                const email = value.toString();
                setCurrentAvatarURL(email ? Users.gravatarURL(email) : null);
              }}
            />
            {errors.email && (
              <span className=" text-red-800 text-xs">
                E-mail address was invalid
              </span>
            )}

            <label
              htmlFor="share"
              className="block mt-4 text-sm font-medium text-gray-700"
            >
              Share (in percent, without decimals, 0-100%)
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="share"
              {...register("share")}
              defaultValue={user?.share}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-none rounded-l-md sm:block sm:text-sm border-gray-300"
              placeholder="50"
            />
            {errors.share && (
              <span className=" text-red-800 text-xs">
                {errors.share.message}
              </span>
            )}

            <div className="sm:col-span-6 mt-4">
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              >
                Avatar
              </label>
              <div className="relative h-12 w-12 max-w-xsblock group rounded-full bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                {currentAvatarURL ? (
                  <Image
                    src={currentAvatarURL}
                    alt="User Avatar"
                    className="object-cover pointer-events-none"
                    layout="fill"
                  />
                ) : (
                  <svg
                    className="h-full w-full text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TTForm>
  );
};
