import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import Project from "../../models/project";
import { useRouter } from "next/router";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const addProjectKey = "__add__";

interface Props {
  projects: Project[];
  selectedProjectId: string | undefined;
}

export default function MainNavProjectDropdown({
  projects,
  selectedProjectId,
}: Props) {
  let selectedProject: Project | undefined = undefined;

  if (selectedProjectId) {
    selectedProject = projects.find(
      (project) => project.id == selectedProjectId
    );
  }

  const router = useRouter();
  function handleSelectedProjectIdChange(selectedProjectId: string) {
    if (selectedProjectId == addProjectKey) {
      router.push(
        {
          pathname: "/projects/create",
          query: {},
        },
        undefined,
        { shallow: false }
      );
    } else {
      router.push(
        {
          pathname: "/projects/" + selectedProjectId,
          query: {},
        },
        undefined,
        { shallow: false }
      );
    }
  }

  return (
    <Listbox
      value={selectedProject?.id}
      onChange={handleSelectedProjectIdChange}
    >
      {({ open }) => (
        <>
          <div className="relative w-60">
            <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-2 pr-8 py-1 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs">
              <span className="block truncate">
                {selectedProject?.name ?? "Select a Project"}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-60 bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-xs">
                {projects?.map((project) => (
                  <Listbox.Option
                    key={project.id}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "cursor-default select-none relative py-2 pl-3 pr-9"
                      )
                    }
                    value={project.id}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {project.name}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
                <Listbox.Option
                  key={addProjectKey}
                  className={({ active }) =>
                    classNames(
                      active ? "text-white bg-indigo-600" : "text-gray-900",
                      "cursor-default select-none relative py-2 pl-3 pr-9"
                    )
                  }
                  value={addProjectKey}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={classNames(
                          selected ? "font-semibold" : "font-normal",
                          "block truncate"
                        )}
                      >
                        + Add New Project
                      </span>
                    </>
                  )}
                </Listbox.Option>
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
