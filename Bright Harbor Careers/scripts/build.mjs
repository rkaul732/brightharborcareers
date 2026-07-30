import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const distDir = path.join(root, "dist");

if (!existsSync(publicDir)) {
  throw new Error("Missing public directory.");
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(publicDir, distDir, { recursive: true });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

await writeFile(
  path.join(distDir, "env.js"),
  `window.BHC_ENV = ${JSON.stringify(
    {
      supabaseUrl,
      supabaseAnonKey
    },
    null,
    2
  )};\n`
);

console.log("Built Bright Harbor Careers to dist/.");
