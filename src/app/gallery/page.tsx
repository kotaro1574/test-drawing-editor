import type { Metadata } from "next";
import Link from "next/link";
import { listDrawings } from "@/lib/r2";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "お絵描きエディター - みんなの絵",
  description: "みんなが描いた絵を見てみよう！",
  openGraph: {
    type: "website",
    title: "お絵描きエディター - みんなの絵",
    description: "みんなが描いた絵を見てみよう！",
  },
};

export default async function GalleryPage() {
  const drawings = await listDrawings();

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">みんなの絵</h1>
        {drawings.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">まだ絵がないよ！</p>
            <p className="text-gray-400">最初の一枚を描こう！</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {drawings.map((drawing) => (
              <Link key={drawing.id} href={`/share/${drawing.id}`}>
                <div className="glass-card rounded-xl overflow-hidden hover:scale-105 hover:glow transition-all duration-300">
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
      </div>
    </main>
  );
}
