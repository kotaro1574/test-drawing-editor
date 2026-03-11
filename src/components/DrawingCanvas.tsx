"use client";

import {
  Circle,
  Download,
  Eraser,
  Minus,
  PaintBucket,
  Pencil,
  Redo,
  Share2,
  Square,
  Undo,
} from "lucide-react";
import { useRef, useState } from "react";
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

  const [isSharing, setIsSharing] = useState(false);

  const downloadImage = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `drawing-${timestamp}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToX = async () => {
    if (!canvas || isSharing) return;

    setIsSharing(true);
    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      });

      const response = await fetch("/api/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataURL }),
      });

      const { id } = (await response.json()) as { id: string };

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const shareUrl = `${baseUrl}/share/${id}`;
      const text = "絵を描いたよ！";
      const xIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;

      window.open(xIntentUrl, "_blank");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="glass-card rounded-2xl p-2">
        <canvas ref={canvasEl} className="rounded-xl bg-white" />
      </div>

      <div className="flex flex-wrap items-start justify-center gap-4">
        <div className="glass-card rounded-2xl p-4">
          <ColorPalette
            selectedColor={color}
            onColorChange={changeColor}
            opacity={opacity}
            changeOpacity={changeOpacity}
          />
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={changeToPencil}
              variant={drawMode === DRAW_MODE.PENCIL ? "default" : "ghost"}
              className={drawMode === DRAW_MODE.PENCIL ? "bg-violet-500 text-white hover:bg-violet-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <Button
              onClick={changeToEraser}
              variant={drawMode === DRAW_MODE.ERASER ? "default" : "ghost"}
              className={drawMode === DRAW_MODE.ERASER ? "bg-violet-500 text-white hover:bg-violet-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
            >
              <Eraser className="w-4 h-4" />
            </Button>

            <Button
              onClick={changeToFill}
              variant={drawMode === DRAW_MODE.FILL ? "default" : "ghost"}
              className={drawMode === DRAW_MODE.FILL ? "bg-violet-500 text-white hover:bg-violet-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
            >
              <PaintBucket className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => changeToShape(DRAW_MODE.RECTANGLE)}
              variant={drawMode === DRAW_MODE.RECTANGLE ? "default" : "ghost"}
              className={drawMode === DRAW_MODE.RECTANGLE ? "bg-violet-500 text-white hover:bg-violet-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => changeToShape(DRAW_MODE.CIRCLE)}
              variant={drawMode === DRAW_MODE.CIRCLE ? "default" : "ghost"}
              className={drawMode === DRAW_MODE.CIRCLE ? "bg-violet-500 text-white hover:bg-violet-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => changeToShape(DRAW_MODE.LINE)}
              variant={drawMode === DRAW_MODE.LINE ? "default" : "ghost"}
              className={drawMode === DRAW_MODE.LINE ? "bg-violet-500 text-white hover:bg-violet-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={changeToThick}
              variant={width === THICK_WIDTH ? "default" : "ghost"}
              className={width === THICK_WIDTH ? "bg-violet-500 text-white hover:bg-violet-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
            >
              <div
                className={`${
                  width === THICK_WIDTH ? "bg-white" : "bg-gray-600"
                } rounded-full w-5 h-5`}
              ></div>
            </Button>
            <Button
              onClick={changeToThin}
              variant={width === THIN_WIDTH ? "default" : "ghost"}
              className={width === THIN_WIDTH ? "bg-violet-500 text-white hover:bg-violet-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}
            >
              <div
                className={`${
                  width === THIN_WIDTH ? "bg-white" : "bg-gray-600"
                } rounded-full w-[10px] h-[10px]`}
              ></div>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={undo}
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all touch-manipulation"
              size="lg"
            >
              <Undo className="w-6 h-6" />
            </Button>
            <Button
              onClick={redo}
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all touch-manipulation"
              size="lg"
            >
              <Redo className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadImage}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 glow"
            >
              <Download className="w-4 h-4 mr-2" />
              画像を保存
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={shareToX}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 glow-cyan"
              disabled={isSharing}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isSharing ? "共有中..." : "Xでシェア"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
