# Pumpkin Studio for iPhone and iPad

Pumpkin Studio now includes a Capacitor 8 iOS project. It packages the designer on the device, including the face library, fonts, Three.js preview, and Manifold geometry engine. It works offline after installation. Artwork and mesh generation stay local. The web app and iOS app share the same controls and printable geometry.

The native app saves STL and ZIP files into its Documents folder and opens the iOS share sheet. Exports appear in **Files → On My iPhone/iPad → Pumpkin Studio → Exports**. Use AirDrop or another share destination to send them to a computer. Each export has its own timestamped folder, so earlier prints are preserved. Cancelling sharing leaves the export in Files. Delete old exports using Files.

## What is ready

- An Xcode project and shared App scheme, supporting iPhone and iPad on **iOS/iPadOS 17 or newer**.
- Offline designer assets, a pumpkin app icon, and branded launch screen.
- Native save/share for the complete STL ZIP and individual body, lid, and stem files.
- Offline Batch Export for all built-in faces and Small/Medium/Large sizes, with native saving and sharing of the collection ZIP.
- Touch controls, pinch zoom, safe-area spacing, and Preview/Design/Batch/Export navigation.
- File sharing configuration, an Apple privacy manifest for filesystem timestamps, and in-app privacy details.
- An optional GitHub Actions workflow that builds an unsigned simulator app and an unsigned iPhone IPA on macOS. It does not upload to Apple or require signing credentials. The IPA must be signed for a device before installation.

