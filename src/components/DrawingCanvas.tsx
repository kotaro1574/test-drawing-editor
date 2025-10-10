"use client";

import { Eraser, Redo, Undo } from "lucide-react";
import { useRef } from "react";
import { useDrawingCanvas } from "@/hooks/useDrawingCanvas";
import { useDrawingHistory } from "@/hooks/useDrawingHistory";
import { useBrushSettings } from "@/hooks/useBrushSettings";
import { ColorPalette } from "./ColorPalette";
import { Button } from "./ui/button";

/**
 * 描画キャンバスコンポーネント
 * ブラシの設定、描画履歴の管理、UI表示を担当
 */
export function DrawingCanvas() {
  const canvasEl = useRef<HTMLCanvasElement>(null);

  // Canvas初期化
  const canvas = useDrawingCanvas(canvasEl);

  // 履歴管理（Undo/Redo）
  const { setHistories, undo, redo } = useDrawingHistory(canvas);

  // ブラシ設定（色、太さ、透明度、消しゴム）
  const {
    color,
    opacity,
    changeColor,
    changeOpacity,
    changeToThick,
    changeToThin,
    changeToEraser,
  } = useBrushSettings(canvas, setHistories);

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
