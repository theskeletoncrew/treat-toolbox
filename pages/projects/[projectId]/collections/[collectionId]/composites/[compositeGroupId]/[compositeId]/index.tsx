import Layout from "../../../../../../../../components/Layout";
import DropsSubnav from "../../../../../../../../components/DropsSubnav";
import Project, { Projects } from "../../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../../models/collection";
import ImageComposite, {
  ImageComposites,
} from "../../../../../../../../models/imageComposite";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import { DestructiveModal } from "../../../../../../../../components/DestructiveModal";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  compositeGroupId: string;
  composite: ImageComposite;
  compositeId: string;
  projectId: string;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const compositeGroupId = props.compositeGroupId;
  const compositeId = props.compositeId;
  const projectId = props.projectId;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [composite, setComposite] = useState<ImageComposite>(props.composite);

  const router = useRouter();

  const confirmDeleteComposite = (event: React.MouseEvent) => {
    event.preventDefault();
    setDeleteModalOpen(true);
  };

  const compositeDidUpdate = async (updatedComposite: ImageComposite) => {
    setComposite(updatedComposite);
  };

  const deleteComposite = async () => {
    await ImageComposites.remove(
      compositeId,
      projectId,
      collection.id,
      compositeGroupId
    );
    setDeleteModalOpen(false);

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collection.id +
          "/composites/" +
          compositeGroupId,
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  const cancelDeleteComposite = async () => {
    setDeleteModalOpen(false);
  };

  if (!composite) {
    return (
      <Layout
        title="Composites"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="composites"
        />
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Composites"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="composites"
          />

          <main>
            <div className="mt-4 mr-8 float-right">
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={(e) => confirmDeleteComposite(e)}
              >
                Delete Composite
              </button>
              {/*
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => mintToWallet()}
              >
                Mint to Wallet
              </button>*/}
            </div>
            <div className="flex flex-col clear-both px-8 py-4">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <div className="float-left p-4">
                      {composite.externalURL ? (
                        <Image
                          src={composite.externalURL}
                          alt="Skull"
                          width="500"
                          height="500"
                          className="inline-block"
                          unoptimized
                        />
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="float-left align-top p-4 w-1/2">
                      <ul>
                        {composite.traits
                          .filter((pair) => {
                            return !pair.trait.isArtworkOnly;
                          })
                          .map((traitValuePair, i) => (
                            <li
                              key={i}
                              className="border-2 rounded-lg text-center p-4 float-left m-4"
                            >
                              <strong>
                                {traitValuePair.trait.name.toUpperCase()}
                              </strong>
                              <br />
                              {traitValuePair.traitValue?.name ?? "None"}
                            </li>
                          ))}
                        {composite.additionalMetadataEntries
                          ? Object.keys(
                              composite.additionalMetadataEntries
                            ).map((entryKey, i) => (
                              <li
                                key={i}
                                className="border-2 rounded-lg text-center p-4 float-left m-4"
                              >
                                <strong>{entryKey.toUpperCase()}</strong>
                                <br />
                                {composite.additionalMetadataEntries[
                                  entryKey
                                ] ?? "None"}
                              </li>
                            ))
                          : ""}
                      </ul>

                      <br className="clear-both" />

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <DestructiveModal
            title="Delete Composite"
            message={
              "Are you sure you want to delete this composite? This will remove all data associated with this composite. This action cannot be undone."
            }
            deleteAction={() => {
              deleteComposite();
            }}
            cancelAction={() => {
              cancelDeleteComposite();
            }}
            show={deleteModalOpen}
          />
        </div>
      </Layout>
    );
  }
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();
    const compositeGroupId = context.query.compositeGroupId?.toString();
    const compositeId = context.query.compositeId?.toString();
    if (projectId && collectionId && compositeGroupId && compositeId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const project = projects.find((project) => project.id == projectId);
      const composite = await ImageComposites.withId(
        compositeId,
        projectId,
        collectionId,
        compositeGroupId
      );
      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          compositeGroupId: compositeGroupId,
          composite: composite,
          compositeId: compositeId,
          projectId: projectId,
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
