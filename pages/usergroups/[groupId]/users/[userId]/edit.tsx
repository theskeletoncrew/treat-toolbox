import Header from "../../../../../components/Header";
import Layout from "../../../../../components/Layout";
import FormDescription from "../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../models/project";
import User, { Users } from "../../../../../models/user";
import { GetServerSideProps } from "next";
import { UserForm } from "../../../../../components/Forms/User";

interface Props {
  projects: Project[];
  userGroupId: string;
  user: User;
}

export default function EditPage(props: Props) {
  const projects = props.projects;
  const userGroupId = props.userGroupId;
  const user = props.user;

  if (!user) {
    return (
      <Layout
        title="Edit User"
        section="usergroups"
        projects={projects}
        selectedProjectId={undefined}
      >
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Edit User"
        section="usergroups"
        projects={projects}
        selectedProjectId={undefined}
      >
        <Header title="Edit User" />
        <main className="px-8 py-12">
          <div>
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <FormDescription
                title="Edit User"
                description="Users are represented by Solana addresses, such as their wallet address. They could also be a multi-sig address owned by several users or an organization."
              />
              <div className="mt-5 md:mt-0 md:col-span-2">
                <UserForm isEdit={true} user={user} userGroupId={userGroupId} />
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const userGroupId = context.query.groupId?.toString();
    const userId = context.query.userId?.toString();
    const projects = await Projects.all();

    if (userGroupId && userId) {
      const user = await Users.withId(userId, userGroupId);

      return {
        props: {
          projects,
          userGroupId,
          user,
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
