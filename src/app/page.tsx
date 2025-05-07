
import HomePage from "@/components/home/HomePage";
import { FileUpload } from "@/components/ui/file-upload";
export default function Home() {
  return (
    <div className="bg-dots">
      <HomePage/>
      <FileUpload/>
    </div>
  );
}
