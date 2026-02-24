import { execSync } from "child_process";
import { cpSync, mkdirSync } from "fs";
import { platform, arch } from "os";
import { join } from "path";

const platformMap = {
  win32: { rid: "win", ext: ".exe" },
  linux: { rid: "linux", ext: "" },
  darwin: { rid: "osx", ext: "" },
};

const archMap = {
  x64: { rid: "x64", rustArch: "x86_64" },
  arm64: { rid: "arm64", rustArch: "aarch64" },
};

const tripleMap = {
  "win32-x64": "x86_64-pc-windows-msvc",
  "linux-x64": "x86_64-unknown-linux-gnu",
  "darwin-x64": "x86_64-apple-darwin",
  "darwin-arm64": "aarch64-apple-darwin",
};

const os = platform();
const cpu = arch();
const key = `${os}-${cpu}`;

const platInfo = platformMap[os];
const archInfo = archMap[cpu];
const triple = tripleMap[key];

if (!platInfo || !archInfo || !triple) {
  console.error(`Unsupported platform: ${key}`);
  process.exit(1);
}

const rid = `${platInfo.rid}-${archInfo.rid}`;
const isRelease = process.argv.includes("--release");
const config = isRelease ? "Release" : "Debug";

const csproj = "src-dotnet/PuduLauncher/PuduLauncher.csproj";
const publishDir = "src-tauri/binaries/.publish";
const destDir = "src-tauri/binaries";
const srcFile = join(publishDir, `PuduLauncher${platInfo.ext}`);
const destFile = join(destDir, `pudu-launcher-sidecar-${triple}${platInfo.ext}`);

const publishArgs = [
  `dotnet publish ${csproj}`,
  `-c ${config}`,
  `-r ${rid}`,
  `-o ${publishDir}`,
];

if (!isRelease) {
  // Dev: skip AOT for fast builds, use single-file instead
  publishArgs.push("/p:PublishSingleFile=true");
  publishArgs.push("/p:PublishAot=false");
  publishArgs.push("/p:PublishTrimmed=false");
}

// Kill any lingering sidecar from a previous run (otherwise the exe is locked on Windows)
const sidecarName = `pudu-launcher-sidecar${platInfo.ext}`;
try {
  if (os === "win32") {
    execSync(`taskkill /F /IM ${sidecarName} 2>nul`, { stdio: "ignore" });
  } else {
    execSync(`pkill -f ${sidecarName} 2>/dev/null`, { stdio: "ignore" });
  }
} catch {
  // No process to kill, that's fine
}

const cmd = publishArgs.join(" ");
console.log(`[build-sidecar] ${config} | ${rid} | ${triple}`);
console.log(`[build-sidecar] ${cmd}`);

execSync(cmd, { stdio: "inherit" });

mkdirSync(destDir, { recursive: true });
cpSync(srcFile, destFile);

console.log(`[build-sidecar] ${destFile}`);
