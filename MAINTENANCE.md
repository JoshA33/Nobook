# Nobook maintenance build 0.1.2-dev

## Signed fork prerelease 0.1.2

The signed release uses application ID `com.josha33.nobook`, version code 13, and a dedicated RSA release certificate. It is an optimized, non-debuggable release build. It installs separately from the earlier `com.ycngmn.nobook.test` APK and requires a fresh login. The original maintenance test results and issue snapshot below describe the preceding development build; the release is a prerelease pending device testing of the optimized binary. Messenger still requires Desktop layout.

Private signing material is stored locally outside this repository. It must never be committed or uploaded as a release asset. Future APK updates must use the same key.

Release validation: `assembleRelease`, `lintRelease` and the four JVM URL tests passed. The signed APK passed Android signature verification (v1, v2 and v3); the manifest reports `com.josha33.nobook`, version code 13, version 0.1.2, minimum SDK 23, target SDK 36, and no debuggable flag.

Release certificate SHA-256: `46245a685524e6f3c1487a38902919e738d6198abc93693e1abc35cec1bde7bb`.

Based on upstream commit `608296b441d3b98beb15f8504d4768cc89b7566c`. Issue snapshot: November 18, 2026, 88 open reports.

This is an unofficial maintenance build in JoshA33's fork, not a claim that all upstream issues are resolved. No upstream GitHub issues were closed or upstream code changed.

## Changes

- Removed the global URL.createObjectURL hook that saved upload previews and interfered with MediaSource playback. Explicit blob download links remain supported.
- Media downloads prioritize visible videos, including partially offscreen videos and currentSrc/source elements. They no longer substitute profile images on video pages, reject failed HTTP responses, prevent duplicate concurrent requests and permit retries.
- Internal URL checks now validate host boundaries and HTTPS. Subframes no longer launch external apps. Facebook redirect cleanup preserves existing query escaping, valueless parameters, ports and fragments.
- Bundled scripts replace unversioned remote startup scripts. This intentionally removes upstream hot updates: script updates now require a new APK. Per-document guards prevent repeated observers, and text-selection updates scan inserted nodes.
- Added Arabic and Thai sponsored labels, Unicode-safe matching and explicit desktop ad-label detection.
- Added rotation configuration handling to preserve the active WebView, a Back fallback before scripts are ready, and file-picker callback cancellation/reset.
- Download and clipboard notifications run on the main thread. Failed MediaStore saves delete unfinished entries rather than reporting success.
- Added missing translations for seven existing locales; translations should receive native-speaker review.
- Updated Android Gradle Plugin 9.1.0 to 9.1.1; application version 0.1.2-dev (12).
- Added offline DOM regression tests, JVM URL tests and a CI verification workflow.

## Verification and limitations

Seven Node/jsdom regression tests pass. Four JVM URL regression tests pass. Android assembleDebug and lintDebug passed with no lint errors. Remaining lint warnings concern newer dependency versions; major toolchain/library migrations were not attempted in this maintenance build.

No Android device was connected to the build environment. The user subsequently signed in on their phone and reported normal operation of the other features they tried. They confirmed Messenger works in Desktop layout; the mobile-layout Messenger button still shows “Not supported.” This is informal user testing, not exhaustive verification of all 88 reports. Live 2FA, every feed layout, storage permissions on Android 6–9, and measured long-session performance remain unverified. Existing live Facebook tests require credentials and were not run. New feature requests are not silently treated as bug fixes.

The debug APK uses the existing `com.ycngmn.nobook.test` application ID and a local debug signing key. It installs alongside the official app and does not replace or inherit the official app's login/data. It is for testing, not a signed upstream release.

## Reproduce

Use JDK 17+ and Android SDK 36/build-tools 36.0.0. Set ANDROID_HOME or local.properties to your SDK.

```sh
npm ci
npm test
./gradlew :app:testDebugUnitTest --tests '*UrlTest' :app:lintDebug :app:assembleDebug
```

## Every open report

“Pending” means the issue must not be closed based on this build alone.

| Issue | Title | Status / next evidence |
|---|---|---|
| [#193](https://github.com/ycngmn/Nobook/issues/193) | Feature request of watch history section | Feature request; not implemented in this maintenance build. |
| [#190](https://github.com/ycngmn/Nobook/issues/190) | Cant remove notifications | Subframe browser launches prevented. Notification deletion itself remains unverified. |
| [#189](https://github.com/ycngmn/Nobook/issues/189) | Shows ads with remove ads enabled | Ad matching improved; current Facebook feed needs live reproduction. |
| [#187](https://github.com/ycngmn/Nobook/issues/187) | Developer Options On, Minimum Width increased to 411 to make it Tablet like - Download video fails | Partly visible videos and currentSrc handled; regression test passes. Tablet confirmation pending. |
| [#185](https://github.com/ycngmn/Nobook/issues/185) | Connection error | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#183](https://github.com/ycngmn/Nobook/issues/183) | Application freezes and buttons become unresponsive | Duplicate script injection guarded, DOM scans reduced, MediaSource interception removed. Freeze report remains unverified. |
| [#182](https://github.com/ycngmn/Nobook/issues/182) | Issue on desktop mode | Upload-preview auto-download removed; regression test passes. Device confirmation pending. |
| [#181](https://github.com/ycngmn/Nobook/issues/181) | Some sponsered ads in the marketplace | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#180](https://github.com/ycngmn/Nobook/issues/180) | Video are not playing | MediaSource interception removed and incorrect image fallback blocked. Playback still needs device reproduction. |
| [#177](https://github.com/ycngmn/Nobook/issues/177) | Slows down my whole phone and then freezes | Duplicate observers guarded and DOM scans reduced. Long-session test still needed. |
| [#176](https://github.com/ycngmn/Nobook/issues/176) | Can't scroll description of reel | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#175](https://github.com/ycngmn/Nobook/issues/175) | Ads are showing up in Thai UI | Thai labels added and desktop label matching tested. Live UI confirmation pending. |
| [#174](https://github.com/ycngmn/Nobook/issues/174) | Reels showing on homepage when disabled | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#172](https://github.com/ycngmn/Nobook/issues/172) | Losing tags when editing comments | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#171](https://github.com/ycngmn/Nobook/issues/171) | Return messager to mobile layout | Feature request; not implemented in this maintenance build. |
| [#170](https://github.com/ycngmn/Nobook/issues/170) | Endless back loop | Back works when scripts are not initialized. Profile/story history loop remains unverified. |
| [#169](https://github.com/ycngmn/Nobook/issues/169) | Stories loads into lower Res when played | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#168](https://github.com/ycngmn/Nobook/issues/168) | App not reacting when tapping on a PDF attachment | Explicit blob download links preserved. Other PDF attachment flows still need reproduction. |
| [#167](https://github.com/ycngmn/Nobook/issues/167) | "Connect to a network" issue | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#166](https://github.com/ycngmn/Nobook/issues/166) | Filter out new type of "suggested" posts with "Follow" button | Feature request; not implemented in this maintenance build. |
| [#163](https://github.com/ycngmn/Nobook/issues/163) | Support for a global playbackspeed extension or customisation | Feature request; not implemented in this maintenance build. |
| [#162](https://github.com/ycngmn/Nobook/issues/162) | News feed auto refresh | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#161](https://github.com/ycngmn/Nobook/issues/161) | Webp vs Jpg | Feature request; not implemented in this maintenance build. |
| [#160](https://github.com/ycngmn/Nobook/issues/160) | Ads and other posts showing up in Vietnamese UI | Unicode label matching improved; Vietnamese live UI still needs testing. |
| [#158](https://github.com/ycngmn/Nobook/issues/158) | Error in the marketplace | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#157](https://github.com/ycngmn/Nobook/issues/157) | Features not working in Desktop Layout | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#156](https://github.com/ycngmn/Nobook/issues/156) | rotate phone not showing same post | Activity handles rotation without recreation; device verification pending. |
| [#155](https://github.com/ycngmn/Nobook/issues/155) | Auto refresh | Rotation recreation addressed; other refresh triggers not reproduced. |
| [#154](https://github.com/ycngmn/Nobook/issues/154) | Marketplace not working | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#153](https://github.com/ycngmn/Nobook/issues/153) | ADs showing up | Ad matching improved; no guarantee for current live Facebook layouts. |
| [#151](https://github.com/ycngmn/Nobook/issues/151) | messenger button crashes | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#150](https://github.com/ycngmn/Nobook/issues/150) | Save Video and Save Reel Button Not Working | Download selection, retry and errors improved. Facebook streaming sources still need reproduction. |
| [#149](https://github.com/ycngmn/Nobook/issues/149) | bug when click a link | Encoded links/fragments preserved; URL regression tests pass. |
| [#148](https://github.com/ycngmn/Nobook/issues/148) | comments | Feature request; not implemented in this maintenance build. |
| [#147](https://github.com/ycngmn/Nobook/issues/147) | Add Arabic "مُموَّل" to sponsored posts detection | Arabic labels added and Unicode matching tested. |
| [#146](https://github.com/ycngmn/Nobook/issues/146) | Connect to a network | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#145](https://github.com/ycngmn/Nobook/issues/145) | app refreshes when screen rotates | Activity handles rotation without recreation; device verification pending. |
| [#144](https://github.com/ycngmn/Nobook/issues/144) | [Feature Request] Add Option to change App icon | Feature request; not implemented in this maintenance build. |
| [#141](https://github.com/ycngmn/Nobook/issues/141) | Vanishing posts | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#138](https://github.com/ycngmn/Nobook/issues/138) | Please bring back message support | Feature request; not implemented in this maintenance build. |
| [#134](https://github.com/ycngmn/Nobook/issues/134) | Opening Facebook links in messenger does not redirect to Nobook | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#131](https://github.com/ycngmn/Nobook/issues/131) | Image downloading issue | Download failures and MediaStore cleanup improved; current photo UI still needs reproduction. |
| [#130](https://github.com/ycngmn/Nobook/issues/130) | slow loading speed | Network script fetch removed from startup. End-to-end startup timing not measured. |
| [#129](https://github.com/ycngmn/Nobook/issues/129) | share a post or picture to other apps | Feature request; not implemented in this maintenance build. |
| [#127](https://github.com/ycngmn/Nobook/issues/127) | Dark mode text not visible | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#126](https://github.com/ycngmn/Nobook/issues/126) | Reels not hiding anymore | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#125](https://github.com/ycngmn/Nobook/issues/125) | Active status is ON in the home screen when it should be off (set from parameters) | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#121](https://github.com/ycngmn/Nobook/issues/121) | Player Is Broken | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#119](https://github.com/ycngmn/Nobook/issues/119) | A few things broken on the Pixel Tablet | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#118](https://github.com/ycngmn/Nobook/issues/118) | Whatsapp share is broken | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#116](https://github.com/ycngmn/Nobook/issues/116) | text not visible while Amoled Black on | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#115](https://github.com/ycngmn/Nobook/issues/115) | copy/paste | Clipboard notifications moved to main thread. Clipboard sharing itself still needs device testing. |
| [#113](https://github.com/ycngmn/Nobook/issues/113) | Low video quality | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#110](https://github.com/ycngmn/Nobook/issues/110) | Eats more battery | Duplicate observers guarded and DOM scans reduced. Battery measurement not performed. |
| [#108](https://github.com/ycngmn/Nobook/issues/108) | [Bug] Settings Option Hides when enable Mobile Data | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#107](https://github.com/ycngmn/Nobook/issues/107) | Increase font size | Feature request; not implemented in this maintenance build. |
| [#105](https://github.com/ycngmn/Nobook/issues/105) | Cannot play video in desktop mode | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#102](https://github.com/ycngmn/Nobook/issues/102) | Ability to install on older devices! | Feature request; not implemented in this maintenance build. |
| [#101](https://github.com/ycngmn/Nobook/issues/101) | Amoled Black | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#100](https://github.com/ycngmn/Nobook/issues/100) | Optionally open immediately in "Feeds" (All/Favorites/Friends/Groups/Pages) at app start | Feature request; not implemented in this maintenance build. |
| [#99](https://github.com/ycngmn/Nobook/issues/99) | When hide suggested posts is enabled, i can see only post. | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#98](https://github.com/ycngmn/Nobook/issues/98) | Messenger automatically download to device | Upload-preview auto-download removed; regression test passes. Device confirmation pending. |
| [#97](https://github.com/ycngmn/Nobook/issues/97) | Feed scroll jumps backward - requires app restart to temporarily resolve | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#96](https://github.com/ycngmn/Nobook/issues/96) | Feed scroll jumps backward — issue persists until app is restarted | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#95](https://github.com/ycngmn/Nobook/issues/95) | Amoled black in desktop layout | Feature request; not implemented in this maintenance build. |
| [#94](https://github.com/ycngmn/Nobook/issues/94) | Feed scroll jumps backward | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#93](https://github.com/ycngmn/Nobook/issues/93) | Translation link | Feature request; not implemented in this maintenance build. |
| [#92](https://github.com/ycngmn/Nobook/issues/92) | Ads are not hidden on desktop mode | Explicit desktop ad labels handled; fixture tests pass. Obfuscated labels remain unverified. |
| [#91](https://github.com/ycngmn/Nobook/issues/91) | Add “Blur All Images” Option to Customize Feed for Distraction-Free Browsing | Feature request; not implemented in this maintenance build. |
| [#85](https://github.com/ycngmn/Nobook/issues/85) | Bug problem | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#80](https://github.com/ycngmn/Nobook/issues/80) | Making a comment lags the app | Text selection processes inserted nodes instead of rescanning the full document. Long-session test needed. |
| [#79](https://github.com/ycngmn/Nobook/issues/79) | Add option to customize the navigation bar and hide items. | Feature request; not implemented in this maintenance build. |
| [#75](https://github.com/ycngmn/Nobook/issues/75) | Hide the ads recommendation to get the facebook apps | Feature request; not implemented in this maintenance build. |
| [#74](https://github.com/ycngmn/Nobook/issues/74) | Improve the messenger speed its a little sluggish and lagging | Feature request; not implemented in this maintenance build. |
| [#69](https://github.com/ycngmn/Nobook/issues/69) | Share listing on marketplace | Feature request; not implemented in this maintenance build. |
| [#68](https://github.com/ycngmn/Nobook/issues/68) | couldn't download highlights in a profile | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#67](https://github.com/ycngmn/Nobook/issues/67) | I can't open any marketplace item for some reason it keeps giving me this error | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#66](https://github.com/ycngmn/Nobook/issues/66) | long press to get download option or some other features | Feature request; not implemented in this maintenance build. |
| [#64](https://github.com/ycngmn/Nobook/issues/64) | Accounts With 2FA | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#61](https://github.com/ycngmn/Nobook/issues/61) | Button to open app in publication with several images | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#58](https://github.com/ycngmn/Nobook/issues/58) | add ghost mode | Feature request; not implemented in this maintenance build. |
| [#56](https://github.com/ycngmn/Nobook/issues/56) | Random error warning while browsing through the app | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#47](https://github.com/ycngmn/Nobook/issues/47) | remove infinite scroll/home screen entirely | Feature request; not implemented in this maintenance build. |
| [#38](https://github.com/ycngmn/Nobook/issues/38) | Media suggestions | Feature request; not implemented in this maintenance build. |
| [#28](https://github.com/ycngmn/Nobook/issues/28) | hide share to Whatsapp button | Feature request; not implemented in this maintenance build. |
| [#20](https://github.com/ycngmn/Nobook/issues/20) | Add notifications | Feature request; not implemented in this maintenance build. |
| [#19](https://github.com/ycngmn/Nobook/issues/19) | Video not playing | Open; needs signed-in device reproduction and/or current Facebook DOM evidence. |
| [#10](https://github.com/ycngmn/Nobook/issues/10) | Feature Request: Hold to fast forward video | Feature request; not implemented in this maintenance build. |

