# まつしげレーティング - フロントエンド

レースゲームの順位情報を入力し、OpenSkillアルゴリズムでプレイヤーのレーティングを計算・管理するシステムのフロントエンドアプリケーションです。

## 主な機能

- プレイヤーIDによるレーティング表示
- 試合結果の入力とレーティング計算
- ダーク/ライトテーマの切り替え
- オフラインキャッシュによる高速動作

## 技術スタック

- **Nuxt.js 3** - Vue.jsフレームワーク
- **Vuetify 3** - UIコンポーネントライブラリ
- **Pinia** - 状態管理
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

2. キャッシュをクリア（初回またはエラー時）

```bash
rm -rf .nuxt .output node_modules
yarn install
```

3. 開発サーバーを起動

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

### 設定

#### APIエンドポイントの設定

`composables/useApi.ts` の `BASE_URL` を実際のGoogle Apps ScriptデプロイメントIDに変更してください：

```typescript
const BASE_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
```

#### GitHub Pagesのベースパス設定

`nuxt.config.ts` の `app.baseURL` をリポジトリ名に合わせて変更してください：

```typescript
app: {
  baseURL: '/your-repository-name/',
}
```

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
- API呼び出しにはクールダウン（5秒）が設定されています

## トラブルシューティング

### `#app-manifest` エラーが発生する場合

Nuxtのキャッシュが原因です。以下を実行してください：

```bash
# Windows (Git Bash)
rm -rf .nuxt .output node_modules
yarn install

# または PowerShell
Remove-Item -Recurse -Force .nuxt, .output, node_modules
yarn install
```

### 画面が真っ黒で何も表示されない場合

1. ブラウザの開発者ツール（F12）を開いてコンソールエラーを確認
2. 上記のキャッシュクリアを実行
3. `yarn dev` を再実行

### CORS エラーが発生する場合

Google Apps ScriptのWebアプリ公開設定を確認してください：
- アクセス権限: 「全員」に設定
- 実行ユーザー: 「自分」または適切なユーザーに設定

### ビルドエラーが発生する場合

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
yarn install

# キャッシュをクリア
rm -rf .nuxt .output
```

### Windowsでの注意事項

Git Bash環境で開発することを推奨します。PowerShellを使用する場合は、以下のように読み替えてください：

```powershell
# ディレクトリ削除
Remove-Item -Recurse -Force .nuxt, .output, node_modules

# 開発サーバー起動
yarn dev
```

