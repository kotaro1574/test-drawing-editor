"use client";

import { DrawingCanvas } from "@/components/DrawingCanvas";

export default function Home() {
  return (
    <main className="flex bg-blue-500 min-h-screen flex-col items-center justify-center py-4">
      <h1 className="text-2xl font-bold mb-4">絵を描こう！</h1>
      <DrawingCanvas />
    </main>
  );
}
