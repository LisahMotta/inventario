import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Usar SQLite como banco local
const sqlite = new Database("inventario.db");
export const db = drizzle(sqlite, { schema }); 