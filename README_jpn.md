# YouTube Translate Share

[한국어](README.md) | [日本語]

日本語 YouTube 学習・翻訳データを共有リンクとして受け取り、動画と二重字幕タイムラインを同期して表示する React ベースの共有ビューアです。共有データは URL パラメータに圧縮された形式で含まれるか、短縮リンクを通じてサーバーから復元されます。ユーザーは動画再生中に、日本語原文、ふりがな、韓国語翻訳、辞書検索、字幕ファイル保存機能を利用できます。

## 編集プログラム Github Repository

[編集プログラム Github](https://github.com/OxxO98/oxxo-youtube)

## デモページ

[demo-stay-with-me](http://oxxo.ddns.net/?l=z8Yuez8RJCRUfTpp)

## 技術スタック

- **React 19 + TypeScript**: コンポーネントベース UI とグローバル型宣言を活用し、型安全性を確保
- **React Router v7**: 共有ページと Not Found ルーティングを構成
- **Redux Toolkit + React Redux**: プレイヤーマーカー、テキスト選択、字幕表示設定の状態管理
- **Ant Design v6**: Layout、Splitter、Modal、Slider、FloatButton などの複合 UI を構成
- **ReactPlayer**: YouTube 動画再生およびカスタムコントロールとの連携
- **react-hotkeys-hook**: 再生、移動、全画面切り替えなどのキーボードショートカットを処理
- **react-responsive**: モバイル、縦幅の短い画面、横向きモードに応じたレイアウト分岐
- **i18next + react-i18next**: 韓国語・日本語 UI の多言語対応
- **rc-virtual-list**: 長いタイムライン一覧の仮想スクロールレンダリング
- **lz-string**: 共有 URL データの解凍
- **file-saver**: 共有字幕データを `.srt` ファイルとして保存
- **axios**: 短縮リンク復元 API の呼び出し

## 主な機能

### 1. 共有リンクベースのデータ読み込み

`useSharedData` は URL クエリパラメータを基準に共有データを読み込みます。

- `?a=` パラメータがある場合、LZ-string で圧縮されたデータを即座に復元します。
- `?l=` パラメータがある場合、`/longUrl` API を呼び出して元の共有データを取得します。
- 有効な共有データがない、またはサーバー応答に失敗した場合は Not Found ページへ移動します。

共有データは `decodeSharedData` でアプリ内部モデルへ正規化されます。

```ts
interface SharedData {
  videoId: string;
  timeline: SharedTimeline[];
}

interface SharedTimeline {
  id: string;
  startTime: number;
  endTime: number;
  jaText: TextData[];
  koText: string;
}
```

圧縮データの元の構造では短いキーを使用します。

- `v`: YouTube videoId
- `t`: タイムライン配列
- `s`, `e`: 開始・終了時間
- `j`: 日本語テキスト、またはふりがなを含むテキスト配列
- `k`: 韓国語翻訳

### 2. YouTube 動画とタイムラインの同期

`useReactPlayerHook` は ReactPlayer の再生状態を 30fps 基準で追跡します。

- `playedSeconds`、`duration`、`playing` の状態管理
- `handleSeek` による特定タイムライン区間への移動
- `setInterval` ベースの時間更新による現在の再生位置の更新
- `SharedTimelineCarousel` と `SharedTimelineList` が同じプレイヤー状態を共有

タイムライン項目をクリックすると、該当文の `startTime` へ移動します。また、現在の再生時間を含む文は自動的にアクティブになります。

### 3. 二重字幕レンダリングとふりがな処理

日本語字幕は単純な文字列ではなく、`TextData[]` として管理されます。

```ts
interface TextData {
  data: string;
  ruby: string | null;
  offset: number;
}
```

`SharedBun` と `ComplexText` はこのデータを `<ruby>` と `<rt>` 構造でレンダリングし、漢字の上にふりがなを表示します。`useHuri` は日本語表記と読みを比較して、漢字・送り仮名単位でテキストを分解し、各断片の offset を保持します。

この構造により、次の機能が可能になります。

- ふりがな付き日本語字幕の表示
- テキスト選択時の原文 offset 追跡
- 選択範囲のハイライト・強調処理のための基盤データ提供
- 同一文内で、ふりがなを除いたテキストのみを辞書検索対象として抽出

### 4. 選択テキストベースの日本語辞書連携

`useHandleSelection` は、特定の DOM 領域内で発生したテキスト選択を検知します。選択されたテキストは Redux の `selection` 状態に保存され、`SharedDictionary` がそれを使用して Naver 日本語辞書を iframe で表示します。

辞書検索は、次の条件を満たす場合にのみ実行されます。

- 選択テキストが空ではない
- 選択長が 10 文字未満
- `useJaText().checkKatachi` 基準で日本語文字と判定される

これにより、ユーザーは動画字幕を見ながら、知らない日本語単語を選択して即座に辞書検索できます。

### 5. レスポンシブ共有ビューアレイアウト

`SharedViewer` は画面条件に応じて UI 構造を切り替えます。

- デスクトップ: `antd` の `Splitter` を使用して、動画領域、辞書パネル、タイムラインパネルを分割
- モバイル・縦幅の短い画面: 動画とカルーセルを中心とした縦レイアウトへ切り替え
- モバイル横向きモード: 動画への没入感を優先したレイアウトを適用
- Enter キーまたは FloatButton により、ヘッダー・サイドパネルを折りたたむ集中モードを提供

### 6. 字幕スタイルのカスタマイズ

`SharedBunSettingModal` は字幕表示設定を Redux の `shared` slice に保存します。

対応設定:

- 日本語・韓国語の表示順
- 日本語・韓国語フォントプリセット
- 言語別フォントサイズ
- 言語別テキスト色
- 字幕背景色
- テキストシャドウ切り替え

設定値は `SharedTimelineCarousel` で、字幕 preview と実際の動画オーバーレイレンダリングの両方に使用されます。

### 7. 字幕ファイル保存

`createCaptionFile` は共有タイムラインデータを字幕テキストへ変換し、`file-saver` でダウンロードします。

- 日本語字幕の保存
- 韓国語字幕の保存
- ファイル名: `CAPTION_{videoId}.srt`
- タイムスタンプ変換には `useTimeStamp().timeToTS` を使用

## アプリケーション構造

```txt
src/
  App.tsx
  i18n.ts
  components/
    Bun.tsx
    SelectLocaleComp.tsx
  contexts/
    MediaQueryContext.tsx
    ServerContext.tsx
    UnicodeContext.tsx
    VideoContext.tsx
  entities/
    shared/
      lib/
        createCaptionFile.ts
        decodeSharedData.ts
      model/
        types.ts
  hooks/
    AxiosHook.tsx
    HuriHook.tsx
    JaTextHook.tsx
    ReactPlayerHook.tsx
    SelectionHook.tsx
    VideoPlayHook.tsx
  pages/
    shared/
      model/
        useSharedData.ts
      ui/
        SharedHeader.tsx
        SharedPage.tsx
  reducers/
    reactPlayerReducer.tsx
    selectionReducer.tsx
    sharedReducer.tsx
    store.tsx
  widgets/
    shared-viewer/
      config/
      lib/
      model/
      ui/
```

## 主要モジュールの責務

| モジュール                                  | 責務                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `App.tsx`                                   | グローバル Provider、Ant Design テーマ、Router、HotkeysProvider の構成       |
| `pages/shared/model/useSharedData.ts`       | URL パラメータ解析、共有データ復元、短縮リンク API 連携                      |
| `entities/shared/lib/decodeSharedData.ts`   | 圧縮共有データの内部モデル変換                                               |
| `entities/shared/lib/createCaptionFile.ts`  | 共有タイムラインの字幕ファイル変換および保存                                 |
| `widgets/shared-viewer/ui/SharedViewer.tsx` | レスポンシブレイアウト、パネル分割、動画・辞書・タイムラインの組み立て       |
| `SharedTimelineCarousel.tsx`                | 動画上の字幕オーバーレイ、再生コントロール、キーボードによるタイムライン移動 |
| `SharedTimelineList.tsx`                    | 仮想スクロールベースの全タイムライン一覧および現在文の自動追跡               |
| `SharedDictionary.tsx`                      | 選択された日本語テキストを辞書 iframe へ接続                                 |
| `components/Bun.tsx`                        | ふりがな付き日本語テキストのレンダリング                                     |
| `hooks/VideoPlayHook.tsx`                   | 区間移動、フレーム移動、ループ、ショートカット再生制御                       |
| `reducers/sharedReducer.tsx`                | 字幕スタイル設定の状態管理                                                   |
| `reducers/selectionReducer.tsx`             | テキスト選択および offset 状態管理                                           |

## キーボードインタラクション

`useHandleKeyboard` と `react-hotkeys-hook` により、動画学習に必要なショートカットを提供します。

- Space: 再生・一時停止
- `z` / `v`: 1 秒前・次へ移動
- `x` / `c`: 1 フレーム前・次へ移動
- `b` / `g`: マーカー再生・停止
- `r`: 区間リピート
- ArrowLeft / ArrowRight: 前・次のタイムライン文へ移動
- Enter: 共有ページ集中モードの切り替え

## 今後の改善

- 字幕保存に韓国語の発音を追加する機能
- 字幕スタイルもあわせて export する方式の検討
