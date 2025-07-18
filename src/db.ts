import { drizzle } from "drizzle-orm/sqlite";
import { Database } from "sqlite3";
import * as schema from "./schema";

const sqlite = new Database("./sqlite.db");
export const db = drizzle(sqlite, { schema }); 