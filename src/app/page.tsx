import { AnimatedHeading } from "@/components/animated-heading";
import { FileUpload } from "@/components/ui/file-upload";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-dots">
      <div className="z-10 mx-auto max-w-xl w-full text-center px-4">
        <AnimatedHeading />
        <div className="mt-12">
          <FileUpload />
        </div>
      </div>
    </main>
  );
}
