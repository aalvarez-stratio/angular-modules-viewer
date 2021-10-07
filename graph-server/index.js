
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {TypescriptParser} = require("../app/typescript-parser/typescript-parser");
const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:4200'
}));
app.use(bodyParser.json());

app.post('/analyze-project', (req, res) => {
  if (req.body.tsConfigPath && req.body.packageJsonPath) {
    const _typescriptParser = new TypescriptParser();
    _typescriptParser
      .analyzeProject(req.body)
      .then(([projectName, results]) => {
        res.send({
          projectName,
          ...results
        });
      });
  } else {
    res.send({ error: 'Path not found' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
