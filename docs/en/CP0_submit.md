# CardputerZero App Submission Guide

There are two ways to submit and manage apps in the CardputerZero Store:

- The czdev command-line tool (https://github.com/CardputerZero/AppBuilder)
- The Developer Center website (https://dev.cardputer.cc/)

## Getting Started

### czdev

Clone the AppBuilder repository from GitHub to a location of your choice: `git clone https://github.com/CardputerZero/AppBuilder.git`

![clone GitHub repo](assets/docs/Submit01_czdev_clone.png)

Then run `./czdev login` in the root directory of the AppBuilder repository. Enter the eight-character alphanumeric verification code displayed by the tool on the GitHub verification page that opens automatically to complete login.

![czdev login](assets/docs/Submit02_czdev_login.png)
![czdev login](assets/docs/Submit03_czdev_login.png)

### Website

Open the Developer Center website https://dev.cardputer.cc/ in your browser, click the login button, and authorize access to complete login.

![web login](assets/docs/Submit04_web_login.png)
![web login](assets/docs/Submit05_web_login.png)

## Submitting a New App

We recommend starting development with https://github.com/CardputerZero/Template. You can also run `./czdev new my-app` in the root directory of the AppBuilder repository to automatically create a new app from Template.

Before uploading a new app, make sure it meets the development guidelines https://cardputer.cc/#/documents/cp0-dev and has been thoroughly tested on a physical device. Prepare the new app’s `.deb` installation package, then proceed with the upload.

### czdev

Run `the_path_of_AppBuilder/czdev publish --deb the_new_app.deb` in the root directory of your new app’s project (the directory containing `app-builder.json`, which is not necessarily the AppBuilder repository). The tool checks whether the app’s installation package and related files meet the requirements. If the checks pass, it creates a new pull request in https://github.com/CardputerZero/packages/pulls.

![czdev publish](assets/docs/Submit06_czdev_publish.png)

### Website

Open the website https://dev.cardputer.cc/ in your browser and click the upload button to upload the `.deb` installation package. Once the package has been parsed, fill in the required information. Click Upload to submit. The website checks whether the app’s installation package and the information you entered meet the requirements. If the checks pass, it creates a new pull request in https://github.com/CardputerZero/packages/pulls.

![web publish](assets/docs/Submit07_web_publish.png)

Upload a video demonstrating the app on a physical device in the PR’s comments section. The video is intended only for review by Store maintainers and must show the app launching, its main features, and the app exiting. Apps without a physical-device demo video will not be approved.

![PR video](assets/docs/Submit08_pr_video.png)

Once the Store maintainers review and approve the PR, the app will appear in the Store for users to download and install.

## Updating an App

### czdev

As with submitting a new app, run `the_path_of_AppBuilder/czdev publish --deb the_new_version.deb` from the same directory. The tool automatically processes the information associated with the new version’s installation package and creates a new pull request.

### Website

As with submitting a new app, upload the new version’s installation package on the website. The website automatically parses the package and fills in the information from the app’s previous version. If any information has changed, update the corresponding fields. Once you submit, the website creates a new pull request.

## Removing an App

### czdev

As with submitting a new app, run `the_path_of_AppBuilder/czdev unpublish package_name --version 1.2.3` from the same directory. The tool checks app ownership and other information, then creates a pull request to remove that version of the app from the Store.

![czdev unpublish](assets/docs/Submit10_czdev_unpublish.png)

### Website

As with submitting a new app, go to the website and click `My packages` to view all apps and versions associated with your GitHub account. Click `unpublish` for the corresponding item, and the website creates a pull request to remove that version of the app from the Store.

![web manage](assets/docs/Submit09_web_manage.png)

## References

- [CardputerZero Application Development Guidelines](https://cardputer.cc/#/documents/cp0-dev)
- [CardputerZero/Template](https://github.com/CardputerZero/Template): App development template
- [CardputerZero/AppBuilder](https://github.com/CardputerZero/AppBuilder): Includes the czdev command-line tool
- [CardputerZero/dev-portal](https://github.com/CardputerZero/dev-portal): Tools for the Developer Center website
- [CardputerZero/packages](https://github.com/CardputerZero/packages): Catalog of all third-party apps in the Store
- [CardputerZero/Store](https://github.com/CardputerZero/Store): The Store app for the device
- [CardputerZero/cardputerzero.github.io](https://github.com/CardputerZero/cardputerzero.github.io): The cardputer.cc website
