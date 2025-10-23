export const DEFAULT_COLOR = "#000000";
export const DEFAULT_WIDTH = 10;
export const DEFAULT_OPACITY = 1;
export const THICK_WIDTH = 20;
export const THIN_WIDTH = 10;
export const ERASER_WIDTH = 20;

// 描画モード
export const DRAW_MODE = {
  PENCIL: "pencil",
  ERASER: "eraser",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  LINE: "line",
  FILL: "fill", // 塗りつぶしツール
} as const;

export type DrawMode = (typeof DRAW_MODE)[keyof typeof DRAW_MODE];
