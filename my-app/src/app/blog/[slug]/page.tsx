import { useParams } from "next/navigation";

export default function BlogSlugPage() {
  const params = useParams();
  const slug = params?.slug;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Blog Slug Page</h1>
      <p>
        Slug from URL: <span className="font-mono text-blue-700">{slug}</span>
      </p>
    </div>
  );
}