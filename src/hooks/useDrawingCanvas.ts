import * as fabric from "fabric";
import { useEffect, useState } from "react";
import { DEFAULT_COLOR, DEFAULT_WIDTH } from "@/lib/drawingConstants";

const MAX_CANVAS_SIZE = 1000;

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

    // 画面幅を取得してキャンバスサイズを決定
    const getCanvasSize = () => {
      const screenWidth = window.innerWidth;
      // 画面幅が1000px以上なら1000px、未満なら画面幅
      const size =
        screenWidth >= MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE : screenWidth;
      return size;
    };

    const canvasSize = getCanvasSize();

    // Canvas要素のサイズを設定
    if (canvasRef.current) {
      canvasRef.current.width = canvasSize;
      canvasRef.current.height = canvasSize;
    }

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize,
      height: canvasSize,
      enableRetinaScaling: false, // Retinaディスプレイの自動スケーリングを無効化
    });

    // 手書き機能を追加
    const pencil = new fabric.PencilBrush(fabricCanvas);
    pencil.color = DEFAULT_COLOR;
    pencil.width = DEFAULT_WIDTH;
    fabricCanvas.freeDrawingBrush = pencil;
    fabricCanvas.isDrawingMode = true;

    // 消しゴムで線を消せるようにし、選択できないようにする
    fabricCanvas.on("object:added", (e) => {
      e.target.erasable = true;
      e.target.selectable = false;
    });

    // リサイズ時の処理
    const handleResize = () => {
      const newSize = getCanvasSize();

      // 現在の描画内容を保存
      const json = fabricCanvas.toJSON();

      // キャンバスサイズを変更
      fabricCanvas.setDimensions({
        width: newSize,
        height: newSize,
      });

      // 描画内容を復元
      fabricCanvas.loadFromJSON(json).then(() => {
        fabricCanvas.renderAll();
      });
    };

    window.addEventListener("resize", handleResize);

    setCanvas(fabricCanvas);

    return () => {
      window.removeEventListener("resize", handleResize);
      fabricCanvas.dispose();
    };
  }, [canvasRef]);

  return canvas;
}
