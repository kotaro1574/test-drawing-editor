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

/**
 * Flood Fill（塗りつぶし）アルゴリズム
 * クリックした位置から同じ色の領域を指定した色で塗りつぶす
 * @param imageData - キャンバスのImageData
 * @param x - クリック位置のx座標
 * @param y - クリック位置のy座標
 * @param fillColor - 塗りつぶす色 {r, g, b, a}
 */
export function floodFill(
  imageData: ImageData,
  x: number,
  y: number,
  fillColor: { r: number; g: number; b: number; a: number }
): void {
  const { width, height, data } = imageData;
  const targetColor = getPixelColor(data, x, y, width);

  // 塗りつぶす色と対象の色が同じ場合は何もしない
  if (colorsMatch(targetColor, fillColor)) {
    return;
  }

  const pixelsToCheck: [number, number][] = [[x, y]];
  const visited = new Set<string>();

  while (pixelsToCheck.length > 0) {
    const [currentX, currentY] = pixelsToCheck.pop()!;
    const key = `${currentX},${currentY}`;

    // 範囲外または訪問済みならスキップ
    if (
      currentX < 0 ||
      currentX >= width ||
      currentY < 0 ||
      currentY >= height ||
      visited.has(key)
    ) {
      continue;
    }

    visited.add(key);

    const currentColor = getPixelColor(data, currentX, currentY, width);

    // 色が一致する場合のみ塗りつぶす
    if (colorsMatch(currentColor, targetColor)) {
      setPixelColor(data, currentX, currentY, width, fillColor);

      // 上下左右の隣接ピクセルをチェックリストに追加
      pixelsToCheck.push([currentX + 1, currentY]);
      pixelsToCheck.push([currentX - 1, currentY]);
      pixelsToCheck.push([currentX, currentY + 1]);
      pixelsToCheck.push([currentX, currentY - 1]);
    }
  }
}

/**
 * 指定位置のピクセル色を取得
 */
function getPixelColor(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number
): { r: number; g: number; b: number; a: number } {
  const index = (y * width + x) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3],
  };
}

/**
 * 指定位置のピクセル色を設定
 */
function setPixelColor(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  color: { r: number; g: number; b: number; a: number }
): void {
  const index = (y * width + x) * 4;
  data[index] = color.r;
  data[index + 1] = color.g;
  data[index + 2] = color.b;
  data[index + 3] = color.a;
}

/**
 * 2つの色が一致するかチェック
 */
function colorsMatch(
  color1: { r: number; g: number; b: number; a: number },
  color2: { r: number; g: number; b: number; a: number }
): boolean {
  return (
    color1.r === color2.r &&
    color1.g === color2.g &&
    color1.b === color2.b &&
    color1.a === color2.a
  );
}
