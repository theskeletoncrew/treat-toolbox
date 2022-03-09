import Layout from "../../../../../../../components/Layout";
import Image from "next/image";
import Link from "next/link";
import DropsSubnav from "../../../../../../../components/DropsSubnav";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import { GetServerSideProps } from "next";
import ImageComposite, {
  ImageComposites,
} from "../../../../../../../models/imageComposite";
import { API } from "../../../../../../../models/api";
import { ProgressModal } from "../../../../../../../components/ProgressModal";
import { ActionModal } from "../../../../../../../components/ActionModal";
import { useState } from "react";
import { ImageCompositeGroups } from "../../../../../../../models/imageCompositeGroup";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  compositeGroupId: string;
  composites: ImageComposite[];
  projectId: string;
  userGroupId: string;
}

const BATCH_SIZE = Number(process.env.NEXT_PUBLIC_EXPORT_BATCH_SIZE ?? 500);

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const compositeGroupId = props.compositeGroupId;
  const composites = props.composites;
  const projectId = props.projectId;
  const userGroupId = props.userGroupId;

  const [exportingModalOpen, setExportingModalOpen] = useState(false);
  const [exportedItems, setExportedItems] = useState(0);

  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadURLs, setDownloadURLs] = useState<string[]>([]);

  function cancelExporting() {
    // TODO: truly cancel the exporting task
    // right now we just hide the progress modal
    setExportingModalOpen(false);
  }

  async function packageForMint() {
    let indexes = Array.from(composites.keys());

    // shuffle the order of the array
    const shuffledIndexes = indexes
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    await ImageCompositeGroups.update(
      {
        indexes: shuffledIndexes,
      },
      compositeGroupId,
      projectId,
      collection.id
    );

    setExportingModalOpen(true);

    const urls: string[] = [];

    for (let i = 0; i < composites.length / BATCH_SIZE; i++) {
      setExportedItems(i * BATCH_SIZE);

      const response = await fetch(
        API.ENDPOINT +
          "/download-archive?projectId=" +
          projectId +
          "&collectionId=" +
          collection.id +
          "&compositeGroupId=" +
          compositeGroupId +
          "&userGroupId=" +
          userGroupId +
          "&batchSize=" +
          BATCH_SIZE +
          "&batchNumber=" +
          (i + 1),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Error: ", response.statusText);
        setExportingModalOpen(false);
        alert("Export Request Failed");
      } else {
        const json = await response.json();
        console.log(json);
        urls.push(json.url);
      }
    }

    console.log(urls);

    setExportingModalOpen(false);
    setDownloadURLs(urls);
    setDownloadModalOpen(true);
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
              message={
                "Exporting items " +
                exportedItems +
                "-" +
                Math.min(composites.length, exportedItems + BATCH_SIZE) +
                " of " +
                composites.length
              }
              loadingPercent={Math.ceil(
                (100 * exportedItems) / composites.length
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
              actionURLs={downloadURLs}
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
          userGroupId: collection.userGroupId,
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
