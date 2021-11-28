import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Project, { Projects } from "../../../models/project";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Props {
  isEdit?: boolean;
  project?: Project | null;
}

const schema = yup
  .object({
    name: yup.string().trim().required("This field is required"),
    description: yup.string().trim().required("This field is required"),
  })
  .required();

export const ProjectForm: React.FC<Props> = ({
  isEdit = false,
  project = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Project>({
    resolver: yupResolver(schema),
    defaultValues: project ?? {},
  });

  const router = useRouter();
  const onSubmit = async (data: Project) => {
    data.url = "https://" + data.domain;

    if (isEdit) {
      if (!project) {
        return false;
      }
      await Projects.update(data, project.id);
    } else {
      await Projects.create(data);
    }

    router.push(
      {
        pathname: "/",
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
        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Project Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="The Skeleton Crew"
            className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
            {...register("name")}
          />
          {errors.name && (
            <span className=" text-red-800 text-xs">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              placeholder="6,666 algorithmically generated, unique and spooky skulls."
              className="shadow-sm mt-1 block w-full sm:text-sm border rounded-md"
            />
            {errors.description && (
              <span className=" text-red-800 text-xs">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </TTForm>
  );
};
