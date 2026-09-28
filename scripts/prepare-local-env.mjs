import { randomBytes } from "node:crypto";
import { access, copyFile, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(".env");
const localEnvPath = resolve(".env.local");
const examplePath = resolve(".env.example");

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

let targetPath;

if (await exists(localEnvPath)) {
  targetPath = localEnvPath;
} else if (await exists(envPath)) {
  targetPath = envPath;
} else {
  await copyFile(examplePath, envPath);
  targetPath = envPath;
  console.log("Created .env from .env.example.");
}

let contents = await readFile(targetPath, "utf8");
const generated = [];

function setIfMissing(name, value) {
  const pattern = new RegExp(`^${name}=(.*)$`, "m");
  const match = contents.match(pattern);

  if (match?.[1].trim()) return;

  if (match) {
    contents = contents.replace(pattern, `${name}=${value}`);
  } else {
    const separator = contents.endsWith("\n") ? "" : "\n";
    contents += `${separator}${name}=${value}\n`;
  }

  generated.push(name);
}

setIfMissing("PII_ENCRYPTION_KEY", randomBytes(32).toString("base64"));
setIfMissing("PII_LOOKUP_KEY", randomBytes(32).toString("hex"));
setIfMissing("ADMIN_PASSWORD", randomBytes(18).toString("base64url"));

if (generated.length) {
  await writeFile(targetPath, contents, { encoding: "utf8", mode: 0o600 });
  const targetName = targetPath.endsWith(".env.local") ? ".env.local" : ".env";
  console.log(`Generated ${generated.join(" and ")} in ${targetName}.`);
} else {
  console.log("Local privacy and admin secrets are already configured.");
}
