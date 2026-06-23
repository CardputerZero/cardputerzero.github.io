# AppStore Registry と Web UI 要件

この文書は CardputerZero Hub の静的 registry と Web サイトの初期要件を定義します。

## 目的

Hub は GitHub Pages で公開できるアプリカタログです。生成された registry を読み込み、CardputerZero アプリの検索、絞り込み、詳細表示を提供し、実機 AppStore のオンライン registry ソースになります。

想定フロー：

1. 開発者が APPLaunch 互換の ARM64 `.deb` package を作成する。
2. strict prepublish check を実行し、`czdev publish` で公開する。
3. `czdev` が `.deb`、`meta.json`、icon、screenshots を含む Pull Request を `CardputerZero/packages` に作成する。
4. GitHub Actions が package metadata、assets、checksum、APT index 出力を検証する。
5. メンテナーがリスク、プライバシー、デバイス安全、体験を審査する。
6. マージ後、packages repository が APT index を再生成する。
7. この Hub が package metadata を `generated/registry.json` に同期し、GitHub Pages で公開する。
8. 実機 AppStore が registry を更新し、承認済み `.deb` をインストールする。

## 静的ホスティング

サイトは完全に静的である必要があります。

- バックエンドサービス不要。
- GitHub Pages を標準公開先とする。
- registry は自動生成される。
- ブラウザ側 JavaScript が検索、フィルタ、ページング、詳細、コメント、文書表示を処理する。

現在は `#/apps/<uuid>`、`#/documents`、`#/tutorial` のような hash route を使います。

## Registry ファイル

生成ファイルの役割：

- `registry.json`: Web UI と実機 AppStore の正規 registry。
- `registry-index.json`: 旧 AppStore クライアント向けの互換 alias。

実機 AppStore はネットワーク失敗に耐え、registry を読めない場合は明確なエラーを表示するべきです。

## App Metadata

各アプリにはソース側の `app-builder.json` store metadata と package 側の `pool/main/<package>/meta.json` が必要です。

必要なアプリ情報：

- 安定した UUID と一意の共有コード。
- タイトル、概要、説明、`locales` / `i18n` の多言語文言、カテゴリ、GitHub 作者 ID、任意の `author.website` URL。
- バージョン、license、ソース公開度、ソースリポジトリ。
- Debian package 名、`.deb` URL、MD5 checksum、package 相対の icon と screenshot パス。
- 権限、プライバシー、外部機器、バックグラウンドサービス、HDMI、商用利用、リスク。
- 必要に応じて APPLaunch metadata。

ダウンロードは Debian `.deb` である必要があります。実機はローカルへダウンロードし、MD5 を確認し、`review.status` が `approved` の entry だけをインストールします。

## APPLaunch 互換性

registry に載るアプリは APPLaunch からインストール・起動できる必要があります。

レビューでは以下を確認します。

- `.desktop` に必須フィールドがある。
- `Exec` がインストール済み実行ファイルを指す。
- アイコンパスが有効。
- GUI が 320 x 170 に収まる。
- アプリ終了後にランチャーへ戻る。
- framebuffer は `LV_LINUX_FBDEV_DEVICE` を尊重する。

## 国際化

Web UI は以下をサポートします。

- 簡体字中国語：`zh-CN`
- 英語：`en`
- 日本語：`ja`

ナビゲーション、ボタン、フィルタ、状態、空状態、チュートリアル、registry ラベル、文書カードは i18n 辞書を使います。Markdown 文書は言語別ファイルを持ち、必要に応じて `zh-CN` に fallback できます。

推奨されるアプリおよび管理画面の動作：簡体字中国語、日本語、英語の i18n をサポートします。既定ではシステム言語に自動追従します。プロジェクトにカレンダー管理バックエンドがある場合、ユーザーはそこで言語を切り替えることができ、その手動設定はシステム言語より優先されます。

## レスポンシブデザイン

サイトはスマートフォン、タブレット、デスクトップで使える必要があります。

最低チェック：

- 320px 幅でページ全体の横スクロールが発生しない。
- 検索、フィルタ、詳細、コメント、文書ページが使える。
- 長い URL、UUID、checksum、package 名が正しく折り返される。
- 小画面では文書目次が記事の上に積まれる。

## CI チェック

Pull Request 自動処理は以下を検証します。

- package `meta.json` と生成 registry の JSON 解析。
- UUID と共有コードの一意性。
- 必須 metadata。
- package 相対の asset パスと画像ファイル。
- APT package 名、`.deb` URL、MD5、SHA256。
- ソースリポジトリ URL。
- 権限、プライバシー、リスク宣言。
- `registry.json` と旧互換の `registry-index.json` alias の生成。

CI は最初のゲートであり、完全な安全監査ではありません。
