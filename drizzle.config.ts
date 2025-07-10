//// <reference types="node" />
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // ✅ ESTA É A CHAVE CERTA PARA O DRIZZLE
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
