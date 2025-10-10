"use client";

import { Slider } from "./ui/slider";

interface ColorPaletteProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  opacity: number;
  changeOpacity: (value: number[]) => void;
}

const COLORS = [
  // 1行目
  "#000000", // 黒
  "#808080", // グレー
  "#0000FF", // 青

  // 2行目
  "#FFFFFF", // 白
  "#A9A9A9", // ダークグレー
  "#00BFFF", // シアン

  // 3行目
  "#008000", // 緑
  "#8B0000", // ダークレッド
  "#8B4513", // ブラウン

  // 4行目
  "#90EE90", // ライトグリーン
  "#FF0000", // 赤
  "#FFA500", // オレンジ

  // 5行目
  "#DAA520", // ゴールド
  "#800080", // 紫
  "#F08080", // ライトコーラル

  // 6行目
  "#FFD700", // イエロー
  "#FF00FF", // マゼンタ
  "#FFB6C1", // ライトピンク
];

export function ColorPalette({
  selectedColor,
  onColorChange,
  opacity,
  changeOpacity,
}: ColorPaletteProps) {
  return (
    <div className="rounded-lg inline-block">
      <div className="grid grid-cols-3 gap-2 mb-4">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
              selectedColor === color
                ? "border-yellow-400 scale-95"
                : "border-gray-700 hover:border-gray-600"
            }`}
            style={{ backgroundColor: color }}
            aria-label={`色を${color}に変更`}
          />
        ))}
      </div>

      <Slider
        value={[opacity * 100]}
        onValueChange={changeOpacity}
        min={0}
        max={100}
        step={1}
        className="flex-1"
      />
    </div>
  );
}
