import { FC } from "react";
import DomainSelector from "./_components/domain-selector";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {}

const Page: FC<PageProps> = async ({}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  return (
    <>
      <div>Page</div>
      <DomainSelector />
    </>
  );
};

export default Page;
