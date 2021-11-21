import React from "react";
import { DocumentAddIcon } from "@heroicons/react/outline";
import Link from "next/link";

export default function HeaderWithAddButton(props: {
  title: string;
  addTitle: string;
  addHref: string;
}) {
  const { title, addTitle, addHref } = props;

  return (
    <header className="bg-white shadow px-14">
      <div className="mt-3 -mr-2 flex float-right">
        <span>
          <Link href={addHref} passHref={true}>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentAddIcon
                className="-ml-1 mr-1 h-5 w-5"
                aria-hidden="true"
              />
              {addTitle}
            </button>
          </Link>
        </span>
      </div>
      <div className="py-3">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
