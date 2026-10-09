# CardputerZero アプリ提出ガイド

CardputerZero Store へのアプリ提出と管理には、次の 2 つの方法があります：

- コマンドラインツール czdev（https://github.com/CardputerZero/AppBuilder）
- 開発者センターのウェブサイト（https://dev.cardputer.cc/）

## 準備

### czdev

任意の場所に、GitHub から AppBuilder リポジトリをクローンします：`git clone https://github.com/CardputerZero/AppBuilder.git`

![clone GitHub repo](assets/docs/Submit01_czdev_clone.png)

次に、AppBuilder リポジトリのルートディレクトリで `./czdev login` を実行します。表示された 8 桁の英数字の認証コードを、自動的に開く GitHub の認証ページに入力すると、ログインが完了します。

![czdev login](assets/docs/Submit02_czdev_login.png)
![czdev login](assets/docs/Submit03_czdev_login.png)

### ウェブサイト

ブラウザーで開発者センターのウェブサイト https://dev.cardputer.cc/ を開き、ログインボタンをクリックしてアクセスを許可すると、ログインが完了します。

![web login](assets/docs/Submit04_web_login.png)
![web login](assets/docs/Submit05_web_login.png)

## 新しいアプリのアップロード

https://github.com/CardputerZero/Template をテンプレートとして開発を始めることをおすすめします。AppBuilder リポジトリのルートディレクトリで `./czdev new my-app` を実行すると、Template をもとに新しいアプリを自動作成することもできます。

新しいアプリをアップロードする前に、開発ガイドライン https://cardputer.cc/#/documents/cp0-dev に準拠していることを確認し、実機で十分にテストしてください。新しいアプリの `.deb` インストールパッケージを用意して、アップロードを開始します。

### czdev

新しいアプリのプロジェクトのルートディレクトリ（`app-builder.json` があるディレクトリ。必ずしも AppBuilder リポジトリではありません）で、`./czdev publish --deb the_new_app.deb` を実行します。ツールがアプリのインストールパッケージと関連ファイルが規定に準拠しているかを確認し、チェックに通ると、https://github.com/CardputerZero/packages/pulls に新しいプルリクエストを作成します。

![czdev publish](assets/docs/Submit06_czdev_publish.png)

### ウェブサイト

ブラウザーで https://dev.cardputer.cc/ を開き、アップロードボタンをクリックして `.deb` インストールパッケージをアップロードします。パッケージの解析が完了したら、各項目を入力してください。アップロードボタンをクリックすると、ツールがアプリのインストールパッケージと入力情報が規定に準拠しているかを確認し、チェックに通ると、https://github.com/CardputerZero/packages/pulls に新しいプルリクエストを作成します。

![web publish](assets/docs/Submit07_web_publish.png)

その PR のコメント欄に、実機でのデモ動画をアップロードしてください。動画は Store メンテナーによる審査用で、アプリの起動、主な機能のデモ、アプリの終了を含める必要があります。実機でのデモ動画がないアプリは、審査に通りません。

![PR video](assets/docs/Submit08_pr_video.png)

Store メンテナーが PR を審査し、承認すると、アプリが Store に表示され、ユーザーがダウンロードしてインストールできるようになります。

## アプリの更新

更新予定。

## アプリの公開停止

更新予定。
