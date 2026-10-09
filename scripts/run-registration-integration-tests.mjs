import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const docker = spawnSync("docker", ["compose", "up", "-d", "--wait", "postgres"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (docker.status !== 0) process.exit(docker.status ?? 1);

const vitestBin = resolve(root, "node_modules/vitest/vitest.mjs");
const tests = spawnSync(process.execPath, [vitestBin, "run", "--config", "vitest.integration.config.ts"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(tests.status ?? 1);
