@AGENTS.md

# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code 向けのガイドです。
記載内容は既存コードから確認できた事実に基づきます。確認できなかった事項は「不明」と記載しています。

## プロジェクトの目的

- アプリ名は「孤独じゃないグルメ」、説明は「来訪レストラン記録アプリ」です（`app/layout.tsx` の metadata）。
- 訪れたレストランの記録（店名・最寄り駅・ジャンル・ランチ/ディナー・予算・訪問日・URL・メモ・画像）の一覧表示、追加、編集、削除を行います。
- 4 人のレビュアー（A〜D）がそれぞれ評価を付けられます（`rating_a`〜`rating_d`）。レビュアーの表示名は DB で設定できます。
- メールアドレスとパスワードでログインします。画面上の文言は「アカウントをお持ちでない方は管理者にお問い合わせください」で、サインアップ画面はありません。
- 利用者の範囲や運用ルールなど、上記以外の要件は不明です。

## 技術スタック

| 項目 | 内容 |
| --- | --- |
| フレームワーク | Next.js 16.2.4（App Router） |
| UI | React 19.2.4 |
| 言語 | TypeScript 5（`strict: true`、パスエイリアス `@/*` → リポジトリのルート） |
| スタイル | Tailwind CSS v4（`@tailwindcss/postcss`、`app/globals.css` で `@import "tailwindcss"`） |
| バックエンド | Supabase（`@supabase/supabase-js`、`@supabase/ssr`） |
| Lint | ESLint 9（`eslint-config-next` の core-web-vitals と typescript） |
| パッケージ管理 | npm（`package-lock.json` を使用） |

- `@supabase/auth-ui-react` と `@supabase/auth-ui-shared` は依存関係に含まれていますが、コード内での使用箇所は確認できませんでした。
- デプロイ先は Vercel と推測されます（`.gitignore` に `.vercel`、README に Vercel のテンプレート記述があるため）。ただし、Vercel の設定ファイルはリポジトリに含まれておらず、実際の設定内容は不明です。
- **Next.js 16 には従来から大きく変わった点があります。** コードを書く前に `node_modules/next/dist/docs/` の該当するガイドを読んでください（AGENTS.md 参照）。たとえば、従来の `middleware.ts` に当たるものはこのプロジェクトではルートの `proxy.ts`（`export async function proxy`）として実装されています。

## ディレクトリ構成

```
app/
  layout.tsx            ルートレイアウト（lang="ja"、metadata）
  page.tsx              トップページ（MainApp を描画するだけ）
  login/page.tsx        ログイン画面（signInWithPassword）
  globals.css           Tailwind の読み込みと CSS 変数
components/
  MainApp.tsx           メイン画面（一覧、フィルタ、並び替え、ログアウト、各モーダルの制御）
  Modal.tsx             レストランの追加・編集モーダル（画像の圧縮とアップロードを含む）
  DeleteModal.tsx       削除の確認モーダル
  RestaurantCard.tsx    レストランのカード表示
  ReviewerSettingsModal.tsx  レビュアー名の設定
  StatsRow.tsx          統計の表示
  AuthGuard.tsx         クライアント側の認証ガード（現在どこからも import されていません）
lib/
  supabase/client.ts    ブラウザ用の Supabase クライアント（createBrowserClient）
  supabase/server.ts    サーバー用の Supabase クライアント（createServerClient + cookies。現在どこからも import されていません）
  supabase.ts           旧形式のクライアント（supabase-js の createClient。AuthGuard.tsx だけが使用）
  restaurants.ts        restaurants テーブルと Storage への CRUD 関数
  useReviewerNames.ts   reviewer_names テーブルを読み書きするフック
  imageUtils.ts         アップロード前の画像圧縮（Canvas でリサイズして WebP に変換）
types/index.ts          Restaurant、FilterState などの型定義
proxy.ts                セッション更新と認証リダイレクト（Next.js 16 の proxy）
next.config.ts          next/image の remotePatterns（Supabase Storage の公開 URL を許可）
docker-compose.yml      node:20 コンテナで npm install と npm run dev を実行
```

- 画面のロジックはほぼすべてクライアントコンポーネント（`'use client'`）にあり、Supabase へはブラウザから直接アクセスしています。Server Actions や Route Handlers は使っていません。
- テストコードとテストフレームワークはありません。

## 開発・ビルド・検証コマンド

```bash
npm install        # 依存関係のインストール
npm run dev        # 開発サーバー（http://localhost:3000）
npm run build      # 本番ビルド（型チェックを含む）
npm run start      # ビルド結果の起動
npm run lint       # ESLint
npx tsc --noEmit   # 型チェックのみ（専用の npm script はありません）
```

- Docker を使う場合は `docker compose up` を実行します（node:20、ポート 3000、`CHOKIDAR_USEPOLLING=true`）。
- 起動には `.env.local` に Supabase の接続情報が必要です（次の「環境変数と秘密情報」参照）。
- 自動テストはありません。動作確認は、ビルド・Lint・型チェックと、ブラウザでの手動確認で行います。