Web builds, mesh checks, and file-export/worker-loading tests can run on Windows. **A successful asset sync is not an iOS compilation or device test.** Native compilation requires macOS and Xcode, either on a Mac or through the included GitHub workflow. The first [GitHub iOS build](https://github.com/irishfan3124/Pumpkin_Studio/actions/runs/37133707860) passed on October 3, 2026, including the tests, simulator build, and physical-device archive. Its unsigned IPA was downloaded and checked for an ARM64 iPhone executable, bundled designer/WASM, and native export plugins. Signing, real-device checks, and TestFlight/App Store submission remain to be completed. The Windows personal-testing route below uses AltStore for signing and installation.

## Open and run on a Mac

Install **Node.js 22+** and **Xcode 26+** with its command-line tools and an iOS simulator. Open Xcode once and finish its setup. This project uses Swift Package Manager; CocoaPods is not required. Refer to the [Capacitor environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup) when upgrading dependencies.

Clone this repository or copy the project directory onto the Mac. In Terminal:

```sh
cd pumpkin-studio
npm ci
npm test
npm run ios:sync
npm run ios:open
```

Alternatively, open `ios/App/App.xcodeproj` after syncing. Let Xcode resolve its Swift packages. Select the **App** scheme and an iPhone simulator, then click Run. `npm run ios:run` also syncs and offers available simulators/devices.

For a physical device, open **App → Signing & Capabilities**, enable automatic signing, and select your Apple development team. Connect and trust the iPhone and enable Developer Mode if Xcode requests it. Select the phone as the run destination and click Run.

A free Apple account can use Xcode's **Personal Team** for your own device. Its provisioning profile expires after seven days, so you will need to rebuild/reinstall periodically. A paid developer membership is needed for TestFlight, App Store, and registered-device distribution. See [Apple's membership comparison](https://developer.apple.com/support/compare-memberships/).

The initial bundle identifier is `com.irishfan3124.pumpkinstudio`. Confirm that you want to use it and that it is available in your Apple developer account before registering the app. To change it, edit `appId` in `capacitor.config.json` **and** the App target's Bundle Identifier for Debug and Release in Xcode. `cap sync` does not automatically rename an existing native bundle identifier. Keep them consistent.

## Export an IPA for your own iPhone

For direct personal testing, the **Run** button above installs the app without a separate IPA export. If you specifically need an IPA, use an enrolled Apple Developer Program team and ensure your phone is registered:

1. Run `npm run ios:sync`, open the Xcode project, and select your team under **Signing & Capabilities** with automatic signing enabled.
2. Connect your iPhone, choose it as a run destination, and run once so Xcode can register the device and configure provisioning. Enable Developer Mode on the phone if requested.
3. Choose **Any iOS Device (arm64)**, then **Product → Archive**.
4. In Organizer, select the archive and choose **Distribute App → Debugging → Export**. For an Ad Hoc release test, use **Release Testing**, or **Custom → Ad Hoc** when appropriate for your team's signing setup. The device must be included in the provisioning profile.
5. Xcode exports a folder containing the signed `.ipa`. Install it using **Window → Devices and Simulators → your iPhone → Installed Apps → +**, then select the IPA. Apple Configurator on a Mac can also install it. See [Apple's registered-device distribution guide](https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices).

This export requires a native device build; the simulator ZIP from GitHub Actions cannot be renamed into a working IPA. The local browser preview cannot produce one either. On a Windows-only setup, use access to a Mac or a macOS cloud build service for compilation and signing. TestFlight is a convenient installation route once a signed build has been uploaded to your Apple developer account.

## Personal testing from Windows with a free Apple account

The GitHub workflow supplies a device build so you do not need your own Mac for compilation. A free Apple account can sign that IPA for personal use through **AltStore Classic** with **AltServer for Windows**. This is separate from App Store/TestFlight publishing, which requires paid Apple Developer Program membership. Follow the current [official AltStore Windows installation guide](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows) for its iTunes/iCloud requirements and phone setup.

1. Push this project and `.github/workflows/ios.yml` to your GitHub repository.
2. In GitHub open **Actions → Build Pumpkin Studio iOS → Run workflow**. When it succeeds, download **Pumpkin-Studio-iOS-test-builds** under the run's Artifacts section and extract the ZIP.
3. Use **PumpkinStudio-unsigned.ipa** for the phone. The other ZIP contains a simulator app for Mac development.
4. Install AltServer on Windows and use its official instructions to install AltStore Classic on the connected iPhone. Complete Apple account sign-in yourself and enable Developer Mode when requested by iOS.
5. Transfer the IPA to the phone's Files app, then open **AltStore Classic → My Apps → +**, choose the IPA, and let AltStore sign and install it for your Apple account. Launch Pumpkin Studio from the Home Screen.
6. Free-account apps expire after **seven days**; refresh them through AltStore while AltServer is available on the same Wi-Fi network or connected over USB. Free accounts also have a three-active-app limit, including AltStore. See [AltStore's Getting Started guide](https://faq.altstore.io/altstore-classic/your-altstore) and [AltServer connection instructions](https://faq.altstore.io/altstore-classic/altserver).

The downloaded IPA is deliberately unsigned and cannot be installed just by tapping it in Files. Native compilation and the downloaded package passed the checks described above; signing and installation on an actual phone have not been tested. The downloaded test build is saved locally in `pumpkin-studio/build/ios-exports/PumpkinStudio-unsigned.ipa`, alongside a package-verification report and installation notes. This ignored build folder is not committed to Git. Once you choose paid Apple membership, use the TestFlight section instead of this personal testing route.

## TestFlight

1. Enroll the publishing account in the [Apple Developer Program](https://developer.apple.com/programs/). TestFlight and App Store distribution require that account; GitHub Pages hosting does not replace it.
2. Register the app's bundle identifier and create an iOS app record in [App Store Connect](https://appstoreconnect.apple.com/). Use the same bundle identifier as the Xcode target.
3. Test the checklist below. In Xcode set your team, verify the app icon and display name, and choose a version and build number. The current project is version **1.1.0**, build **2**. Increment the build number for each upload.
4. Select **Any iOS Device (arm64)** as the destination, then **Product → Archive**. From Organizer choose **Distribute App → TestFlight & App Store** (or **Custom → App Store Connect → Upload**), and complete Apple's validation/signing steps.
5. After processing completes, open the app's **TestFlight** tab in App Store Connect. Complete beta information and any required export-compliance questions, and add testers. External testing can require beta app review. See [Apple's TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).

No certificates, private keys, Apple account credentials, or paid enrollment have been added to the repository. The project uses only system-provided or exempt encryption and declares `ITSAppUsesNonExemptEncryption=false`; reassess that declaration if future features introduce other encryption.

## App Store release

After beta testing, supply screenshots from real simulator/device runs, an app description, support information, the age-rating questionnaire, pricing/availability, and app privacy answers in App Store Connect. Submit the selected build for review. Approval is decided by Apple.

The current native app has no ads, analytics, accounts, tracking, or uploads to a developer service. Its app privacy declaration should reflect that behavior and be reviewed again if SDKs or services are added. The bundled manifest declares file timestamp access for app-owned exports using reason **C617.1**, following the [Filesystem plugin documentation](https://capacitorjs.com/docs/apis/filesystem).

The source privacy policy is `src/privacy.html`; it is copied into `dist/privacy.html`. After the web changes are deployed, the intended public policy URL is:

`https://irishfan3124.github.io/Pumpkin_Studio/privacy.html`

Verify that URL is live before entering it in App Store Connect. The policy's support contact is the repository issue tracker; confirm that issues are enabled and add a private contact method if desired. Review the policy as the publisher before submission. The app also has an offline **Privacy** button in its footer. [Apple's app privacy guide](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/) describes the submission fields.

Suggested review notes:

> Pumpkin Studio creates customizable 3D printable pumpkins entirely on the device. No login or network connection is required. Select a built-in face or import artwork, adjust dimensions, and inspect the live 3D preview. Tap Save & share STL files to generate a ZIP with separate body, lid, and stem models. Exports are also visible in the app's folder in Files. The models are for battery-powered LED lights only.

## Device acceptance checks

- Launch from a fresh install in airplane mode. Confirm the 3D preview and all built-in faces load.
- Drag to orbit, pinch to zoom, rotate the device, and check controls near the notch and home indicator. Check iPad layouts and larger system text sizes.
- Import SVG and raster artwork from Files, including a padded image with enclosed regions. Verify threshold, inversion, bridges, rotation, and face placement.
- Enter text, change letter styles and font size, and inspect enclosed letters such as B and O.
- Generate a 240 mm pumpkin, change wall and fit settings, and inspect the LED pocket with Body only/Lift the lid views. Check responsiveness and memory on the oldest supported phone.
- Export the ZIP and each separate STL. Check Files visibility, Save to Files, AirDrop, share cancellation, and storage failure. Transfer files to a computer and open them in a slicer; verify millimeter units and three closed parts.
- Open **Batch** in the bottom navigation. Select faces and sizes, generate, then tap **Save & share collection**. Confirm the ZIP is in Files even if the share sheet is dismissed, and each inner Face Name - Size ZIP contains three STL files and printing notes.
- Cancel a batch, wait for the current pumpkin to finish, then generate another batch and edit the individual design. During native generation the design controls are temporarily disabled and the preview remains available. One bundled geometry worker is reused to reduce memory consumption. Check a larger batch on your target iPhone; start with smaller selections on older devices and keep the app in the foreground.
- Change settings while an export is pending and verify the next export uses the new model. Detached-piece designs must keep export disabled.
- Background and reopen the app during generation/export. Confirm recovery and report any loss of the in-memory current design.
- Check VoiceOver labels, the privacy dialog, the printing guide, and the launch screen/icon.

## GitHub compilation check

After pushing the project, open **Actions → Build Pumpkin Studio iOS → Run workflow**. The macOS job runs the tests, synchronizes assets, and compiles Release apps for the simulator and a physical iPhone without Apple signing credentials. Its artifact contains a simulator `.app` inside a ZIP and **PumpkinStudio-unsigned.ipa**. The IPA needs device signing (for example, AltStore Classic for personal testing) and is not a TestFlight build. The simulator app can be installed into a booted simulator on a Mac. The workflow also runs for pull requests that touch the app.

The first [workflow run](https://github.com/irishfan3124/Pumpkin_Studio/actions/runs/37133707860) completed successfully for app commit `1c8d883` on October 3, 2026. Its unsigned IPA was downloaded and inspected; real-device installation is still pending. If a future run reports Swift package or SDK errors, inspect that run before attempting submission. A signed cloud build/upload workflow can be added later once the developer team, bundle identifier, and signing method are chosen.

## Updating the app

After changing web code, run `npm run ios:sync` before building in Xcode. This rebuilds the website assets, regenerates native icons, copies assets into the app, and updates the native plugin package. `dist/` is also used by GitHub Pages. Updating the website alone does not update an installed iOS app; distribute a new signed build through TestFlight/App Store, or rebuild and install the new IPA through AltStore for personal testing.

Commit the native project, configuration, and asset source. Generated `ios/App/App/public/`, synchronized configuration, build products, and per-user Xcode settings are ignored. `resources/app-icon.svg` is the editable icon source; `npm run ios:assets` regenerates its PNG assets. The `xcode` build tool's `uuid` dependency is overridden to patched version 11; keep the override under review when upgrading Capacitor.
