// scripts/patch-android-signing.cjs
//
// `tauri android init` regenerates src-tauri/gen/android from scratch on
// every CI run (nothing under gen/ is committed), and Tauri's generated
// app/build.gradle.kts has no signing wired up by default — it just
// produces "-unsigned.apk". Tauri's own docs require hand-editing that
// file to add a signingConfigs block reading from keystore.properties;
// since the file doesn't survive between runs, that edit has to be
// re-applied here every time instead of done once by hand.
//
// Source template (confirms the exact anchors this patches):
// https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-cli/templates/mobile/android/app/build.gradle.kts
const fs = require('fs');

const path = process.argv[2];
if (!path) {
  console.error('usage: node patch-android-signing.cjs <path-to-build.gradle.kts>');
  process.exit(1);
}

let content = fs.readFileSync(path, 'utf8');

const IMPORT_ANCHOR = 'import java.util.Properties';
if (!content.includes(IMPORT_ANCHOR)) {
  throw new Error(`expected import anchor not found in ${path} — Tauri's template may have changed`);
}
content = content.replace(IMPORT_ANCHOR, `${IMPORT_ANCHOR}\nimport java.io.FileInputStream`);

const BUILD_TYPES_ANCHOR = '    buildTypes {';
if (!content.includes(BUILD_TYPES_ANCHOR)) {
  throw new Error(`expected buildTypes anchor not found in ${path} — Tauri's template may have changed`);
}
const signingConfigsBlock = `    signingConfigs {
        create("release") {
            val keystorePropertiesFile = rootProject.file("keystore.properties")
            val keystoreProperties = Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(FileInputStream(keystorePropertiesFile))
            }
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["password"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["password"] as String
        }
    }
${BUILD_TYPES_ANCHOR}`;
content = content.replace(BUILD_TYPES_ANCHOR, signingConfigsBlock);

const RELEASE_BUILDTYPE_ANCHOR = 'getByName("release") {\n            isMinifyEnabled = true';
if (!content.includes(RELEASE_BUILDTYPE_ANCHOR)) {
  throw new Error(`expected release buildType anchor not found in ${path} — Tauri's template may have changed`);
}
content = content.replace(
  RELEASE_BUILDTYPE_ANCHOR,
  'getByName("release") {\n            signingConfig = signingConfigs.getByName("release")\n            isMinifyEnabled = true'
);

fs.writeFileSync(path, content);
console.log(`patched ${path} with release signingConfig`);
