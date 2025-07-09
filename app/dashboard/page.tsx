import { FC } from "react";
import DomainSelector from "./_components/domain-selector";

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  return (
    <>
      <div>Page</div>
      <DomainSelector/>
    </>
  );
};

export default Page;
