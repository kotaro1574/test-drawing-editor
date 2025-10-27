import * as fabric from "fabric";
import { useCallback, useEffect } from "react";
import { DRAW_MODE, DrawMode } from "@/lib/drawingConstants";
import { floodFill } from "@/lib/drawingUtils";

interface UseFillToolProps {
  canvas: fabric.Canvas | null;
  drawMode: DrawMode;
  color: string;
  opacity: number;
}

/**
 * 塗りつぶしツールを管理するカスタムフック
 * クリックした位置から同じ色の領域を塗りつぶす（Flood Fill）
 */
export function useFillTool({
  canvas,
  drawMode,
  color,
  opacity,
}: UseFillToolProps) {
  const handleFill = useCallback(
    (event: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
      if (!canvas || drawMode !== DRAW_MODE.FILL) {
        return;
      }

      const pointer = event.scenePoint;
      const x = Math.floor(pointer.x);
      const y = Math.floor(pointer.y);

      // Canvasの2Dコンテキストを取得
      const canvasElement = canvas.getElement();
      const ctx = canvasElement.getContext("2d");
      if (!ctx) {
        return;
      }

      // 現在のキャンバスの画像データを取得
      const imageData = ctx.getImageData(
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // 塗りつぶす色をRGBAに変換
      const fillColor = {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16),
        a: Math.round(opacity * 255),
      };

      // Flood Fillアルゴリズムで塗りつぶし
      floodFill(imageData, x, y, fillColor);

      // 塗りつぶした結果をキャンバスに戻す
      ctx.putImageData(imageData, 0, 0);

      // Fabric.jsのオブジェクトとして保存するため、画像を作成
      const dataURL = canvasElement.toDataURL();
      fabric.FabricImage.fromURL(dataURL).then((img) => {
        // 既存のオブジェクトを全てクリア
        canvas.clear();

        // 塗りつぶした画像を追加
        img.set({
          left: 0,
          top: 0,
          selectable: false,
          erasable: true,
        });
        canvas.add(img);
        canvas.renderAll();

        // object:addedイベントを発火させて履歴に保存
        canvas.fire("object:added", { target: img });
      });
    },
    [canvas, drawMode, color, opacity]
  );

  useEffect(() => {
    if (!canvas || drawMode !== DRAW_MODE.FILL) {
      return;
    }

    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.on("mouse:down", handleFill);

    return () => {
      canvas.off("mouse:down", handleFill);
    };
  }, [canvas, drawMode, handleFill]);
}
