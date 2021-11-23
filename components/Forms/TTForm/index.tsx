import { useState } from "react";
import { useRouter } from "next/router";

interface Props {
  handleSubmit: any;
  submit: (data: any) => Promise<boolean>;
  children?: JSX.Element | JSX.Element[] | null;
}

export const TTForm: React.FC<Props> = ({ handleSubmit, submit, children }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const isSuccessful = await submit(data);
    if (!isSuccessful) {
      setIsSubmitting(false);
    }
  };

  return (
    <form action="#" method="POST" onSubmit={handleSubmit(onSubmit)}>
      <fieldset
        disabled={isSubmitting}
        className={isSubmitting ? "opacity-50" : ""}
      >
        <div className="shadow sm:rounded-md sm:overflow-hidden">
          {children}

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              className={
                (isSubmitting
                  ? "bg-gray-600 "
                  : "bg-indigo-600 hover:bg-indigo-700 ") +
                "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }
            >
              Save
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
};
