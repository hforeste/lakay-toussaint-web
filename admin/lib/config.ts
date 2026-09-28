export function getConfig(name: string) {
  return process.env[name] || "";
}
