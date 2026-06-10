plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "uz.navbar.navbar_mobile"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "uz.navbar.navbar_mobile"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        // Постоянный ТЕСТОВЫЙ ключ: нужен, чтобы APK из CI обновлялись
        // поверх друг друга. Перед публикацией в Google Play заменить
        // на секретный release-ключ (через GitHub Secrets, не в репозитории).
        create("ciTest") {
            storeFile = file("../keystores/ci-test.keystore")
            storePassword = "navbar-test"
            keyAlias = "navbar-test"
            keyPassword = "navbar-test"
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("ciTest")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
