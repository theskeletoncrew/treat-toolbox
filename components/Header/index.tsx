import React from "react";

export default function Header(props: { title: string }) {
  const { title } = props;

  return (
    <header className="py-3 px-14 bg-white shadow">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
    </header>
  );
}
