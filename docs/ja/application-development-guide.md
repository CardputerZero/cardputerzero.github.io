# CardputerZero アプリ開発入門

この文書は通常のアプリ開発者向けです。AI Coding は便利ですが、最初に読む内容ではありません。まず実行環境、リポジトリの役割、APPLaunch 契約、最小 HelloWorld を理解すると、後で生成されたコードが正しいか判断しやすくなります。

## 使用言語

推奨：

- **C/C++ + LVGL 9.5**：320 x 170 GUI、キーボード入力、framebuffer 出力の標準選択。
- **C/C++ + SDL**：デスクトップデバッグ向け。最終版は Linux framebuffer に切り替えます。
- **Shell wrapper**：環境変数、作業ディレクトリ、引数、`LV_LINUX_FBDEV_DEVICE` 注入に使います。
- **Python / Node / その他**：ツール、バックグラウンドサービス、プロトタイプに使えますが、提出前に依存関係、起動速度、メモリ、フォント、終了動作を確認します。

GUI アプリは通常 `Terminal=false` です。明確に CLI ツールの場合だけ `Terminal=true` を使います。

## 環境構築

2 つの環境を用意します。

- **開発機**：macOS または Linux。編集、Git、アイコン作成、文書、SDL デバッグに使います。
- **CardputerZero 実機**：APPLaunch 登録、framebuffer、キーボード、フォント、インストール、実行、アンインストールの確認に使います。

よく使うツール：

```bash
git
make
cmake
g++
pkg-config
dpkg-deb
aarch64-linux-gnu-g++
```

AppBuilder workflow を使う場合は `czdev` をインストールします。

```bash
git clone --recursive git@github.com:m5stack/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder
cargo build --release -p czdev
./target/release/czdev doctor
```

`czdev run` と `czdev watch` はデスクトップエミュレーターでのデバッグに使えます。`czdev deploy --host pi@<device-ip> --deb <file.deb>` はビルド済み `.deb` を実機へ入れるために使います。AppStore に公開する前に `czdev login` と `czdev publish --deb <file.deb>` を使います。

実機で VibAPP または軽量 LVGL アプリを作る場合は、APPLaunch 内蔵テンプレートを優先します。

```text
/usr/share/APPLaunch/share/vibapp/templates/lvgl-basic-app
```

開発機でクロスコンパイルする場合、成果物が Linux AArch64 であり、macOS や x86_64 SDL デバッグバイナリではないことを確認します。

## Git リポジトリの役割

よく使うリポジトリ：

- `CardputerZero/Launcher`：ランチャーと APPLaunch の中心ロジック。
- `M5CardputerZero-APPLaunch`：APPLaunch 統合、サンプル、シミュレーターやデバッグ入口。
- `CardputerZero/AppStore`：実機 AppStore。registry 取得、詳細、インストール、実行、アンインストール。
- `CardputerZero/packages`：`.deb` パッケージと metadata。
- `CardputerZero/cardputerzero.github.io`：公式サイト、静的 registry、文書センター、GitHub Pages。
- `CardputerZero/skill`：Codex / AI 向けのプロジェクト知識と制約。
- 個別アプリリポジトリ：各アプリのソース、README、license、release、ビルドスクリプト。

通常、アプリは個別リポジトリで開発し、`.deb` にパッケージし、packages または registry を通じて AppStore に入ります。

## 開発パターン

推奨順序：

1. アプリ名、slug、アイコン、起動方式を決める。
2. 先に `.desktop` を作り、`Name`、`Exec`、`Icon`、`Terminal=false` を確認する。
3. デスクトップ UI を縮小せず、最初から 320 x 170 で設計する。
4. 1 画面、戻る操作、終了経路を作る。
5. キーボードを扱う：短い Esc は戻るまたはモーダルを閉じる、長い Esc または Home は終了。
6. フォントを扱う：中国語、日本語、英語混在には CJK 対応フォントを使う。
7. framebuffer を扱う：`LV_LINUX_FBDEV_DEVICE` を尊重し、`/dev/fb0` を固定しない。
8. `/usr/share/APPLaunch` の構造でパッケージする。
9. 実機でアイコン、起動、終了、アンインストールを検証する。
10. AppStore metadata、MD5、4 枚の 320 x 170 スクリーンショットを準備し、`czdev publish` で package Pull Request を提出する。

## 最小 APPLaunch 構成

最小パッケージは通常次の形です。

```text
applaunch/
  applications/
    helloworld.desktop
  bin/
    helloworld
  share/
    images/
      helloworld.png
    font/
```

最小 `.desktop`：

```ini
[Desktop Entry]
Name=HelloWorld
Exec=bin/helloworld
Terminal=false
Icon=share/images/helloworld.png
Type=Application
```

`Exec=bin/helloworld` は `/usr/share/APPLaunch` を基準に解決されます。引数や環境設定が必要な場合、複雑な shell コマンドを `Exec` に直接書かず、wrapper を使います。

```sh
#!/bin/sh
export LV_LINUX_FBDEV_DEVICE="${LV_LINUX_FBDEV_DEVICE:-/dev/fb1}"
exec /usr/share/APPLaunch/bin/helloworld.bin
```

## HelloWorld 手順

1. `projects/HelloWorld` などのアプリディレクトリを作る。
2. `assets/helloworld.png` などの 1:1 PNG アイコンを用意する。
3. タイトルとステータス行だけの 320 x 170 LVGL 画面を作る。
4. 最低限の終了経路を持つキーボード入力を追加する。
5. `applaunch/applications/helloworld.desktop` を生成する。
6. SDL でローカルレイアウトを確認する。
7. 実機向け framebuffer 版をビルドする。
8. `/usr/share/APPLaunch` にインストールする。
9. APPLaunch を再起動または更新し、アイコン表示を確認する。
10. APPLaunch から起動、終了、再起動する。

## HelloWorld 検収チェックリスト

- APPLaunch にアイコンが表示される。
- タイトルと本文が 320 x 170 に収まる。
- CJK テキストに欠けたグリフがない。
- `Exec` が実在する実行ファイルを指す。
- GUI が `Terminal=false` を使う。
- 終了後 APPLaunch に戻る。
- 誤った framebuffer デバイスに依存しない。
- `.deb` のインストールとアンインストール後、APPLaunch 状態が正しい。

## 次に読む文書

HelloWorld の後に読む文書：

- [アプリ提出ガイド](#/documents/app-submission-guide)：`czdev`、metadata、assets、MD5、prepublish check、package Pull Request。
- [Registry と Web UI 要件](#/documents/appstore-registry-requirements)：registry フィールドと表示ルール。
- [Skill と AI Coding ガイド](#/documents/skill-ai-coding-guide)：上記の開発パターンを AI に補助させる方法。
