"use client";

import { DrawingCanvas } from "@/components/DrawingCanvas";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex bg-blue-500 min-h-screen flex-col items-center justify-center py-4">
      <h1 className="text-2xl font-bold mb-4">絵を描こう！</h1>
      <DrawingCanvas />
      <Link href="/gallery" className="mt-4">
        <Button size="lg" variant="outline">
          <ImageIcon className="w-4 h-4 mr-2" />
          みんなの絵を見る
        </Button>
      </Link>
    </main>
  );
}
