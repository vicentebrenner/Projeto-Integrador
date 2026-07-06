# Regras ProGuard para o projeto Music Makers WebView

# ─── WebView + JavaScript Interface ───────────────────────────────────────────
# Preserva a MainActivity para que a interface JS continue funcionando
-keepclassmembers class br.com.musicmaker.MainActivity {
    public *;
}

# ─── AndroidX / Material ──────────────────────────────────────────────────────
-keep class androidx.** { *; }
-keep class com.google.android.material.** { *; }

# ─── Splash Screen ────────────────────────────────────────────────────────────
-keep class androidx.core.splashscreen.** { *; }

# ─── FileProvider ─────────────────────────────────────────────────────────────
-keep class androidx.core.content.FileProvider { *; }

# ─── Rastreamento de stack traces ─────────────────────────────────────────────
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile