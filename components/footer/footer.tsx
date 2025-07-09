"use client";

const Footer = ({}) => {
  return (
    <>
      <footer className=" relative w-full px-[5vw] border-t-[1px] md:flex flex-col pt-5 pb-5 md:pb-0 font-light md:space-y-3">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-3 md:space-y-0 md:justify-between">
          <div className="flex justify-between ">
            <p className="leading-6 md:leading-7 tracking-normal">
              SynthGen &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
