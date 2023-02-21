## Android

1.  Clone git repository
2.  ```npm install```
3.  ```ionic serve```  for local emulation

4. Prepare and create build. Generally need to install environment  https://ionicframework.com/docs/developing/android
   - Android SDK via Android studio
   - Configuring Command Line Tools. To setup local PATHs
   - ```JDK8``` for cordova. Version important
   - ```Gradle``` for building process

```bash
ionic cordova prepare android 
ionic cordova build android --prod --release 
```

5. sign // please select only one depend on application which you try to build

```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore trackerway.keystore -storepass WwgeHMWYJ7XivJFwjJ6e platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk "trackerway" 

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore tracking_platform_android.key -storepass 123456 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk "tracking_platform" 

```

6. pack

```bash
`echo $ANDROID_SDK_ROOT`/build-tools/30.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk com.yd.trackerway-1.zz.x.x.apk
```
note that path can be different due another version of build tools

7. download locally

if use macmini 

```bash
scp trackingplatfrom@<ip-address>:/Users/trackingplatfrom/Projects/mobile.trackerway/com.yd.trackerway-<version>.apk  com.yd.trackerway-<version>.apk
```

8. install via adb

```bash
adb install -r -d com.yd.trackerway-<version>.apk
```

## iOS

1.  Clone git repository
2.  ```npm install```
3.  ```ionic serve```  for local emulation
4.  Prepare and create build. Generally need to install environment https://ionicframework.com/docs/developing/ios

```bash
ionic cordova prepare ios 
```
go to  ```platforms\ios``` open  `project-name.xcworkspace`  build application. upload to appstore
