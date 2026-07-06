plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace   = "br.com.musicmaker"
    compileSdk  = 36

    defaultConfig {
        applicationId   = "br.com.musicmaker"
        minSdk          = 26          // Android 8.0 Oreo
        targetSdk       = 36          // Android 16
        versionCode     = 2
        versionName     = "2.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled   = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }

    // Habilita aceleração por hardware no APK final
    packagingOptions {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX Core
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)

    // Material Design
    implementation(libs.material)

    // Splash Screen API oficial (Android 12+, com retrocompatibilidade)
    implementation(libs.androidx.splashscreen)

    // WebKit — recursos modernos de WebView (WebViewCompat, ServiceWorker, etc.)
    implementation(libs.androidx.webkit)

    // Testes
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}