# Setup Guide

Steps to go from the project zip to a running app on your phone.

## 1. Install prerequisites

- **Node.js 18+** — https://nodejs.org (LTS version)
- **Expo Go app** on your phone:
  - iOS: https://apps.apple.com/app/expo-go/id982107779
  - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
  - Keep this app updated — Expo Go only supports the single latest SDK version at a time, so an outdated app or an outdated project will refuse to connect.

## 2. Install

```bash
npm install
```

## 3. Run it

```bash
npm start
```

Scan the printed QR code with:
- **iOS**: Camera app (it'll prompt to open in Expo Go)
- **Android**: Expo Go app's own QR scanner

Or press `i` / `a` in the terminal for a simulator/emulator.

## 4. Verify everything is healthy (optional but recommended)

```bash
npx expo-doctor
```

Should print `X/X checks passed`. If it doesn't, fix whatever it flags before debugging anything else.

## Troubleshooting

**"Runtime not ready" / syntax errors / "private properties are not supported" in Expo Go**
Your installed Expo Go app and the project's Expo SDK version don't match. Expo Go only supports the newest SDK — check what SDK your Expo Go app version supports, then in the project:
```bash
npx expo install expo@^<matching-SDK-version>.0.0
npx expo install --fix
```

**"Cannot find module 'babel-preset-expo'" during build/bundling**
```bash
npx expo install babel-preset-expo
```


**`eas` command not recognized**
Either install it globally (`npm install -g eas-cli`) or always run it via `npx eas-cli@latest <command>`, from inside the project folder (the one with `app.json`/`package.json` for the app — not a parent folder).

**EAS build fails with "Unknown error... Bundle JavaScript build phase"**
Reproduce locally to see the real error:
```bash
npx expo export --platform ios
```
(swap `ios` for `android` as needed)

**iOS build "can't be installed" on your phone**
A build made with `ios.simulator: true` in `eas.json` only runs in the Xcode iOS Simulator (Mac only) — it will never install on a real iPhone. For a real device you need:
- an Apple Developer account ($99/yr), and
- a build profile without `simulator: true` (e.g. `"distribution": "internal"`), and
- your device UDID registered with EAS.

For day-to-day development, skip building entirely and just use Expo Go (`npm start`, scan QR) — no Apple account needed.
