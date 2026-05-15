# Skill と AI Coding ガイド

この文書は `cardputer-zero-application` skill を CardputerZero アプリ開発の手順書として使う方法を説明します。AI にコードを書かせる前に、APPLaunch、LVGL、Debian パッケージ、framebuffer、実機検証の制約を揃えることが目的です。

## 使う場面

- CardputerZero アプリを新規作成または移植する。
- APPLaunch の起動、アイコン、`.desktop`、終了、キーボード問題を修正する。
- AArch64 Debian `.deb` を作成する。
- AppStore metadata、store assets、`czdev publish` 用の資料を準備する。
- 実機で `/usr/share/APPLaunch`、`LV_LINUX_FBDEV_DEVICE`、インストール、起動、アンインストールを検証する。

## 推奨プロンプト

開発開始時に制約を明示します。

```text
cardputer-zero-application skill を使用してください。
目的：CardputerZero APPLaunch アプリを開発する。
要件：320x170 GUI、Terminal=false、APPLaunch から起動と終了、arm64 .deb で配布。
コード変更前に制約、ディレクトリ、検証項目、リスクを列挙してください。
```

これにより、AI が一般的なデスクトップ Linux 前提で実装することを避けられます。

## AI 開発フロー

1. プロジェクト構造を読む。
2. アプリ種別を決める：LVGL GUI、SDL GUI、CLI、バックグラウンドサービス。
3. APPLaunch 入口を確認する：`.desktop` の `Name`、`Exec`、`Icon`、`Terminal`。
4. インストール先を確認する：`/usr/share/APPLaunch/applications`、`bin`、`share/images`、`share/font`。
5. framebuffer 方針を確認する：`LV_LINUX_FBDEV_DEVICE` を尊重し、`/dev/fb0` を固定しない。
6. 実装または修正を行う。
7. ローカルでビルドし `.deb` を生成する。
8. 実機へコピーしてインストールする。
9. 起動、終了、再起動、ログ確認を行う。
10. prepublish check を実行し、metadata、MD5、スクリーンショット、`czdev publish` 用の説明を準備する。

## デバイス制約

CardputerZero GUI は 320 x 170 の小さい画面を対象にします。デスクトップ向けの大きな余白や長いラベルは避け、主要操作はキーボードで扱える必要があります。

APPLaunch アプリでは通常次が必要です。

- GUI アプリは `Terminal=false`。
- `.desktop` には少なくとも `[Desktop Entry]`、`Name`、`Exec`。
- アイコンパスを APPLaunch が読める。
- アプリ終了後にランチャーへ戻れる。
- CJK UI は利用可能な中国語または日本語フォントを使う。

framebuffer アプリはデバイス番号を決め打ちしないでください。小型 LCD は `/dev/fb1` の場合があるため、`LV_LINUX_FBDEV_DEVICE` を読むか、起動環境から注入します。

## AI に先に確認させること

- エントリファイルとビルドコマンド。
- `.desktop` の有無と必須フィールド。
- APPLaunch のインストールパスに合っているか。
- `/dev/fb0` を固定していないか。
- CJK フォントを扱っているか。
- Esc、Home、終了、強制終了の挙動。
- Debian パッケージ内のファイル一覧。
- registry に宣言すべき権限とリスク。

## よく使う依頼

### 新規アプリ

```text
cardputer-zero-application skill を使い、CardputerZero LVGL アプリを作ってください。
まず APPLaunch ディレクトリ、.desktop、framebuffer、キーボード、パッケージ計画を出してください。
次に最小実行版と .deb パッケージスクリプトを実装してください。
```

### 起動問題の修正

```text
cardputer-zero-application skill を使い、このアプリが APPLaunch から起動しない理由を調べてください。
.desktop、Exec パス、権限、共有ライブラリ、framebuffer、ログ、ランチャー復帰を重点的に確認してください。
```

### AppStore 提出

```text
cardputer-zero-application と cardputer-app-publish skill を使い、このアプリの AppStore 公開準備をしてください。
app-builder.json の store セクション、アイコン、4 枚の 320x170 スクリーンショット、.deb control、APPLaunch .desktop、package 名、MD5、実機検証を確認してください。
strict prepublish check が通ったら、czdev login / bump / publish コマンドを提示してください。
```

## 実機検収チェックリスト

- `.deb` インストール後に APPLaunch へアイコンが出る。
- アイコン、アプリ名、`.desktop` 入口が正しい。
- APPLaunch から起動できる。
- UI が 320 x 170 からはみ出さない。
- キーボード操作が使える。
- 終了後に APPLaunch へ戻る。
- 再起動後に異常プロセスが残らない。
- アンインストール後に APPLaunch 入口が消える。
- ログに framebuffer、権限、共有ライブラリエラーがない。

## 提出前の出力

実装後、AI に次をまとめさせます。

- 変更ファイル。
- `.deb` のビルド方法。
- MD5 の計算方法。
- prepublish check が通ったか。
- 実行すべき `czdev publish --deb <file.deb>` コマンド。
- 実機で確認した項目。
- 人が確認すべき metadata フィールド。

このまとめは Pull Request の説明に流用できます。
