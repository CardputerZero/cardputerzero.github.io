# CardputerZero アプリ提出ガイド

このガイドは CardputerZero Hub と実機 AppStore registry へアプリを提出する手順を説明します。

## 概要

提出はバイナリを直接アップロードするのではなく、GitHub Pull Request でアプリのメタデータを提出します。メンテナー承認後、GitHub Actions が静的 registry を生成し、GitHub Pages が公開します。

基本フロー：

1. 自分の GitHub リポジトリでアプリを開発し公開する。
2. Debian `.deb` としてパッケージする。
3. CardputerZero 実機でインストールと検証を行う。
4. `CardputerZero/cardputerzero.github.io` を fork する。
5. アプリ metadata と表示素材を追加する。
6. Pull Request を作成し、CI とメンテナー審査を待つ。

## 提出前の準備

アプリリポジトリには以下を含めてください。

- ソースコード、または binary-only である明確な説明。
- 用途、ビルド手順、実行前提、既知制限を書いた README。
- License。
- 安定した release またはダウンロード先。
- `arm64` Debian `.deb`。
- アイコン。スクリーンショットも推奨。
- 実機検証メモ。

AppStore は今後 Debian `.deb` のみをインストールします。registry にはダウンロード URL、Debian package 名、MD5 が必要です。

## APPLaunch 要件

CardputerZero アプリは APPLaunch から起動できる必要があります。

- `.desktop` には少なくとも `[Desktop Entry]`、`Name`、`Exec`。
- GUI アプリは基本 `Terminal=false`。
- アイコンパスを読めること。
- インストール先は `/usr/share/APPLaunch` の規約に従うこと。
- 明確な終了方法を持つこと。
- GUI は 320 x 170 画面に適合すること。

framebuffer アプリは `LV_LINUX_FBDEV_DEVICE` を尊重し、`/dev/fb0` を固定しないでください。CardputerZero の小型画面は `/dev/fb1` の場合があります。

## 実機検証

提出前に最低限確認します。

- APPLaunch にアイコンと名前が表示される。
- APPLaunch から起動できる。
- UI が画面からはみ出さない。
- キーボード、Esc、Home、強制終了経路が使える。
- 終了後にランチャーへ戻る。
- アンインストール後に入口が消える。
- ログに明らかな権限、framebuffer、共有ライブラリエラーがない。

## リポジトリ手順

1. `CardputerZero/cardputerzero.github.io` を fork する。
2. `main` からブランチを作る。
3. アプリ metadata を追加または修正する。
4. 対応する asset ディレクトリへアイコンとスクリーンショットを追加する。
5. 利用できる検証スクリプトをローカルで実行する。
6. ブランチを push する。
7. 上流リポジトリへ Pull Request を作成する。

## 必須 Metadata

各アプリには少なくとも次が必要です。

- 安定した UUID。
- 一意の共有コード。
- タイトルと概要。
- GitHub 作者 ID。
- バージョン、license、カテゴリ。
- ソース公開度とリポジトリ URL。
- Debian package 名。
- `.deb` ダウンロード URL。
- MD5 checksum。
- 権限、プライバシー、外部機器、バックグラウンドサービス、HDMI、商用利用制限。
- 既知リスクと審査状態。

## Pull Request の内容

PR には以下を書いてください。

- アプリの用途。
- ダウンロード元。
- 実機テスト結果。
- ネットワーク、ファイル、マイク、外部機器、バックグラウンドサービスの有無。
- 既知リスクまたは実験的制限。

CI 通過は自動掲載を意味しません。メンテナーは体験、デバイス安全、プライバシー、コンプライアンスを確認します。
