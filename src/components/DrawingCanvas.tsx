"use client";

import {
  Circle,
  Eraser,
  Minus,
  Pencil,
  Redo,
  Square,
  Undo,
} from "lucide-react";
import { useRef } from "react";
import { useDrawingCanvas } from "@/hooks/useDrawingCanvas";
import { useDrawingHistory } from "@/hooks/useDrawingHistory";
import { useBrushSettings } from "@/hooks/useBrushSettings";
import { useShapeDrawing } from "@/hooks/useShapeDrawing";
import { DRAW_MODE, THICK_WIDTH, THIN_WIDTH } from "@/lib/drawingConstants";
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

  // ブラシ設定（色、太さ、透明度、消しゴム、図形）
  const {
    color,
    opacity,
    drawMode,
    width,
    changeColor,
    changeOpacity,
    changeToPencil,
    changeToThick,
    changeToThin,
    changeToEraser,
    changeToShape,
  } = useBrushSettings(canvas, setHistories);

  // 図形描画（枠線のみ）
  useShapeDrawing({ canvas, drawMode, color, opacity });

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="bg-white">
        <canvas width="1000" height="1000" ref={canvasEl} className="border" />
      </div>

      <div className="flex flex-wrap items-start justify-center gap-4">
        <div className="flex flex-col gap-4">
          <ColorPalette
            selectedColor={color}
            onColorChange={changeColor}
            opacity={opacity}
            changeOpacity={changeOpacity}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={changeToPencil}
              variant={drawMode === DRAW_MODE.PENCIL ? "default" : "outline"}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <Button
              onClick={changeToEraser}
              variant={drawMode === DRAW_MODE.ERASER ? "default" : "outline"}
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => changeToShape(DRAW_MODE.RECTANGLE)}
              variant={drawMode === DRAW_MODE.RECTANGLE ? "default" : "outline"}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => changeToShape(DRAW_MODE.CIRCLE)}
              variant={drawMode === DRAW_MODE.CIRCLE ? "default" : "outline"}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => changeToShape(DRAW_MODE.LINE)}
              variant={drawMode === DRAW_MODE.LINE ? "default" : "outline"}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={changeToThick}
              variant={width === THICK_WIDTH ? "default" : "outline"}
            >
              <div
                className={`${
                  width === THICK_WIDTH ? "bg-white" : "bg-black"
                } rounded-full w-5 h-5`}
              ></div>
            </Button>
            <Button
              onClick={changeToThin}
              variant={width === THIN_WIDTH ? "default" : "outline"}
            >
              <div
                className={`${
                  width === THIN_WIDTH ? "bg-white" : "bg-black"
                } rounded-full w-[10px] h-[10px]`}
              ></div>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={undo}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button onClick={redo}>
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
