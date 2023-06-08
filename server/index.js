const express = require("express"),
  PORT = 5000,
  app = express();


app.get("/api/v1/todos", (req, resp) => {
  fetch('https://dummyjson.com/todos?limit=5')
    .then(res => res.json())
    .then(json => resp.send(json));
});


app.listen(PORT, () =>
  console.log(`start listening on port : ${PORT}`));
