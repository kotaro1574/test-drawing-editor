import * as fabric from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";

interface DrawingHistories {
  undo: object[];
  redo: object[];
}

/**
 * 描画履歴（Undo/Redo）を管理するカスタムフック（改善版）
 * - object:added, object:modified, object:removed イベントを監視
 * - デバウンス処理で過剰な履歴保存を防ぐ
 * @param canvas - fabric.Canvasインスタンス
 * @returns 履歴状態とUndo/Redo関数
 */
export function useDrawingHistory(canvas: fabric.Canvas | null) {
  const [histories, setHistories] = useState<DrawingHistories>({
    undo: [],
    redo: [],
  });

  const isCanvasLocked = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // 履歴を保存する関数（デバウンス付き）
    const saveHistory = () => {
      if (isCanvasLocked.current) {
        return;
      }

      // 既存のタイムアウトをクリア
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // デバウンス: 100ms後に保存
      saveTimeoutRef.current = setTimeout(() => {
        setHistories((prev) => ({
          undo: [...prev.undo, canvas.toJSON()],
          redo: [],
        }));
      }, 100);
    };

    // オブジェクト追加時
    const onObjectAdded = (e: { target: fabric.FabricObject }) => {
      // 描画中の図形（_isDrawingフラグが付いている）は履歴に保存しない
      if ((e.target as any)._isDrawing) {
        return;
      }
      saveHistory();
    };

    // オブジェクト変更時
    const onObjectModified = () => {
      saveHistory();
    };

    // オブジェクト削除時
    const onObjectRemoved = () => {
      saveHistory();
    };

    // パス作成時（フリーハンド描画完了時）
    const onPathCreated = () => {
      saveHistory();
    };

    canvas.on("object:added", onObjectAdded);
    canvas.on("object:modified", onObjectModified);
    canvas.on("object:removed", onObjectRemoved);
    canvas.on("path:created", onPathCreated);

    return () => {
      canvas.off("object:added", onObjectAdded);
      canvas.off("object:modified", onObjectModified);
      canvas.off("object:removed", onObjectRemoved);
      canvas.off("path:created", onPathCreated);

      // タイムアウトをクリア
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
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

    // デバウンスのタイムアウトをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

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

    // デバウンスのタイムアウトをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

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
