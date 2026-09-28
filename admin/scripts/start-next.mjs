import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

for (const filename of ["../.env", "../.env.local"]) {
  const path = resolve(filename);
  if (existsSync(path)) process.loadEnvFile(path);
}

const command = process.argv[2] === "start" ? "start" : "dev";
const nextBin = resolve("node_modules/next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, command, "-p", "3001"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
