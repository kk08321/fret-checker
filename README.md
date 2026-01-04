# Fret Checker

ギターの五線譜からフレットボード上の押弦箇所を表示するWebアプリケーションです。
簡単な譜面の再生機能も備えており、音取り・練習のお供に最適です。
主にiPhone/iPadからWebアプリモードで使用する想定です。

## アクセス方法

Azure Static Web Appsで配信しています：
https://proud-plant-070750e00.1.azurestaticapps.net/sheet

iPhone/iPadから上記URLにアクセスし、ブラウザ上でそのまま動作しますが、下記手順にてWebアプリモードで起動することでより快適に利用できます。
https://support.apple.com/ja-jp/guide/iphone/iphea86e5236/ios

## 機能

### 🎵 五線譜ページ
- タッチ操作で音符を入力
- シャープ（#）、フラット（♭）、ナチュラル（♮）モードの切り替え
- 調号の自動適用
- 入力した音符の一覧表示
- アンドゥ/クリア機能
- **小節管理機能**: 複数の小節を作成・削除・切り替えが可能
  - 音価の設定（全音符、二分音符、四分音符、八分音符、十六分音符）
  - 付点音符、三連符の設定
- **音声再生機能**: 
  - 入力した音符を和音として再生（設定でON/OFF可能）
  - 小節単位の再生機能（BPM設定、メトロノーム機能付き）

### 🎸 フレットボードページ
- 入力した音符に対応する押弦箇所を視覚的に表示
- 複数の押弦箇所がある場合はすべて表示
- 音符の順番を番号で表示
- リアルなフレットボードのデザイン
- **小節管理機能**: 五線譜ページと連携して小節ごとの押弦箇所を表示

### ⚙️ 設定ページ
- **調号の選択**: 様々な調号に対応
- **チューニングの選択**:
  - ノーマルチューニング (E-A-D-G-B-E)
  - ドロップDチューニング (D-A-D-G-B-E)
- **入力音の再生**: 音符入力時の音声再生のON/OFF切り替え

## 技術スタック

- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Emotion** - CSS-in-JS
- **React Router** - ルーティング

## セットアップ

### 必要な環境

- Node.js 18.0.0以上

### インストール

```bash
# 依存関係のインストール
npm install
# または
yarn install
```

### 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) を開いてください。

### ビルド

```bash
npm run build
# または
yarn build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

### プレビュー

```bash
npm run preview
# または
yarn preview
```

## デプロイ

このプロジェクトは Azure Static Web Apps にデプロイされています。

- `main` ブランチへのプッシュで自動デプロイが実行されます
- プルリクエストが作成されると、プレビュー環境が自動的に構築されます

デプロイ設定は `.github/workflows/azure-static-web-apps-proud-plant-070750e00.yml` にあります。

## 使い方

### 基本的な操作

1. **音符の入力**
   - 五線譜ページで五線譜をタッチして音符を入力します
   - シャープ/フラット/ナチュラルボタンで臨時記号を設定できます
   - 音声再生が有効な場合、再生ボタン（▶）を押すと入力した音符を和音として再生できます

2. **小節の管理**
   - 画面上部の小節バーで小節を追加（+）、削除（-）、前後へ移動（< >）ができます
   - 小節番号は「現在の小節/全小節数」の形式で表示されます
   - 音価、付点、三連符の設定が可能です
   - 五線譜ページとフレットボードページで小節情報を共有します

3. **小節単位の再生**
   - 再生ボタンを押すと小節単位の再生モーダルが開きます
   - BPMを設定して、小節ごとに順番に再生できます
   - メトロノーム機能でリズムを確認できます

4. **押弦箇所の確認**
   - フレットボードページに移動すると、現在の小節に入力した音符に対応する押弦箇所が表示されます
   - 複数の押弦箇所がある場合は、すべての位置が番号付きで表示されます

5. **設定の変更**
   - 設定ページで調号、チューニング、音声再生の設定を変更できます
   - 設定はアプリ全体に反映されます

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── AccidentalIcon.tsx
│   ├── ControlPanel.tsx
│   ├── FingeringChip.tsx
│   ├── MeasureBar.tsx
│   ├── MeasurePlaybackModal.tsx
│   ├── ModeBadge.tsx
│   ├── NavigationBar.tsx
│   ├── NoteCard.tsx
│   ├── NoteCardList.tsx
│   └── NoteIcon.tsx
├── contexts/            # React Context
│   ├── AudioSettingsContext.tsx
│   ├── GuitarNotesContext.tsx
│   ├── KeySignatureContext.tsx
│   ├── MeasureContext.tsx
│   └── TuningContext.tsx
├── hooks/               # カスタムフック
│   └── useSheetPage.ts
├── styles/              # スタイル定義
│   └── sheetPageStyles.ts
├── utils/               # ユーティリティ関数
│   ├── audio.ts
│   ├── cookie.ts
│   ├── fretboard.ts
│   ├── keySignature.ts
│   ├── midi.ts
│   ├── noteParser.ts
│   └── noteUtils.ts
├── App.tsx              # メインアプリコンポーネント
├── Bar.tsx              # 五線譜の線を描画するコンポーネント
├── FretboardPage.tsx    # フレットボードページ
├── SheetPage.tsx        # 五線譜ページ
└── SettingsPage.tsx     # 設定ページ
```

## ライセンス

このプロジェクトはプライベートプロジェクトです。
