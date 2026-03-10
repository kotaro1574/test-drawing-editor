import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
      title: "お絵描きエディター - みんなの絵",
      description: "お絵描きエディターで絵を描いたよ！見てみてね！",
      images: [
        {
          url: `${baseUrl}/api/drawings/${id}`,
          width: 1000,
          height: 1000,
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
    <main className="flex bg-blue-500 min-h-screen flex-col items-center justify-center py-4">
      <h1 className="text-2xl font-bold mb-4">みんなの絵を見てね！</h1>
      <div className="bg-white">
        <img
          src={`/api/drawings/${id}`}
          alt="描いた絵"
          className="max-w-full h-auto"
          width={1000}
          height={1000}
        />
      </div>
      <Link href="/" className="mt-4">
        <Button size="lg">自分も描いてみる！</Button>
      </Link>
    </main>
  );
}
