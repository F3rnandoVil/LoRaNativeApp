<div align="left" style="position: relative;">
<img src="https://img.icons8.com/external-tal-revivo-duo-tal-revivo/100/external-markdown-a-lightweight-markup-language-with-plain-text-formatting-syntax-logo-duo-tal-revivo.png" align="right" width="30%" style="margin: -20px 0 0 20px;">
<h1>LORANATIVEAPP</h1>
<p align="left">
    <em><code>Bluetooth Low Energy (BLE) Chat Prototype for LoRa Emergency Communication</code></em>
</p>
<p align="left">
    <img src="https://img.shields.io/github/license/F3rnandoVil/LoRaNativeApp?style=default&logo=opensourceinitiative&logoColor=white&color=630f9c" alt="license">
    <img src="https://img.shields.io/github/last-commit/F3rnandoVil/LoRaNativeApp?style=default&logo=git&logoColor=white&color=630f9c" alt="last-commit">
    <img src="https://img.shields.io/github/languages/top/F3rnandoVil/LoRaNativeApp?style=default&color=630f9c" alt="repo-top-language">
    <img src="https://img.shields.io/github/languages/count/F3rnandoVil/LoRaNativeApp?style=default&color=630f9c" alt="repo-language-count">
</p>
<p align="left"></p>
<p align="left">
    </p>
