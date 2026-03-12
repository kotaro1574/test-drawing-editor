import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { drawingExists } from "@/lib/r2";

export const runtime = "edge";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return {
    title: "お絵描きエディター - みんなの絵",
    description: "お絵描きエディターで絵を描いたよ！見てみてね！",
    openGraph: {
      type: "article",
      title: "お絵描きエディター - みんなの絵",
      description: "お絵描きエディターで絵を描いたよ！見てみてね！",
      url: `${baseUrl}/share/${id}`,
      images: [
        {
          url: `${baseUrl}/api/drawings/${id}`,
          width: 1000,
          height: 1000,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "お絵描きエディター - みんなの絵",
      description: "お絵描きエディターで絵を描いたよ！見てみてね！",
      images: [`${baseUrl}/api/drawings/${id}`],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;

  const exists = await drawingExists(id);
  if (!exists) {
    notFound();
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">みんなの絵を見てね！</h1>
        <div className="glass-card rounded-2xl overflow-hidden p-2">
          <img
            src={`/api/drawings/${id}`}
            alt="描いた絵"
            className="w-full h-auto rounded-xl"
            width={1000}
            height={1000}
          />
        </div>
      </div>
    </main>
  );
}
