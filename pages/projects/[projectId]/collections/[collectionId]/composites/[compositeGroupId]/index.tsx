import Layout from "../../../../../../../components/Layout";
import Image from "next/image";
import Link from "next/link";
import DropsSubnav from "../../../../../../../components/DropsSubnav";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import ImageCompositeGroup, {
  ImageCompositeGroups,
} from "../../../../../../../models/imageCompositeGroup";
import { GetServerSideProps } from "next";
import { CandyMachine } from "../../../../../../../models/candymachine";
import ImageComposite, {
  ImageComposites,
} from "../../../../../../../models/imageComposite";
import { API } from "../../../../../../../models/api";
import { ProgressModal } from "../../../../../../../components/ProgressModal";
import { ActionModal } from "../../../../../../../components/ActionModal";
import { useState } from "react";
import { Users } from "../../../../../../../models/user";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  compositeGroupId: string;
  composites: ImageComposite[];
  projectId: string;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const compositeGroupId = props.compositeGroupId;
  const composites = props.composites;
  const projectId = props.projectId;

  const [exportingModalOpen, setExportingModalOpen] = useState(false);
  const [exportingItem, setExportingItem] = useState(0);
  const exportingTotal = collection.supply;

  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadURL, setDownloadURL] = useState("");

  function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
  }

  function cancelExporting() {
    // TODO: truly cancel the exporting task
    // right now we just hide the progress modal
    setExportingModalOpen(false);
  }

  async function packageForMint() {
    let jsonExports: Promise<void>[] = [];

    setExportingModalOpen(true);
    const creators = await Users.all(collection.userGroupId);

    for (let i = 0; i < composites.length; i++) {
      const composite = composites[i];

      const jsonExport = new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          CandyMachine.exportItem(
            i,
            project,
            creators,
            collection,
            compositeGroupId,
            composite
          )
            .then((isSuccessful) => {
              setExportingItem(i);
              console.log(
                "Export of " +
                  i +
                  " was a " +
                  (isSuccessful ? "success" : "failure")
              );

              if (isSuccessful) {
                resolve();
              } else {
                reject();
              }
            })
            .catch((e) => {
              console.log(e);
              reject();
            });
        }, i * 200);
      });

      jsonExports.push(jsonExport);
    }

    Promise.all(jsonExports)
      .then(() => {
        fetch(
          API.ENDPOINT +
            "/download-archive?projectId=" +
            projectId +
            "&collectionId=" +
            collection.id +
            "&compositeGroupId=" +
            compositeGroupId,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((json) => {
            console.log(json);
            setExportingModalOpen(false);
            setDownloadURL(json.url);
            setDownloadModalOpen(true);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      })
      .catch((e) => {
        console.error("Failure prepping before download: " + e);
      });
  }

  if (!projects) {
    return " " + projectId + " ";
  } else if (composites.length == 0) {
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
              <Link
                href={
                  "/projects/" +
                  projectId +
                  "/collections/" +
                  collection.id +
                  "/composites/" +
                  compositeGroupId +
                  "/rarity"
                }
                passHref={true}
              >
                <a>
                  <button
                    type="button"
                    className="inline-flex items-center mr-2 px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Rarity Chart
                  </button>
                </a>
              </Link>
              <Link
                href={
                  "/projects/" +
                  projectId +
                  "/collections/" +
                  collection.id +
                  "/composites/" +
                  compositeGroupId +
                  "/playground"
                }
                passHref={true}
              >
                <a>
                  <button
                    type="button"
                    className="inline-flex items-center mr-2 px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Composite Playground
                  </button>
                </a>
              </Link>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => packageForMint()}
              >
                Export for Candy Machine 🍬
              </button>
            </div>

            <ul
              role="list"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 clear-both px-8 py-4"
            >
              {composites.map((imageComposite) => {
                return (
                  <li key={imageComposite.id} className="relative">
                    <div className="block group w-full aspect-w-10 aspect-h-10 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                      <Link
                        href={
                          "/projects/" +
                          projectId +
                          "/collections/" +
                          collection.id +
                          "/composites/" +
                          compositeGroupId +
                          "/" +
                          imageComposite.id
                        }
                        passHref={true}
                      >
                        <a>
                          {imageComposite?.externalURL ? (
                            <Image
                              src={imageComposite?.externalURL}
                              unoptimized
                              alt=""
                              className="object-cover pointer-events-none group-hover:opacity-75"
                              layout="fill"
                            />
                          ) : (
                            <span>Failed</span>
                          )}
                        </a>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            <ProgressModal
              title="Exporting for Candy Machine"
              message={"Exporting " + exportingItem + ".json"}
              loadingPercent={Math.ceil(
                (100 * (exportingItem + 1)) / exportingTotal
              )}
              cancelAction={() => {
                cancelExporting();
              }}
              show={exportingModalOpen}
            />

            <ActionModal
              title="Export Complete"
              message="Your Candy Machine files are ready to be downloaded!"
              actionButtonTitle="Download"
              actionURL={downloadURL}
              cancelAction={() => {
                setDownloadModalOpen(false);
              }}
              show={downloadModalOpen}
            />
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
    const compositeGroupId = context.query.compositeGroupId?.toString();

    if (projectId && collectionId && compositeGroupId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const project = projects.find((project) => project.id == projectId);
      const composites = await ImageComposites.all(
        projectId,
        collectionId,
        compositeGroupId
      );
      composites.sort((a: ImageComposite, b: ImageComposite) => {
        const itemNumberA = parseInt(
          a.externalURL?.split("/").pop()?.split(".").shift() ?? "-1"
        );
        const itemNumberB = parseInt(
          b.externalURL?.split("/").pop()?.split(".").shift() ?? "-1"
        );
        return itemNumberA < itemNumberB
          ? -1
          : itemNumberA == itemNumberB
          ? 0
          : 1;
      });

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          compositeGroupId: compositeGroupId,
          composites: composites,
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