</div>
<br clear="right">

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
	- [Project Index](#project-index)
- [Getting Started](#getting-started)
	- [Prerequisites](#prerequisites)
	- [Installation](#installation)
	- [Usage](#usage)
	- [Testing](#testing)
- [Project Roadmap](#project-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

`LoRaNativeApp` is a **React Native (Expo)** mobile application prototype designed for **emergency communication** by leveraging **Bluetooth Low Energy (BLE)**. It facilitates connection to a nearby LoRa antenna/device, enabling peer-to-peer messaging and a dedicated SOS function within an area lacking conventional network coverage.

The core logic handles Bluetooth scanning, connection, service discovery, and message transmission/reception using the `react-native-ble-plx` library, including proper handling of BLE permissions, connection status, and message encoding/decoding.

---

## Features

* **Bluetooth Low Energy (BLE) Scanning:** Discover nearby LoRa antenna devices.
* **Secure Connection Handling:** Manages connection, disconnection, and monitors characteristic notifications (`NOTIFY_CHAR_UUID`).
* **Bi-directional Chat:** Send messages to the connected LoRa device via a designated write characteristic (`WRITE_CHAR_UUID`).
* **Automatic Echo Filtering:** Implements logic to prevent displaying self-sent messages as incoming 'other' messages due to Bluetooth echo.
* **Emergency SOS Button:** A dedicated button to send a priority "Emergencia! SOS! Emergencia!" message.
* **Android & iOS BLE Permissions:** Includes logic for requesting necessary location and Bluetooth permissions on both Android and iOS.
* **Intuitive UI:** Simple three-screen flow: Landing, Scanning, and Chat.

---

## Project Structure

```sh
└── LoRaNativeApp/
    ├── App.jsx
    ├── app.json
    ├── assets
    │   ├── adaptive-icon.png
    │   ├── favicon.png
    │   ├── icon.png
    │   └── splash-icon.png
    ├── eas.json
    ├── index.js
    ├── package-lock.json
    └── package.json
```

### Project Index

<details open>
<summary><b><code>LORANATIVEAPP/</code></b></summary>
<details> <summary><b>**root**</b></summary>
<blockquote>
<table>
<tr>
<td><b><a href='https://github.com/F3rnandoVil/LoRaNativeApp/blob/master/package-lock.json'>package-lock.json</a></b></td>
<td><code>Contains the exact dependency tree and versions. Key dependencies include expo, react-native, and react-native-ble-plx.</code></td>
</tr>
<tr>
<td><b><a href='https://github.com/F3rnandoVil/LoRaNativeApp/blob/master/app.json'>app.json</a></b></td>
<td><code>Expo configuration file, defining the app name, slug, icons, and native-specific settings including required BLE permissions (BLUETOOTH_SCAN, BLUETOOTH_CONNECT, ACCESS_FINE_LOCATION) and the 'react-native-ble-plx' plugin settings.</code></td>
</tr>
<tr>
<td><b><a href='https://github.com/F3rnandoVil/LoRaNativeApp/blob/master/eas.json'>eas.json</a></b></td>
<td><code>Configuration for Expo Application Services (EAS) builds, defining build profiles for development, preview, and production.</code></td>
</tr>
<tr>
<td><b><a href='https://github.com/F3rnandoVil/LoRaNativeApp/blob/master/App.jsx'>App.jsx</a></b></td>
<td><code>The main application component containing the state management, BLE logic (scanning, connection, send/receive data), permission requests, and the UI for the Landing, Scanning, and Chat screens.</code></td>
</tr>
<tr>
<td><b><a href='https://github.com/F3rnandoVil/LoRaNativeApp/blob/master/index.js'>index.js</a></b></td>
<td><code>The entry point for the Expo application, registering the root component.</code></td>
</tr>
<tr>
<td><b><a href='https://github.com/F3rnandoVil/LoRaNativeApp/blob/master/package.json'>package.json</a></b></td>
<td><code>Project dependencies (expo, react-native, react-native-ble-plx, buffer) and standard Expo scripts.</code></td>
</tr>
</table>
</blockquote>
</details>
</details>

-----

## Getting Started

### Prerequisites

Before getting started with LoRaNativeApp, ensure your runtime environment meets the following requirements:

  - **Programming Language:** JavaScript/JSX
  - **Package Manager:** Npm (or Yarn)
  - **Runtime Environment:** Node.js (recommended version matching Expo SDK)
  - **Mobile Environment:** Expo CLI installed globally, and Expo Go app (for quick development) or a native build environment (for full BLE support).

### Installation

Install LoRaNativeApp using one of the following methods:

**Build from source:**

1.  Clone the LoRaNativeApp repository:

<!-- end list -->

```sh
❯ git clone [https://github.com/F3rnandoVil/LoRaNativeApp](https://github.com/F3rnandoVil/LoRaNativeApp)
```

2.  Navigate to the project directory:

<!-- end list -->

```sh
❯ cd LoRaNativeApp
```

3.  Install the project dependencies:

**Using `npm`**   ()

```sh
❯ npm install
```

### Usage

Run LoRaNativeApp using the following command:
**Using `npm`**   ()

```sh
❯ npm start
```

This will start the Expo development server. You can then use the **Expo Go** app on your mobile device to scan the QR code and load the app, or run a native build (for full BLE functionality) with `npm run android` or `npm run ios`.

### Testing

This project does not explicitly define a test script in `package.json`. If a testing framework like Jest were to be used, the command would typically be:
**Using `npm`**   ()

```sh
❯ npm test
```

-----

## Project Roadmap

  - [X] **`Task 1`**: <strike>Implement feature one. (BLE scanning and basic UI complete)</strike>
  - [ ] **`Task 2`**: Implement persistent message storage (e.g., using AsyncStorage).
  - [ ] **`Task 3`**: Implement a more robust mechanism for handling multiple LoRa nodes/routing, beyond a single connection.

-----

## Contributing

  - **💬 [Join the Discussions](https://github.com/F3rnandoVil/LoRaNativeApp/discussions)**: Share your insights, provide feedback, or ask questions.
  - **🐛 [Report Issues](https://github.com/F3rnandoVil/LoRaNativeApp/issues)**: Submit bugs found or log feature requests for the `LoRaNativeApp` project.
  - **💡 [Submit Pull Requests](https://github.com/F3rnandoVil/LoRaNativeApp/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1.  **Fork the Repository**: Start by forking the project repository to your github account.
2.  **Clone Locally**: Clone the forked repository to your local machine using a git client.
    ```sh
    git clone [https://github.com/F3rnandoVil/LoRaNativeApp](https://github.com/F3rnandoVil/LoRaNativeApp)
    ```
3.  **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
    ```sh
    git checkout -b new-feature-x
    ```
4.  **Make Your Changes**: Develop and test your changes locally.
5.  **Commit Your Changes**: Commit with a clear message describing your updates.
    ```sh
    git commit -m 'Implemented new feature x.'
    ```
6.  **Push to github**: Push the changes to your forked repository.
    ```sh
    git push origin new-feature-x
    ```
7.  **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8.  **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!

</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
<a href="https://github.com{/F3rnandoVil/LoRaNativeApp/}graphs/contributors">
<img src="https://contrib.rocks/image?repo=F3rnandoVil/LoRaNativeApp">
</a>
</p>
</details>

-----

## License

This project is protected under the **MIT License**. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/mit/) file.

-----

## Acknowledgments

  * This project utilizes **React Native** and **Expo** for cross-platform mobile development.
  * The **react-native-ble-plx** library is essential for managing Bluetooth Low Energy communication.
  * The **Buffer** polyfill is used for encoding/decoding Base64 data for BLE characteristic writes/reads.

-----