import { readContent } from "@/lib/content";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default function Page() {
  const content = readContent();
  return <HomePage content={content} />;
}
