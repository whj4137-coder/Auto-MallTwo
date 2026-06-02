# Apex Drive Store WebView APK

轻量 Android WebView 壳，用于把现有 Web Demo 包成横屏 APK。业务仍由公网 Web/API 提供，APK 只负责车机横屏、沉浸式全屏、WebView 容器和返回键。

## 构建前置

- Android Studio 或 Android SDK
- JDK 17+
- 可联网下载 Android Gradle Plugin

本机若用 Homebrew 装了 `openjdk@17` + `android-commandlinetools`，可直接构建（S-037 已实测产出 debug APK）。先设置环境：

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > local.properties   # local.properties 已 gitignore
```

## 构建 Debug APK

```bash
cd android-webview
gradle :app:assembleDebug -PWEBVIEW_URL=https://your-public-domain.example/
```

产物：

```text
android-webview/app/build/outputs/apk/debug/app-debug.apk
```

## 构建 Release APK

```bash
cd android-webview
gradle :app:assembleRelease -PWEBVIEW_URL=https://your-public-domain.example/
```

未配置签名时，Release 包只适合本地调试；正式交付请在 Android Studio 中配置 keystore 后再打包。
