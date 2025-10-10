"use client";

import { EraserBrush } from "@erase2d/fabric";
import * as fabric from "fabric";
import { Eraser, Redo, Undo } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ColorPalette } from "./ColorPalette";
import { Button } from "./ui/button";

const DEFAULT_COLOR = "#000000";
const DEFAULT_WIDTH = 10;
const DEFAULT_OPACITY = 1;

// HEXをRGBAに変換するユーティリティ関数
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function DrawingCanvas() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY);

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
    canvas.freeDrawingBrush.color = hexToRgba(newColor, opacity);
    canvas.freeDrawingBrush.width = width;
    setColor(newColor);
  };

  const changeOpacity = (value: number[]) => {
    const newOpacity = value[0] / 100;
    setOpacity(newOpacity);
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    if (canvas.freeDrawingBrush instanceof fabric.PencilBrush) {
      canvas.freeDrawingBrush.color = hexToRgba(color, newOpacity);
    }
  };

  const changeToThick = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 20;
    canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
    setWidth(20);
  };

  const changeToThin = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 10;
    canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
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
        <div className="flex flex-col gap-4">
          <ColorPalette
            selectedColor={color}
            onColorChange={changeColor}
            opacity={opacity}
            changeOpacity={changeOpacity}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={changeToThick}>
            <div className="bg-white rounded-full w-5 h-5"></div>
          </Button>
          <Button onClick={changeToThin}>
            <div className="bg-white rounded-full w-[10px] h-[10px]"></div>
          </Button>
          <Button onClick={changeToEraser}>
            <Eraser className="w-4 h-4" />
          </Button>
          <Button onClick={undo}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button onClick={redo}>
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
