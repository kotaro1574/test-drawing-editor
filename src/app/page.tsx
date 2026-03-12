"use client";

import { DrawingCanvas } from "@/components/DrawingCanvas";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">絵を描こう！</h1>
      <DrawingCanvas />
    </main>
  );
}
