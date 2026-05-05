import "dotenv/config";

export default ({ config }) => {
  return {
    expo: {
      ...config,
      name: "EventFlow",
      slug: "eventflow",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "eventflow",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      ios: {
        bundleIdentifier: "com.eventflow.app",
        supportsTablet: true,
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
        },
      },
      android: {
        package: "com.eventflow.app",
        adaptiveIcon: {
          foregroundImage: "./assets/images/android-icon-foreground.png",
          backgroundImage: "./assets/images/android-icon-background.png",
          monochromeImage: "./assets/images/android-icon-monochrome.png",
          backgroundColor: "#E6F4FE",
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
      },
      web: {
        output: "static",
        favicon: "./assets/images/favicon.png",
        bundler: "metro",
      },
      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff",
            dark: {
              backgroundColor: "#000000",
            },
          },
        ],
        "expo-secure-store",
        "expo-notifications",
        "expo-camera",
        [
          "expo-image-picker",
          {
            photosPermission: "EventFlow accède à ta galerie pour l'image de l'event.",
            cameraPermission: "EventFlow accède à ta caméra pour scanner les QR codes.",
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
      extra: {
        apiUrl: process.env.API_URL,
        eas: {
          projectId: "3da59647-ff88-48ec-8252-bf0d9dce50d5",
        },
      },
      updates: {
        url: "https://u.expo.dev/3da59647-ff88-48ec-8252-bf0d9dce50d5",
      },
      runtimeVersion: {
        policy: "sdkVersion",
      },
    },
  };
};