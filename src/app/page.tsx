"use client";

import { DrawingCanvas } from "@/components/DrawingCanvas";

export default function Home() {
  return (
    <main className="flex bg-white min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Fabric.js Drawing Demo</h1>
      <DrawingCanvas />
    </main>
  );
}
