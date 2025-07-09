import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DomainSelector from "./_components/domain-selector";
// import CreateRoleForm from "@/components/create-role-form";

const Page = async ({}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  const workspaces = await db.
  return (
    <>
      <div>Page</div>
      <DomainSelector />
      {/* <CreateRoleForm /> */}
    </>
  );
};

export default Page;
