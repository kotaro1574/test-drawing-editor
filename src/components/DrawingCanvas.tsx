"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

export default function DrawingCanvas() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasEl.current === null) {
      return;
    }
    const canvas = new fabric.Canvas(canvasEl.current);

    setCanvas(canvas);

    // 手書き機能を追加
    const pencil = new fabric.PencilBrush(canvas);
    pencil.color = "#000000";
    pencil.width = 10;
    canvas.freeDrawingBrush = pencil;
    canvas.isDrawingMode = true;

    return () => {
      canvas.dispose();
    };
  }, []);

  const changeToRed = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush.color = "#ff0000";
  };

  const changeToBlack = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush.color = "#000000";
  };

  const changeToThick = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush.width = 20;
  };

  const changeToThin = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush.width = 10;
  };

  return (
    <div className="flex flex-col items-center">
      <canvas width="1000" height="1000" ref={canvasEl} className="border" />

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={changeToRed}
          className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
        >
          Red
        </button>
        <button
          onClick={changeToBlack}
          className="mt-2 px-4 py-1 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
        >
          Black
        </button>
        <button
          onClick={changeToThick}
          className="mt-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
        >
          Thick
        </button>
        <button
          onClick={changeToThin}
          className="mt-2 px-4 py-1 bg-gray-300 text-white rounded hover:bg-gray-400 cursor-pointer"
        >
          Thin
        </button>
      </div>
    </div>
  );
}
