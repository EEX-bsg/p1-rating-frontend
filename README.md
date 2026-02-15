# まつしげレーティング - フロントエンド

野良P1レースの順位情報を入力し、OpenSkillアルゴリズムでプレイヤーのレーティングを計算・管理するシステムのWEBアプリケーションです。

## 主な機能

- プレイヤーIDによるレーティング表示
- 試合結果の入力とレーティング計算

## 技術スタック

- **Nuxt.js 3** - Vue.jsフレームワーク
- **OpenSkill** - レーティング計算ライブラリ
- **Yarn** - パッケージマネージャー

## 開発環境のセットアップ

### 必要な環境

- Node.js 20.x 以上
- Yarn 1.22.x 以上

### インストール手順

1. 依存関係をインストール

```bash
yarn install
```

2. 開発サーバーを起動

```bash
yarn dev
```

ブラウザで `http://localhost:3000/matsushige-rating/` にアクセスしてください。

### ビルドとデプロイ

#### 静的サイト生成（GitHub Pages用）

```bash
yarn generate
```

生成されたファイルは `.output/public` ディレクトリに出力されます。

#### GitHub Pagesへの自動デプロイ

このリポジトリは GitHub Actions による自動デプロイに対応しています。

1. GitHubリポジトリの Settings > Pages で Source を "GitHub Actions" に設定
2. `main` ブランチにpushすると自動的にデプロイされます

## プロジェクト構成

```
frontend/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions設定
├── assets/                     # 静的アセット
├── components/                 # Vueコンポーネント
├── composables/
│   ├── useApi.ts              # API通信ロジック
│   └── useRating.ts           # レーティング計算ロジック
├── pages/
│   ├── index.vue              # ID入力ページ
│   ├── main.vue               # レート表示ページ
│   └── submit.vue             # 試合結果入力ページ
├── plugins/
│   └── vuetify.ts             # Vuetify設定
├── stores/
│   └── app.ts                 # Pinia状態管理
├── app.vue                    # ルートレイアウト
├── nuxt.config.ts             # Nuxt設定
└── package.json               # 依存関係定義
```

## 注意事項

- このアプリケーションはクライアントサイドのみで動作します（SSRは無効）
- ローカルストレージを使用してプレイヤーIDやキャッシュを保存します

