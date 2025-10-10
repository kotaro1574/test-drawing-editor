/**
 * HEXカラーコードをRGBA形式に変換する
 * @param hex - HEXカラーコード（例: "#ff0000"）
 * @param opacity - 不透明度（0-1）
 * @returns RGBA形式の文字列（例: "rgba(255, 0, 0, 0.5)"）
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
