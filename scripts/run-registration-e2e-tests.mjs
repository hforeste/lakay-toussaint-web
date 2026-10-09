import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const docker = spawnSync("docker", ["compose", "up", "-d", "--wait", "postgres"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (docker.status !== 0) process.exit(docker.status ?? 1);

const playwrightCli = resolve(root, "node_modules/@playwright/test/cli.js");
const tests = spawnSync(process.execPath, [playwrightCli, "test"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(tests.status ?? 1);
