import Link from "next/link";
import Layout from "../../../../../components/Layout";
import DropsSubnav from "../../../../../components/DropsSubnav";
import { PencilAltIcon } from "@heroicons/react/outline";
import Project, { Projects } from "../../../../../models/project";
import Collection, {
  Collections,
  CollectionType,
} from "../../../../../models/collection";
import UserGroup, { UserGroups } from "../../../../../models/userGroup";
import { GetServerSideProps } from "next";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  projectId: string;
  userGroup: UserGroup;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const projectId = props.projectId;
  const userGroup = props.userGroup;

  if (!collection) {
    return (
      <Layout
        title="Drops"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Drops"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="details"
          />
          <main className="px-8 py-12">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div>
                <div className="px-4 py-3 sm:px-6 flex lg:ml-4 float-right">
                  <span className="sm:ml-3">
                    <Link
                      href={
                        "/projects/" +
                        project.id +
                        "/collections/" +
                        collection.id +
                        "/edit"
                      }
                      passHref={true}
                    >
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PencilAltIcon
                          className="-ml-1 mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                        Edit
                      </button>
                    </Link>
                  </span>
                </div>
                <h3 className="px-4 py-5 sm:px-6 text-lg leading-6 font-medium text-gray-900">
                  Drop Details
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Collection Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {collection.name}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      NFT Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {collection.nftName}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Collection Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {collection.type == CollectionType.Generative
                        ? "Generative"
                        : collection.type == CollectionType.Prerendered
                        ? "Prerendered"
                        : "Tilemapped"}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Supply
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {collection.supply}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Seller Fee Basis Points
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {collection.sellerFeeBasisPoints}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Symbol
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {collection.symbol}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      External NFT URL
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {collection.url}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Creators
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userGroup?.name}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();

    if (projectId && collectionId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const project = projects.find((project) => project.id == projectId);
      const userGroup = await UserGroups.withId(collection.userGroupId);

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          projectId: projectId,
          userGroup: userGroup,
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
