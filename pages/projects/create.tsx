import Header from "../../components/Header";
import Layout from "../../components/Layout";
import FormDescription from "../../components/FormDescription";
import Project, { Projects } from "../../models/project";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

interface Props {
  projects: Project[];
  projectId: string;
}

export default function CreatePage(props: Props) {
  const projects = props.projects;
  const projectId = props.projectId;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    setIsSubmitting(true);

    const name = data.get("name")?.toString().trim();
    const description = data.get("description")?.toString().trim();
    const domain = data.get("domain")?.toString().trim();
    const url = domain ? "https://" + domain : null;

    await Projects.create({
      name: name,
      description: description,
      domain: domain,
      url: url,
    } as Project);

    setIsSubmitting(false);

    router.push(
      {
        pathname: "/",
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout
      title="Create Project"
      section="projects"
      projects={projects}
      selectedProjectId={projectId}
    >
      <Header title="Create a New Project" />
      <main className="px-8 py-12">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <FormDescription
              title="Project"
              description="First, setup general information about your project."
            />
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form action="#" method="POST" onSubmit={onSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
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
                        name="name"
                        id="name"
                        placeholder="The Skeleton Crew"
                        className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
                      />
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
                          name="description"
                          rows={3}
                          placeholder="6,666 algorithmically generated, unique and spooky skulls."
                          className="shadow-sm mt-1 block w-full sm:text-sm border rounded-md"
                          defaultValue={""}
                        />
                      </div>
                    </div>

                    <div>
                      <div>
                        <label
                          htmlFor="domain"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Domain
                        </label>
                        <span className="mt-1 inline-flex flex-1 rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-gray-500 text-sm">
                            https://
                          </span>
                          <input
                            type="text"
                            name="domain"
                            id="domain"
                            className="inline-flex flex-1 rounded-none sm:text-sm"
                            placeholder="skeletoncrew.rip"
                          />
                        </span>
                      </div>
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
    const projectId = context.query.projectId;
    const projects = await Projects.all();

    return {
      props: {
        projects,
        projectId,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