## Supabase との連携の概要

- **クライアントの作り方**: 新しく書くコードでは `@/lib/supabase/client` の `createClient()` を使ってください。既存コード（`lib/restaurants.ts`、`lib/useReviewerNames.ts`、`MainApp.tsx`、`login/page.tsx`）はすべてこの方式です。
- **認証**: Supabase Auth のメールアドレス + パスワード認証（`signInWithPassword` と `signOut`）を使っています。
  - `proxy.ts` が毎リクエストで `supabase.auth.getUser()` を呼び、Cookie のセッションを更新します。
  - 未ログインのユーザーが `/login` と `/auth*` 以外にアクセスすると `/login` にリダイレクトします。ログイン済みのユーザーが `/login` にアクセスすると `/` にリダイレクトします。
  - `/auth` 配下のルートはリダイレクトの除外対象ですが、該当するページは存在しません。
- **テーブル**（コードから確認できた範囲。スキーマ定義やマイグレーションはリポジトリにありません）:
  - `restaurants`: `id`, `created_at`, `visited_at`, `name`, `station`, `genre`, `meal_type`（`'ランチ' | 'ディナー' | '両方' | ''`）, `budget`, `rating_a`〜`rating_d`, `url`, `note`, `image_url`（`types/index.ts` 参照）
  - `reviewer_names`: `id`, `created_at`, `label_a`〜`label_d`。`created_at` の昇順で先頭の 1 行だけを読み書きします。
- **Storage**: バケット `restaurant-images` を使っています。ファイル名は `${Date.now()}-${random}.${ext}` で、`getPublicUrl` で取得した公開 URL を `image_url` に保存します。画像を差し替えるときは古い画像を削除します。
  - `next.config.ts` の `images.remotePatterns` には、Supabase プロジェクトのホスト名と `/storage/v1/object/public/**` が設定されています。
- **不明な事項**: RLS（Row Level Security）ポリシー、バケットの公開設定、テーブルの制約やインデックス、Supabase プロジェクトの環境構成（開発用と本番用が分かれているかどうか）は、リポジトリから確認できません。
- `supabase/` ディレクトリ（Supabase CLI の設定やマイグレーション）はありません。DB スキーマの変更方法は不明です。

## 環境変数と秘密情報

- コードが参照している環境変数は次の 2 つだけです。
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ローカルではこれらを `.env.local` に設定します。`.gitignore` で `.env*` を除外しているため、Git の管理対象にはなりません。
- 注意事項:
  - `.env.local` などの env ファイルの値を、出力、ログ、コミット、外部サービスに含めないでください。値を確認する必要があるときはキー名だけを確認してください。
  - `NEXT_PUBLIC_` で始まる変数はクライアントのバンドルに埋め込まれます。service role key などの秘密鍵を `NEXT_PUBLIC_` の変数に入れたり、クライアントコードで使ったりしないでください。
  - 新しい環境変数が必要になった場合は、追加する前にユーザーに確認してください。Vercel 側の環境変数の設定は不明です。

## 作業時のルール

### 既存コードの構成とスタイルを尊重する

- 既存のディレクトリ構成（`app/`, `components/`, `lib/`, `types/`）と命名規則（コンポーネントは PascalCase の `.tsx`）に従ってください。
- import には `@/` エイリアスを使います。
- スタイルは Tailwind のユーティリティクラスで書きます（既存の配色は stone 系と orange 系）。
- コメントや UI の文言は日本語で書かれています。既存の書き方に合わせてください。
- Supabase へのアクセスは `lib/` の関数やフックにまとめるという既存のパターンに従ってください。
- 依頼されていないリファクタリング、フォーマット変更、依存関係の追加は行わないでください。

### 変更前に確認し、変更後に検証する

- 変更する前に、関連するコンポーネント、`lib/` の関数、`types/index.ts`、`proxy.ts` を読み、影響範囲を確認してください。
- Next.js の API を使うときは、`node_modules/next/dist/docs/` で現在のバージョンの仕様を確認してください。
- 変更した後は、実行できる範囲で次の検証を行い、結果を報告してください。
  - `npm run lint`
  - `npx tsc --noEmit` または `npm run build`
  - 必要に応じて `npm run dev` を起動し、ブラウザで動作を確認する
- 検証できなかった項目があれば、そのことを明記してください。

### 本番環境を許可なく変更しない

- **Supabase の本番データ（テーブルの行、Storage のファイル）、スキーマ、RLS、Auth のユーザーや設定を、ユーザーの明示的な許可なく変更しないでください。**
  - `.env.local` の接続先が本番環境かどうかは不明です。そのため、ローカルの開発サーバーから行う追加・編集・削除の操作も、実データに影響する可能性があるものとして扱ってください。
- **Vercel の本番設定（環境変数、ドメイン、デプロイ、プロジェクト設定）を、ユーザーの明示的な許可なく変更しないでください。** `vercel` CLI によるデプロイや設定変更も同様です。
- `next.config.ts` の Supabase ホスト名は、本番の画像表示に直接影響します。変更する場合は事前にユーザーに確認してください。
