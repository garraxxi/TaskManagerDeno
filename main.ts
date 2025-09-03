import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { db } from "./db.ts";

const app = new Application();
app.use(oakCors()); //Enable cors for angular

const router = new Router();

// GET /tasks
router.get("/tasks", (ctx) => {
  const tasks = [];
  for (const [id, title, description, isCompleted, createdAt] of db.query("SELECT * FROM tasks")) {
    tasks.push({ id, title, description, isCompleted: !!isCompleted, createdAt });
  }
  ctx.response.body = tasks;
});

// GET /tasks/:id
router.get("/tasks/:id", (ctx) => {
  const id = ctx.params.id;
  const [task] = db.query("SELECT * FROM tasks WHERE id = ?", [id]);
  if(!task){
    ctx.response.status = 404;
    ctx.response.body = { error: "Task not found!" };
    return;
  }
  const [taskId, title, description, isCompleted, createdAt] = task;
  ctx.response.body = { id: taskId, title, description, isCompleted: !!isCompleted, createdAt }
});

// POST /tasks
router.post("/tasks", async (ctx) => {
  const body = await ctx.request.body.json();
  const { title, description, isCompleted } = body;
  const createdAt = new Date().toISOString();
  db.query("INSERT INTO tasks (title, description, isCompleted, createdAt) values (?, ?, ?, ?)", [title, description, isCompleted ? 1 : 0, createdAt]);
  const [task] = db.query("SELECT * FROM tasks WHERE id = last_insert_rowid()");
  const [taskId, taskTitle, taskDesc, taskCompleted, taskCreatedAt] = task;
  ctx.response.body = { id: taskId, title: taskTitle, description: taskDesc, isCompleted: !!taskCompleted, createdAt: taskCreatedAt };
});

// PUT /tasks/:id
router.put("/tasks/:id", async (ctx) => {
  const id = ctx.params.id;
  const body = await ctx.request.body.json();
  const { title, description, isCompleted } = body;
  db.query("UPDATE tasks SET title = ?, descrition = ?, isCompleted = ? WHERE id = ?", [title, description, isCompleted ? 1 : 0, id]);
  ctx.response.body = { message: "Task updated" };
});

// DELETE /tasks/:id
router.delete("/tasks/:id", (ctx) => {
  const id = ctx.params.id;
  db.query("DELETE FROM tasks WHERE id = ?", [id]);
  ctx.response.body = { message: "Task delete" };
});

router.get("/", (ctx) => {
  ctx.response.body = "Task Manager API";
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
