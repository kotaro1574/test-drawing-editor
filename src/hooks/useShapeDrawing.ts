import * as fabric from "fabric";
import { useCallback, useEffect, useRef } from "react";
import { DrawMode, DRAW_MODE } from "@/lib/drawingConstants";

interface UseShapeDrawingProps {
  canvas: fabric.Canvas | null;
  drawMode: DrawMode;
  color: string;
  opacity: number;
  strokeWidth: number;
}

/**
 * 図形描画を管理するカスタムフック
 * 図形は枠線のみで、塗りつぶしなし
 * @param canvas - fabric.Canvasインスタンス
 * @param drawMode - 現在の描画モード
 * @param color - 図形の枠線の色
 * @param opacity - 図形の枠線の不透明度
 */
export function useShapeDrawing({
  canvas,
  drawMode,
  color,
  opacity,
  strokeWidth,
}: UseShapeDrawingProps) {
  const isDrawingShape = useRef(false);
  const currentShape = useRef<fabric.FabricObject | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  // 図形を作成する（枠線のみ、塗りつぶしなし）
  const createShape = useCallback(
    (left: number, top: number, width: number, height: number) => {
      const strokeColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(
        color.slice(3, 5),
        16
      )}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`;

      switch (drawMode) {
        case DRAW_MODE.RECTANGLE:
          return new fabric.Rect({
            left,
            top,
            width: Math.abs(width),
            height: Math.abs(height),
            fill: "transparent", // 塗りつぶしなし
            stroke: strokeColor,
            strokeWidth,
            erasable: true,
          });

        case DRAW_MODE.CIRCLE:
          // 楕円を使用して、矩形範囲に収まるようにする
          // 中心位置を計算
          const centerX = left + width / 2;
          const centerY = top + height / 2;
          return new fabric.Ellipse({
            left: centerX,
            top: centerY,
            rx: Math.abs(width) / 2, // 横方向の半径
            ry: Math.abs(height) / 2, // 縦方向の半径
            fill: "transparent", // 塗りつぶしなし
            stroke: strokeColor,
            strokeWidth,
            erasable: true,
            originX: "center", // 中心を基準にする
            originY: "center",
          });

        case DRAW_MODE.LINE:
          // 始点から終点まで直線を引く
          return new fabric.Line([left, top, left, top], {
            stroke: strokeColor,
            strokeWidth,
            erasable: true,
          });

        default:
          return null;
      }
    },
    [drawMode, color, opacity, strokeWidth]
  );

  // マウスダウン時の処理
  const handleMouseDown = useCallback(
    (event: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
      if (
        !canvas ||
        drawMode === DRAW_MODE.PENCIL ||
        drawMode === DRAW_MODE.ERASER
      ) {
        return;
      }

      isDrawingShape.current = true;
      const pointer = event.scenePoint;
      startPoint.current = { x: pointer.x, y: pointer.y };

      // 初期図形を作成（描画中フラグを付けて履歴保存をスキップ）
      const shape = createShape(pointer.x, pointer.y, 0, 0);
      if (shape) {
        (shape as any)._isDrawing = true;
        currentShape.current = shape;
        canvas.add(shape);
      }
    },
    [canvas, drawMode, createShape]
  );

  // マウス移動時の処理
  const handleMouseMove = useCallback(
    (event: fabric.TPointerEventInfo<fabric.TPointerEvent>) => {
      if (
        !canvas ||
        !isDrawingShape.current ||
        !currentShape.current ||
        !startPoint.current
      ) {
        return;
      }

      const pointer = event.scenePoint;
      const width = pointer.x - startPoint.current.x;
      const height = pointer.y - startPoint.current.y;

      // 図形を更新
      if (currentShape.current instanceof fabric.Rect) {
        currentShape.current.set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width > 0 ? startPoint.current.x : pointer.x,
          top: height > 0 ? startPoint.current.y : pointer.y,
        });
      } else if (currentShape.current instanceof fabric.Ellipse) {
        // 楕円を矩形範囲に収める
        const rectLeft = width > 0 ? startPoint.current.x : pointer.x;
        const rectTop = height > 0 ? startPoint.current.y : pointer.y;
        const centerX = rectLeft + Math.abs(width) / 2;
        const centerY = rectTop + Math.abs(height) / 2;

        currentShape.current.set({
          rx: Math.abs(width) / 2,
          ry: Math.abs(height) / 2,
          left: centerX,
          top: centerY,
        });
      } else if (currentShape.current instanceof fabric.Line) {
        // 線の終点を更新
        currentShape.current.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      canvas.renderAll();
    },
    [canvas]
  );

  // マウスアップ時の処理
  const handleMouseUp = useCallback(() => {
    if (!canvas || !isDrawingShape.current || !currentShape.current) {
      return;
    }

    // 描画中フラグを削除して、図形を削除→再追加することで最終的な状態で履歴に保存
    const shape = currentShape.current;
    delete (shape as any)._isDrawing;
    canvas.remove(shape);
    canvas.add(shape);

    isDrawingShape.current = false;
    currentShape.current = null;
    startPoint.current = null;
  }, [canvas]);

  // イベントリスナーの登録・解除
  useEffect(() => {
    if (!canvas) {
      return;
    }

    // 図形描画モードの場合
    if (
      drawMode === DRAW_MODE.RECTANGLE ||
      drawMode === DRAW_MODE.CIRCLE ||
      drawMode === DRAW_MODE.LINE
    ) {
      canvas.isDrawingMode = false;
      canvas.selection = false;

      canvas.on("mouse:down", handleMouseDown);
      canvas.on("mouse:move", handleMouseMove);
      canvas.on("mouse:up", handleMouseUp);
    } else {
      // ペンシルモードまたは消しゴムモードの場合
      canvas.isDrawingMode = true;
      canvas.selection = false;
    }

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, drawMode, handleMouseDown, handleMouseMove, handleMouseUp]);
}
