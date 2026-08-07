# Cordova / WebView bridge
-keep class org.apache.cordova.** { *; }
-keep class org.apache.cordova.engine.** { *; }
-keep public class * extends org.apache.cordova.CordovaPlugin { *; }
-keepclassmembers class * extends org.apache.cordova.CordovaPlugin {
    public <init>(android.content.Context, org.apache.cordova.CordovaInterface, org.apache.cordova.CordovaWebView);
}

# AdMob Plus (community)
-keep class admob.** { *; }
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.**

# Play Billing (cordova-plugin-purchase)
-keep class com.android.billingclient.** { *; }
-keep class com.google.android.gms.common.** { *; }
-dontwarn com.android.billingclient.**

# Screen orientation / misc Cordova plugins
-keep class cordova.plugins.** { *; }
-keep class nl.xservices.plugins.** { *; }
-keep class de.appplant.cordova.plugin.** { *; }

# Keep native methods used by WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod
