const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
  app.listen(3000, () => {
    console.log("Server successfully started");
  });
};

initializeDBAndServer();

//Query parameters execution API

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const filterQuery = `
    SELECT * FROM todo
    WHERE (todo LIKE "%${search_q}%") AND (priority LIKE '%${priority}%') AND (status LIKE '%${status}%')
    `;
  console.log(filterQuery);
  const dbResponse = await db.all(filterQuery);
  response.send(dbResponse);
});

//Get todo details based ID API

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getDetailsQuery = `
    SELECT * from todo WHERE id=${todoId}
    `;
  const dbResponse = await db.get(getDetailsQuery);
  response.send(dbResponse);
});

//Add a todo item API
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;

  const addTodoQuery = `
    INSERT INTO todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}')
    `;
  const dbResponse = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//Update the details of specific todo API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getPrevioustodoQuery = `SELECT * FROM todo WHERE id=${todoId}`;
  const previousTodo = await db.get(getPrevioustodoQuery);

  const updateRequest = request.body;
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = updateRequest;

  if (todo !== previousTodo.todo) {
    tobeUpdatedField = "Todo";
  } else if (priority !== previousTodo.priority) {
    tobeUpdatedField = "Priority";
  } else {
    tobeUpdatedField = "Status";
  }
  const updateToDoQuery = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}' WHERE id=${todoId}`;

  const dbResponse = await db.run(updateToDoQuery);
  response.send(`${tobeUpdatedField} Updated`);
});

//Delete a todo API

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo WHERE id=${todoId}
    `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
