import * as fabric from "fabric";
import { useEffect, useState } from "react";
import { DEFAULT_COLOR, DEFAULT_WIDTH } from "@/lib/drawingConstants";

/**
 * Canvas初期化とセットアップを管理するカスタムフック
 * @param canvasRef - Canvasエレメントへの参照
 * @returns fabric.Canvasインスタンス
 */
export function useDrawingCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const fabricCanvas = new fabric.Canvas(canvasRef.current);

    // 手書き機能を追加
    const pencil = new fabric.PencilBrush(fabricCanvas);
    pencil.color = DEFAULT_COLOR;
    pencil.width = DEFAULT_WIDTH;
    fabricCanvas.freeDrawingBrush = pencil;
    fabricCanvas.isDrawingMode = true;

    // 消しゴムで線を消せるようにするため
    fabricCanvas.on("object:added", (e) => {
      e.target.erasable = true;
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [canvasRef]);

  return canvas;
}
