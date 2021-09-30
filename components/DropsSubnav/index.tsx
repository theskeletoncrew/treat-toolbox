import Link from "next/dist/client/link";
import Header from "../Header";
import Project from "../../models/project";
import Collection from "../../models/collection";

const tabs = [
  { id: "details", name: "Details" },
  { id: "traits", name: "Traits" },
  { id: "artwork", name: "Artwork" },
  { id: "conflicts", name: "Conflicts" },
  { id: "composites", name: "Composites" },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  project: Project;
  collection: Collection;
  section: string;
}

export default function DropsSubnav(props: Props) {
  const { project, collection, section } = props;

  return (
    <>
      <Header title={project.name + ": " + collection.name} />
      <section>
        <div>
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full pl-3 pr-10 py-2 text-base focus:outline-none sm:text-sm rounded-md"
              defaultValue={tabs.find((tab) => tab.id == section)?.name}
            >
              {tabs.map((tab) => (
                <option key={tab.name}>{tab.name}</option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200 px-14">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const tabPath = tab.id == "details" ? "" : "/" + tab.id;
                  return (
                    <Link
                      key={tab.name}
                      href={{
                        pathname:
                          "/projects/[projectId]/collections/[collectionId]" +
                          tabPath,
                        query: {
                          projectId: project.id,
                          collectionId: collection.id,
                        },
                      }}
                    >
                      <a
                        className={classNames(
                          tab.id == section
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                          "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                        )}
                        aria-current={tab.id == section ? "page" : undefined}
                      >
                        {tab.name}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
