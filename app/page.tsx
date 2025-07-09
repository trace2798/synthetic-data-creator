import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-between items-center min-h-screen">
      <nav className="h-16 flex justify-between px-[5vw] w-full items-center border-b">
        <p className="text-2xl md:text-4xl font-generalSans font-semibold">
          SynthGen
        </p>
        <Link href={"/login"}>
          <Button variant={"secondary"}>Login</Button>
        </Link>
      </nav>
      <div className="absolute inset-0 -z-10">
        <img src={"/bg-home.webp"} className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-black/50 -z-5" />
      <div className=" font-bold w-full px-[5vw] space-y-5">
        <h1 className="w-full max-w-2xl text-6xl">
          Generate High-Quality Synthetic Data with AI
        </h1>
        <h2 className="w-full max-w-2xl text-3xl text-primary/80">
          Accelerate your projects with realistic, customizable, privacy-safe
          data at scale.
        </h2>
        <div>
          <Link href={"/dashboard"}>
            <Button variant={"outline"} className="w-[150px]">
              Try it
            </Button>
          </Link>
        </div>
      </div>
      <footer className="border-t h-12 w-full px-[5vw] flex justify-between items-center text-primary/70">
        <div>
          SynthGen is my submission for Gen AI Hackathon by Impetus and Aws
        </div>
      </footer>
    </div>
  );
}
