const express = require("express");

const app = express();
const PORT = 3000;

app.get("/", (_, res) => {
  res.send(`
    <html>
      <head>
        <title>Express Starter</title>
      </head>
      <body>
        <h1>Express Starter Running 🚀</h1>
      </body>
    </html>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
