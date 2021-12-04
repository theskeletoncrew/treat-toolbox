import React from "react";
import Link from "next/link";

export const MainNavItem = (props: {
  title: string;
  path: string;
  selected: boolean;
}) => {
  const { title, path, selected } = props;

  const selectedClass =
    "mt-1 bg-gray-900 text-white px-3 py-2 rounded-md text-xs font-regular";
  const unselectedClass =
    "mt-1 text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-xs font-medium";

  return (
    <Link href={path}>
      <a
        className={
          "whitespace-nowrap " + (selected ? selectedClass : unselectedClass)
        }
      >
        {title}
      </a>
    </Link>
  );
};
