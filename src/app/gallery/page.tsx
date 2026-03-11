import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listDrawings } from "@/lib/r2";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "お絵描きエディター - みんなの絵",
  description: "みんなが描いた絵を見てみよう！",
};

export default async function GalleryPage() {
  const drawings = await listDrawings();

  return (
    <main className="flex bg-blue-500 min-h-screen flex-col items-center py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">みんなの絵</h1>
      {drawings.length === 0 ? (
        <p className="text-white text-lg">
          まだ絵がないよ！最初の一枚を描こう！
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl w-full">
          {drawings.map((drawing) => (
            <Link key={drawing.id} href={`/share/${drawing.id}`}>
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:scale-105 transition-all">
                <div className="aspect-square">
                  <img
                    src={`/api/drawings/${drawing.id}`}
                    alt="描いた絵"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={250}
                    height={250}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Link href="/" className="mt-6">
        <Button size="lg">自分も描いてみる！</Button>
      </Link>
    </main>
  );
}
