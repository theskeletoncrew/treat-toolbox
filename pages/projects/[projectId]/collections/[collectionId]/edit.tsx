import Layout from "../../../../../components/Layout";
import Collection, {
  Collections,
  DropStatus,
} from "../../../../../models/collection";
import Project, { Projects } from "../../../../../models/project";
import UserGroup, { UserGroups } from "../../../../../models/userGroup";
import User, { Users } from "../../../../../models/user";
import Header from "../../../../../components/Header";
import FormDescription from "../../../../../components/FormDescription";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

interface Props {
  projects: Project[];
  project: Project;
  projectId: string;
  collection: Collection;
  userGroups: UserGroup[];
}

export default function EditPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const projectId = props.projectId;
  const collection = props.collection;
  const userGroups = props.userGroups;

  let launchDate: string = "";

  if (collection) {
    launchDate =
      collection.startDate.toLocaleDateString() +
      " " +
      collection.startDate.toLocaleTimeString();
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    setIsSubmitting(true);

    const name = data.get("name")?.toString().trim();
    const supply = parseInt(data.get("supply")?.toString().trim() ?? "0");
    const sellerFeeBasisPoints = parseInt(
      data.get("sellerFeeBasisPoints")?.toString().trim() ?? "0"
    );
    const symbol = data.get("symbol")?.toString().trim().toUpperCase();

    const startDateInput = data.get("startDate")?.toString().trim() ?? "";
    let startDate = new Date(startDateInput);
    if (!startDate) {
      const today = new Date();
      startDate = new Date(today.setMonth(today.getMonth() + 1));
    }

    const creatorsGroupId = data.get("creators")?.toString().trim();

    await Collections.update(
      {
        name: name,
        supply: supply,
        sellerFeeBasisPoints: sellerFeeBasisPoints,
        symbol: symbol,
        status: DropStatus.Pending,
        startDate: startDate,
        userGroupId: creatorsGroupId,
      },
      collection.id,
      projectId
    );

    setIsSubmitting(false);

    router.push(
      {
        pathname: "/projects/" + projectId + "/collections/" + collection.id,
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout
      title="Edit Drop"
      section="collections"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Edit Drop" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Drop"
              description="Enter details about your launch."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form action="#" method="POST" onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
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
                        name="name"
                        id="name"
                        placeholder="Gen 0"
                        defaultValue={collection.name}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
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
                        name="supply"
                        id="supply"
                        placeholder="10000"
                        defaultValue={collection.supply}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        This is the number of NFTs that will be available for
                        sale.
                      </p>
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="sellerFeeBasisPoints"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Seller Fee Basis Points
                      </label>
                      <input
                        type="text"
                        name="sellerFeeBasisPoints"
                        id="sellerFeeBasisPoints"
                        placeholder="500"
                        defaultValue={collection.sellerFeeBasisPoints}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        This is the fee on secondary market sales creators will
                        split (enter &ldquo;500&rdquo; for 5%)
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
                        name="symbol"
                        id="symbol"
                        placeholder="SKULL"
                        defaultValue={collection.symbol}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Creators
                      </label>
                      <select
                        name="creators"
                        id="creators"
                        defaultValue={collection.userGroupId}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      >
                        {userGroups.map((userGroup) => {
                          return (
                            <option key={userGroup.id} value={userGroup.id}>
                              {userGroup.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Launch Date
                      </label>
                      <input
                        type="text"
                        name="startDate"
                        id="startDate"
                        placeholder="09/01/2021 04:00:00"
                        defaultValue={launchDate}
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        ex. &ldquo;10/31/2021 01:30:00 PM&rdquo;
                      </p>
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

    if (projectId && collectionId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const project = await Projects.withId(projectId);
      const userGroups = await UserGroups.all();

      return {
        props: {
          projects,
          project,
          projectId,
          collection,
          userGroups,
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
