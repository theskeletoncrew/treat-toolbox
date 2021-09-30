export default function FormDescription(props: {
  children?: JSX.Element | JSX.Element[] | null;
  title: string;
  description: string;
}) {
  const { children, title, description } = props;

  return (
    <div className="md:col-span-1">
      <div className="px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        {children}
      </div>
    </div>
  );
}
