import * as fabric from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";

interface DrawingHistories {
  undo: object[];
  redo: object[];
}

/**
 * 描画履歴（Undo/Redo）を管理するカスタムフック
 * @param canvas - fabric.Canvasインスタンス
 * @returns 履歴状態とUndo/Redo関数
 */
export function useDrawingHistory(canvas: fabric.Canvas | null) {
  const [histories, setHistories] = useState<DrawingHistories>({
    undo: [],
    redo: [],
  });

  const isCanvasLocked = useRef(false);

  // Canvas初期化時に空の履歴を追加
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

  // Undo実行
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

  // Redo実行
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

  return {
    histories,
    setHistories,
    undo,
    redo,
  };
}
