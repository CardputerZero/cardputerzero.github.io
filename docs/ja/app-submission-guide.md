# CardputerZero アプリ提出ガイド

このガイドは、CardputerZero 実機 AppStore へアプリを公開する現在の手順を説明します。

## 概要

推奨される公開経路は [CardputerZero-AppBuilder](https://github.com/m5stack/CardputerZero-AppBuilder) の `czdev` CLI です。開発者はインストール可能な `.deb` を公開します。`czdev` はパッケージを検証し、`.deb`、`meta.json`、アイコン、スクリーンショットを Git LFS 経由で `CardputerZero/packages` へ push し、メンテナー審査用の Pull Request を作成します。マージ後、packages リポジトリが APT index を更新し、この Hub が package metadata から `generated/registry.json` を同期します。

基本フロー：

1. 自分の GitHub リポジトリでアプリを開発する。
2. APPLaunch 互換ファイルを含む ARM64 Debian `.deb` を作る。
3. package、metadata、store assets をローカルで検証する。
4. 初回公開前に `czdev login` を実行する。
5. `czdev publish --deb <package>` を実行する。
6. `CardputerZero/packages` に作成された Pull Request を確認する。
7. メンテナー審査、APT index 再生成、Hub registry 同期を待つ。

実機 AppStore でインストールできるのは、registry の `review.status` が `approved` のアプリだけです。

## `czdev` のインストールと確認

ビルドや公開の前に依存関係を入れます。

macOS：

```bash
brew install cmake pkg-config sdl2 sdl2_image sdl2_mixer freetype git-lfs dpkg
```

Debian / Ubuntu：

```bash
sudo apt install -y build-essential cmake pkg-config \
  libsdl2-dev libsdl2-image-dev libsdl2-mixer-dev libfreetype-dev \
  git-lfs dpkg
```

ソースから `czdev` をビルドします。

```bash
git clone --recursive git@github.com:m5stack/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder
cargo build --release -p czdev
./target/release/czdev doctor
```

`--recursive` なしで clone した場合：

```bash
git submodule update --init --recursive
```

AppBuilder の GitHub Releases から現在の OS / アーキテクチャ向けのビルド済み `czdev` を取得し、`PATH` に置く方法もあります。インストール後に実行します。

```bash
czdev doctor
```

`czdev doctor` の出力が、ローカル開発依存関係の不足を判断する基準です。

よく使う開発コマンド：

```bash
czdev list .
czdev run examples/hello_cz
czdev watch examples/hello_cz
czdev deploy --host pi@<device-ip> --deb build/my_app_1.0.0_arm64.deb
```

## Package 要件

`.deb` は APPLaunch アプリを `/usr/share/APPLaunch` にインストールする必要があります。

パッケージには少なくとも次が必要です。

- `usr/share/APPLaunch/applications/<app>.desktop`
- `usr/share/APPLaunch/bin/` の実行ファイルまたは wrapper。
- `usr/share/APPLaunch/share/images/` の正方形 PNG アイコン。
- 必要なフォントや素材は `usr/share/APPLaunch/share/` に配置。

`.desktop` には最低限次を含めます。

```ini
[Desktop Entry]
Name=MyApp
Exec=bin/myapp
Terminal=false
Icon=share/images/myapp.png
Type=Application
```

GUI アプリは `Terminal=false` を使います。引数、作業ディレクトリ変更、framebuffer 環境変数設定が必要な場合は、`Exec` に複雑なコマンドを書かず wrapper script を使います。

## Store Metadata と素材

アプリのソースリポジトリには、`store` セクションを持つ `app-builder.json` を含めます。

```json
{
  "package_name": "my-app",
  "app_name": "My App",
  "store": {
    "summary": "Short user-facing summary.",
    "categories": ["Utilities"],
    "icon": "share/images/my-app.png",
    "screenshots": [
      "store/screenshots/main.png",
      "store/screenshots/detail.png",
      "store/screenshots/settings.png",
      "store/screenshots/confirm.png"
    ],
    "locales": {
      "zh-CN": {
        "title": "我的应用",
        "summary": "简短中文简介。",
        "description": "面向中文用户的说明。"
      },
      "en": {
        "title": "My App",
        "summary": "Short English summary.",
        "description": "English description for users."
      },
      "ja": {
        "title": "マイアプリ",
        "summary": "短い日本語の説明。",
        "description": "日本語ユーザー向けの説明。"
      }
    }
  }
}
```

AppStore へ提出するスクリーンショットは、アプリ framebuffer だけを写した 320 x 170 の画像を 4 枚にしてください。エミュレーターのウィンドウ枠、デバイス外枠、デスクトップ背景、黒い余白、スケーリング余白は含めません。

`CardputerZero/packages` にコピーされる package metadata では、画像パスは `pool/main/<package>/` からの相対パスにします。

```json
{
  "icon": "my-app.png",
  "screenshots": [
    "screenshots/main.png",
    "screenshots/detail.png",
    "screenshots/settings.png",
    "screenshots/confirm.png"
  ],
  "published_at": "2026-05-14T23:20:55+08:00",
  "updated_at": "2026-05-14T23:20:55+08:00"
}
```

`published_at` と `updated_at` は秒と明示的な timezone を含む ISO 8601 形式にします。初回公開後は `published_at` を安定させ、パッケージ、スクリーンショット、アイコン、説明、権限、審査状態が変わったときに `updated_at` を更新します。

## 必須の Prepublish Check

公開前に、`cardputer-app-publish` skill の checkout から strict check を実行します。

```bash
python3 /path/to/cardputer-app-publish/scripts/prepublish_check.py \
  --deb build/my_app_1.0.1_arm64.deb \
  --app-dir .
```

すべての `ERROR` はブロッカーです。この check は次を確認します。

- `app-builder.json` が存在し、`store` セクションを持つ。
- `store.summary`、`store.categories`、`store.icon`、スクリーンショットがある。
- ソースのアイコンとスクリーンショットが存在し、アイコンが正方形 PNG。
- `.deb` control に `Package`、`Version`、`Architecture=arm64`、`Maintainer` がある。
- `.deb` 内に `Name`、`Exec`、`Icon` を持つ APPLaunch `.desktop` がある。
- `.desktop` の `Icon` がパッケージ内の正方形 PNG に解決できる。
- `.desktop` の `Exec` が絶対パスまたは APPLaunch 相対パスの場合、対応する実行ファイルがパッケージ内に存在する。

非対話の公開引き継ぎでソースアイコンが欠けている場合は、先にアイコンを生成し、`.deb` を再ビルドし、再度 check します。APPLaunch アイコンのない `.deb` を公開しないでください。

## `czdev` で公開する

初回ログイン：

```bash
czdev login
```

GitHub OAuth Device Flow を使い、token は `~/.config/czdev/token` に保存されます。

既存パッケージを更新する場合は次のバージョンを確認します。

```bash
czdev bump --deb build/my_app_1.0.0_arm64.deb
```

公開：

```bash
czdev publish --deb build/my_app_1.0.1_arm64.deb
```

`czdev publish` は preflight、公開済みバージョンより新しいかの確認、`.deb`、`meta.json`、アイコン、スクリーンショットの Git LFS push、`CardputerZero/packages` への Pull Request 作成を行います。

自分が公開した特定バージョンを削除する場合：

```bash
czdev unpublish my-app --version 1.0.1
```

## 実機検証

package Pull Request を作成またはマージする前に、実機 CardputerZero で確認します。

- package が `dpkg -i` または APT でインストールできる。
- APPLaunch に想定したアイコンとタイトルが表示される。
- APPLaunch から起動し、正常に戻れる。
- GUI が 320 x 170 画面に収まる。
- CJK 文字が CJK 対応フォントで表示され、欠けたグリフがない。
- 短い Esc は戻るまたは modal を閉じる。長い Esc または Home は安全に終了する。
- framebuffer コードが `LV_LINUX_FBDEV_DEVICE` を尊重し、`/dev/fb0` を固定しない。
- 権限、ネットワーク、外部機器、バックグラウンドサービスが metadata と一致する。
- アンインストール後に APPLaunch entry が消える。

## Pull Request 審査

PR には次を書いてください。

- アプリの用途。
- テストしたデバイスと OS image。
- 提出した `.deb` からインストールして確認したか。
- 権限、ネットワーク、外部機器、バックグラウンドサービス。
- プライバシー動作とデータ保持。
- 既知の制限。
- ソース、release、package、スクリーンショット、可能ならテストログへのリンク。

CI 通過は自動掲載を意味しません。メンテナーは policy、リスク、デバイス安全、ユーザー体験、metadata 品質を確認します。承認されてマージされると、packages リポジトリが APT index を再生成します。その後、この Web サイトが package `meta.json` を `generated/registry.json` に同期し、実機 AppStore では更新後に表示されます。

## トラブルシューティング

| 問題 | 対応 |
| --- | --- |
| `czdev` が見つからない | AppBuilder からビルドするか、release binary を取得して `PATH` に置きます。 |
| `czdev doctor` が依存不足を報告する | 出力された OS 用パッケージをインストールし、再度 `czdev doctor` を実行します。 |
| `git-lfs not installed` | Git LFS をインストールし、`git lfs install` を実行します。 |
| `dpkg-deb` がない | macOS: `brew install dpkg`、Debian/Ubuntu: `sudo apt install dpkg`。 |
| `email_mismatch` | `.deb` の `Maintainer` email を GitHub account email または noreply address に合わせます。 |
| `version_not_newer` | package version を上げ、`.deb` を再ビルドし、prepublish check を再実行します。 |
| `store.icon is required` | 正方形 PNG アイコンを追加または生成し、`.deb` を再ビルドし、strict check を再実行します。 |
| Web には表示されるが実機でインストールできない | registry の `review.status` が `approved` か、package URL、package 名、MD5 が正しいか確認します。 |

関連する規則は [開発者提出ポリシー](#/documents/developer-submission-policy)、[Registry と Web UI 要件](#/documents/appstore-registry-requirements)、[ユーザー・開発者規約](#/documents/user-agreement) を参照してください。
