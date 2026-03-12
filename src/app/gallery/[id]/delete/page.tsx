import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { drawingExists } from "@/lib/r2";
import { DeleteButton } from "@/components/DeleteButton";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "お絵描きエディター - 絵の削除",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeletePage({ params }: Props) {
  const { id } = await params;

  const exists = await drawingExists(id);
  if (!exists) {
    notFound();
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          絵の削除
        </h1>
        <div className="glass-card rounded-2xl overflow-hidden p-2 mb-6">
          <img
            src={`/api/drawings/${id}`}
            alt="削除する絵"
            className="w-full h-auto rounded-xl"
            width={1000}
            height={1000}
          />
        </div>
        <div className="flex justify-center">
          <DeleteButton drawingId={id} />
        </div>
      </div>
    </main>
  );
}
