# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-09
**Commit:** 193ae21
**Branch:** feature/kotaro/new-x-post

## OVERVIEW

Fabric.js ベースのお絵描きWebアプリ。Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui。単一ページ構成。

## STRUCTURE

```
src/
├── app/            # Next.js App Router（page.tsx がエントリーポイント）
├── components/     # DrawingCanvas（メイン）, ColorPalette
│   └── ui/         # shadcn/ui (button, slider, aspect-ratio)
├── hooks/          # Canvas操作の全ロジック（5 hooks）
└── lib/            # drawingUtils, drawingConstants, utils(cn)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 描画ツール追加 | `src/hooks/` | 新hookを作成し DrawingCanvas で統合 |
| UI変更 | `src/components/DrawingCanvas.tsx` | ツールバー・ボタン配置 |
| 色・定数変更 | `src/lib/drawingConstants.ts` | DRAW_MODE, デフォルト値 |
| 塗りつぶしロジック | `src/lib/drawingUtils.ts` | floodFill アルゴリズム |
| shadcn/uiコンポーネント追加 | `src/components/ui/` | `components.json` で new-york スタイル |

## ARCHITECTURE

DrawingCanvas が5つのhookを統合するオーケストレーター:

```
DrawingCanvas.tsx
├── useDrawingCanvas    → Fabric.Canvas初期化、リサイズ対応
├── useDrawingHistory   → Undo/Redo（デバウンス付きJSON履歴）
├── useBrushSettings    → 色/太さ/透明度/ツール切替
├── useShapeDrawing     → 矩形/楕円/直線（mouse:down/move/up）
└── useFillTool         → Flood Fill（ピクセル操作→Image変換）
```

- 図形描画中は `_isDrawing` フラグで履歴保存をスキップ
- 消しゴムは `@erase2d/fabric` の `EraserBrush` を使用
- `fabric` と `@erase2d/fabric` が両方依存関係にある（意図的）

## CONVENTIONS

- パスエイリアス: `@/*` → `./src/*`
- JSDocコメント: 日本語で記述
- UIコンポーネント: shadcn/ui (new-york style, Radix UI + lucide-react)
- CSS: Tailwind CSS v4 (PostCSSプラグイン方式、tailwind.config不要)
- 全ページ "use client"（Canvas操作のためCSR必須）

## ANTI-PATTERNS (THIS PROJECT)

- `any` 使用禁止 — 現在3箇所で `as any` が `_isDrawing` フラグに使われている（要修正: Fabric.js型拡張で対応）
- コメント不要 — コードにコメントを書かない
- `useEffect` 極力回避 — Canvas初期化・イベントリスナー登録など不可避な場合のみ許容
- 既存実装のパターンを踏襲すること

## COMMANDS

```bash
npm run dev      # 開発サーバー (Turbopack)
npm run build    # ビルド (Turbopack)
npm run start    # プロダクションサーバー
```

## NOTES

- テスト未導入（Jest/Vitest/Playwright いずれもなし）
- ESLint/Prettier 未導入
- CI/CD なし
- `tsconfig.tsbuildinfo` が .gitignore に含まれていない
- Canvas最大サイズ: 1000px（`useDrawingCanvas.ts` の `MAX_CANVAS_SIZE`）
- Retina スケーリング無効化済み（`enableRetinaScaling: false`）
