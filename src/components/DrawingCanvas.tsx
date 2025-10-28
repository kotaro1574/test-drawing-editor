"use client";

import {
  Circle,
  Download,
  Eraser,
  Minus,
  PaintBucket,
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
import { useFillTool } from "@/hooks/useFillTool";
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
    changeToFill,
  } = useBrushSettings(canvas, setHistories);

  // 図形描画（枠線のみ）
  useShapeDrawing({ canvas, drawMode, color, opacity, strokeWidth: width });

  // 塗りつぶしツール
  useFillTool({ canvas, drawMode, color, opacity });

  // 画像としてダウンロード
  const downloadImage = () => {
    if (!canvas) return;

    // canvasの内容をDataURLとして取得
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    // ダウンロードリンクを作成
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `drawing-${timestamp}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="bg-white">
        <canvas ref={canvasEl} className="border" />
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

            <Button
              onClick={changeToFill}
              variant={drawMode === DRAW_MODE.FILL ? "default" : "outline"}
            >
              <PaintBucket className="w-4 h-4" />
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
            <Button
              onClick={undo}
              className="active:scale-95 active:bg-gray-700 transition-transform touch-manipulation"
              size="lg"
            >
              <Undo className="w-6 h-6" />
            </Button>
            <Button
              onClick={redo}
              className="active:scale-95 active:bg-gray-700 transition-transform touch-manipulation"
              size="lg"
            >
              <Redo className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadImage}
              variant="default"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              画像を保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
