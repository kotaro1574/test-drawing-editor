import { EraserBrush } from "@erase2d/fabric";
import * as fabric from "fabric";
import { useState } from "react";
import {
  DEFAULT_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_WIDTH,
  ERASER_WIDTH,
  THICK_WIDTH,
  THIN_WIDTH,
} from "@/lib/drawingConstants";
import { hexToRgba } from "@/lib/drawingUtils";

/**
 * ブラシ設定（色、太さ、透明度）を管理するカスタムフック
 * @param canvas - fabric.Canvasインスタンス
 * @param setHistories - 履歴を更新する関数（消しゴム用）
 * @returns ブラシ設定の状態と変更関数
 */
export function useBrushSettings(
  canvas: fabric.Canvas | null,
  setHistories?: (
    updater: (prev: { undo: object[]; redo: object[] }) => {
      undo: object[];
      redo: object[];
    }
  ) => void
) {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY);

  // 色を変更
  const changeColor = (newColor: string) => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = hexToRgba(newColor, opacity);
    canvas.freeDrawingBrush.width = width;
    setColor(newColor);
  };

  // 透明度を変更
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

  // 太いブラシに変更
  const changeToThick = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = THICK_WIDTH;
    canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
    setWidth(THICK_WIDTH);
  };

  // 細いブラシに変更
  const changeToThin = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = THIN_WIDTH;
    canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
    setWidth(THIN_WIDTH);
  };

  // 消しゴムに変更
  const changeToEraser = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    const eraser = new EraserBrush(canvas);

    // 消しゴムの終了時に履歴に追加
    eraser.on("end", async (e) => {
      e.preventDefault();

      await eraser.commit(e.detail);
      if (setHistories) {
        setHistories((prev) => ({
          undo: [...prev.undo, canvas.toJSON()],
          redo: [],
        }));
      }
    });

    canvas.freeDrawingBrush = eraser;
    canvas.freeDrawingBrush.width = ERASER_WIDTH;
  };

  return {
    color,
    width,
    opacity,
    changeColor,
    changeOpacity,
    changeToThick,
    changeToThin,
    changeToEraser,
  };
}
