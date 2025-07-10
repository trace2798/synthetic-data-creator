import { FC } from "react";
import { columns, Payment } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { Separator } from "@/components/ui/separator";

interface PageProps {}

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
  ];
}

const Page: FC<PageProps> = async ({}) => {
  const data = await getData();

  return (
    <>
      <div className="flex flex-col space-y-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col space-y-5">
          <h1 className="text-5xl">Current Workspace Members</h1>
          <Separator />
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
};

export default Page;
