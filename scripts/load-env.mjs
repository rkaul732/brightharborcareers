import { readFile } from "node:fs/promises";
import path from "node:path";

function cleanValue(value) {
  const trimmed = value.trim();
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return quoted ? trimmed.slice(1, -1) : trimmed;
}

export async function loadEnv(root = process.cwd()) {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(root, filename);
    const content = await readFile(filePath, "utf8").catch(() => "");
    if (!content) continue;

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) continue;

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = cleanValue(trimmed.slice(equalsIndex + 1));
      if (key && process.env[key] == null) {
        process.env[key] = value;
      }
    }
  }
}
