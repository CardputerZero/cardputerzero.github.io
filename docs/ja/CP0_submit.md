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

新しいアプリのプロジェクトのルートディレクトリ（`app-builder.json` があるディレクトリ。必ずしも AppBuilder リポジトリではありません）で、`the_path_of_AppBuilder/czdev publish --deb the_new_app.deb` を実行します。ツールがアプリのインストールパッケージと関連ファイルが規定に準拠しているかを確認し、チェックに通ると、https://github.com/CardputerZero/packages/pulls に新しいプルリクエストを作成します。

![czdev publish](assets/docs/Submit06_czdev_publish.png)

### ウェブサイト

ブラウザーで https://dev.cardputer.cc/ を開き、アップロードボタンをクリックして `.deb` インストールパッケージをアップロードします。パッケージの解析が完了したら、各項目を入力してください。アップロードボタンをクリックすると、ウェブサイトがアプリのインストールパッケージと入力情報が規定に準拠しているかを確認し、チェックに通ると、https://github.com/CardputerZero/packages/pulls に新しいプルリクエストを作成します。

![web publish](assets/docs/Submit07_web_publish.png)

その PR のコメント欄に、実機でのデモ動画をアップロードしてください。動画は Store メンテナーによる審査用で、アプリの起動、主な機能のデモ、アプリの終了を含める必要があります。実機でのデモ動画がないアプリは、審査に通りません。

![PR video](assets/docs/Submit08_pr_video.png)

Store メンテナーが PR を審査し、承認すると、アプリが Store に表示され、ユーザーがダウンロードしてインストールできるようになります。

## アプリの更新

### czdev

新しいアプリのアップロードと同様に、同じディレクトリで `the_path_of_AppBuilder/czdev publish --deb the_new_version.deb` を実行します。ツールが新しいバージョンのインストールパッケージに関する情報を自動処理し、新しいプルリクエストを作成します。

### ウェブサイト

新しいアプリのアップロードと同様に、ウェブサイトで新しいバージョンのインストールパッケージをアップロードします。ウェブサイトがパッケージを自動解析し、アプリの前のバージョンの各項目を自動入力します。変更がある場合は、該当する項目を修正してください。送信すると、ウェブサイトが新しいプルリクエストを作成します。

## アプリの公開停止

### czdev

新しいアプリのアップロードと同様に、同じディレクトリで `the_path_of_AppBuilder/czdev unpublish package_name --version 1.2.3` を実行します。ツールがアプリの所有者などの情報を確認し、そのバージョンのアプリの公開を停止するためのプルリクエストを作成します。

![czdev unpublish](assets/docs/Submit10_czdev_unpublish.png)

### ウェブサイト

新しいアプリのアップロードと同様に、ウェブサイトで `My packages` ボタンをクリックすると、その GitHub アカウントに紐づくすべてのアプリとバージョンを確認できます。該当する項目の `unpublish` をクリックすると、ウェブサイトがそのバージョンのアプリの公開を停止するためのプルリクエストを作成します。

![web manage](assets/docs/Submit09_web_manage.png)

## 参考資料

- [CardputerZero アプリケーション開発ガイドライン](https://cardputer.cc/#/documents/cp0-dev)
- [CardputerZero/Template](https://github.com/CardputerZero/Template)：アプリ開発用テンプレート
- [CardputerZero/AppBuilder](https://github.com/CardputerZero/AppBuilder)：czdev コマンドラインツールを含む
- [CardputerZero/dev-portal](https://github.com/CardputerZero/dev-portal)：開発者センターのウェブサイト用ツール
- [CardputerZero/packages](https://github.com/CardputerZero/packages)：Store に掲載されているすべてのサードパーティ製アプリのカタログ
- [CardputerZero/Store](https://github.com/CardputerZero/Store)：デバイス向け Store アプリ
- [CardputerZero/cardputerzero.github.io](https://github.com/CardputerZero/cardputerzero.github.io)：cardputer.cc ウェブサイト
