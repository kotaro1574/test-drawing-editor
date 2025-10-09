"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { EraserBrush } from "@erase2d/fabric";
import { ColorPalette } from "./ColorPalette";

const DEFAULT_COLOR = "#000000";
const DEFAULT_WIDTH = 10;

export function DrawingCanvas() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    if (canvasEl.current === null) {
      return;
    }
    const canvas = new fabric.Canvas(canvasEl.current);

    setCanvas(canvas);

    // 手書き機能を追加
    const pencil = new fabric.PencilBrush(canvas);
    pencil.color = DEFAULT_COLOR;
    pencil.width = DEFAULT_WIDTH;
    canvas.freeDrawingBrush = pencil;
    canvas.isDrawingMode = true;

    // 消しゴムで線を消せるようにするため
    canvas.on("object:added", (e) => {
      e.target.erasable = true;
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  const changeColor = (newColor: string) => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = newColor;
    canvas.freeDrawingBrush.width = width;
    setColor(newColor);
  };

  const changeToThick = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 20;
    canvas.freeDrawingBrush.color = color;
    setWidth(20);
  };

  const changeToThin = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 10;
    canvas.freeDrawingBrush.color = color;
    setWidth(10);
  };

  const changeToEraser = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    const eraser = new EraserBrush(canvas);

    eraser.on("end", async (e) => {
      e.preventDefault();

      await eraser.commit(e.detail);
      setHistories((prev) => ({
        undo: [...prev.undo, canvas.toJSON()],
        redo: [],
      }));
    });
    canvas.freeDrawingBrush = eraser;
    canvas.freeDrawingBrush.width = 20;
  };

  const [histories, setHistories] = useState<{
    undo: object[];
    redo: object[];
  }>({
    undo: [],
    redo: [],
  });

  const isCanvasLocked = useRef(false);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    // 空のcanvasを履歴の初期値に追加
    setHistories({
      undo: [canvas.toJSON()],
      redo: [],
    });

    const onCanvasModified = (e: { target: fabric.FabricObject }) => {
      if (isCanvasLocked.current) {
        return;
      }

      const targetCanvas = e.target.canvas;
      if (targetCanvas) {
        setHistories((prev) => ({
          undo: [...prev.undo, targetCanvas.toJSON()],
          redo: [],
        }));
      }
    };

    canvas.on("object:added", onCanvasModified);

    return () => {
      canvas.off("object:added", onCanvasModified);
    };
  }, [canvas]);

  const undo = useCallback(async () => {
    if (!canvas || isCanvasLocked.current) {
      return;
    }

    const lastHistory = histories.undo.at(-2);
    const currentHistory = histories.undo.at(-1);
    if (!lastHistory || !currentHistory) {
      return;
    }

    isCanvasLocked.current = true;

    await canvas.loadFromJSON(lastHistory);
    canvas.renderAll();
    setHistories((prev) => ({
      undo: prev.undo.slice(0, -1),
      redo: [...prev.redo, currentHistory],
    }));

    isCanvasLocked.current = false;
  }, [canvas, histories.undo]);

  const redo = useCallback(async () => {
    if (!canvas || isCanvasLocked.current) {
      return;
    }

    const lastHistory = histories.redo.at(-1);
    if (!lastHistory) {
      return;
    }

    isCanvasLocked.current = true;

    await canvas.loadFromJSON(lastHistory);
    canvas.renderAll();
    setHistories((prev) => ({
      undo: [...prev.undo, lastHistory],
      redo: prev.redo.slice(0, -1),
    }));

    isCanvasLocked.current = false;
  }, [canvas, histories.redo]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <canvas width="1000" height="1000" ref={canvasEl} className="border" />

      <div className="flex flex-wrap items-start justify-center gap-4">
        <ColorPalette selectedColor={color} onColorChange={changeColor} />

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={changeToThick}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
            >
              Thick
            </button>
            <button
              onClick={changeToThin}
              className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-400 cursor-pointer"
            >
              Thin
            </button>
          </div>

          <button
            onClick={changeToEraser}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer"
          >
            Eraser
          </button>

          <div className="flex gap-2">
            <button
              onClick={undo}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            >
              Undo
            </button>
            <button
              onClick={redo}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            >
              Redo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
