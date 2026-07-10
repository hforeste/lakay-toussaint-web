import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const firebaseHome = join(projectRoot, ".firebase-local");
const emulatorCache = join(firebaseHome, "emulators");
const configHome = join(firebaseHome, "config");

mkdirSync(emulatorCache, { recursive: true });
mkdirSync(configHome, { recursive: true });

const firebaseBin = process.platform === "win32"
  ? join(projectRoot, "node_modules", ".bin", "firebase.cmd")
  : join(projectRoot, "node_modules", ".bin", "firebase");

const args = [
  "emulators:start",
  "--only",
  "firestore,auth",
  "--project",
  "demo-lakay-toussaint",
  ...process.argv.slice(2),
];

const child = spawn(firebaseBin, args, {
  cwd: projectRoot,
  env: {
    ...process.env,
    XDG_CONFIG_HOME: configHome,
    FIREBASE_EMULATORS_PATH: emulatorCache,
  },
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
