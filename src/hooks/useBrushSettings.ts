import { EraserBrush } from "@erase2d/fabric";
import * as fabric from "fabric";
import { useState } from "react";
import {
  DEFAULT_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_WIDTH,
  DRAW_MODE,
  DrawMode,
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
  const [drawMode, setDrawMode] = useState<DrawMode>(DRAW_MODE.PENCIL);

  // 色を変更
  const changeColor = (newColor: string) => {
    setColor(newColor);
    if (
      canvas?.freeDrawingBrush === undefined ||
      drawMode !== DRAW_MODE.PENCIL
    ) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = hexToRgba(newColor, opacity);
    canvas.freeDrawingBrush.width = width;
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

  // ペンシルモードに変更
  const changeToPencil = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
    canvas.freeDrawingBrush.width = width;
    canvas.isDrawingMode = true;
    setDrawMode(DRAW_MODE.PENCIL);
  };

  // 太いブラシに変更
  const changeToThick = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }

    if (drawMode === DRAW_MODE.ERASER) {
      canvas.freeDrawingBrush = new EraserBrush(canvas);
      canvas.freeDrawingBrush.width = THICK_WIDTH;
      canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
      canvas.isDrawingMode = true;
      setDrawMode(DRAW_MODE.ERASER);
      setWidth(THICK_WIDTH);
      return;
    }

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = THICK_WIDTH;
    canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
    canvas.isDrawingMode = true;
    setWidth(THICK_WIDTH);
    setDrawMode(DRAW_MODE.PENCIL);
  };

  // 細いブラシに変更
  const changeToThin = () => {
    if (canvas?.freeDrawingBrush === undefined) {
      return;
    }

    if (drawMode === DRAW_MODE.ERASER) {
      canvas.freeDrawingBrush = new EraserBrush(canvas);
      canvas.freeDrawingBrush.width = THIN_WIDTH;
      canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
      canvas.isDrawingMode = true;
      setWidth(THIN_WIDTH);
      setDrawMode(DRAW_MODE.ERASER);
      return;
    }

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = THIN_WIDTH;
    canvas.freeDrawingBrush.color = hexToRgba(color, opacity);
    canvas.isDrawingMode = true;
    setWidth(THIN_WIDTH);
    setDrawMode(DRAW_MODE.PENCIL);
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
    canvas.freeDrawingBrush.width = width;
    canvas.isDrawingMode = true;
    setDrawMode(DRAW_MODE.ERASER);
  };

  // 図形モードに変更
  const changeToShape = (shape: DrawMode) => {
    if (!canvas) {
      return;
    }
    canvas.isDrawingMode = false;
    setDrawMode(shape);
  };

  return {
    color,
    width,
    opacity,
    drawMode,
    changeColor,
    changeOpacity,
    changeToPencil,
    changeToThick,
    changeToThin,
    changeToEraser,
    changeToShape,
  };
}
