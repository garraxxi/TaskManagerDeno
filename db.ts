import { DB } from "https://deno.land/x/sqlite/mod.ts";

export const db = new DB("tasks.db");
db.query(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description  TEXT,
  isCompleted BOOLEAN NOT NULL,
  createdAt TEXT NOT NULL
  )`);
