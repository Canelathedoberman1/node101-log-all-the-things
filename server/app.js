const express = require('express');
const fs = require('fs');
const app = express();

app.use((req, res, next) => {
  const agent = req.get('User-Agent');
  const time = new Date().toISOString();
  const method = req.method;
  const resource = req.originalUrl;
  const version = `HTTP/${req.httpVersion}`;
  const status = 200;

  const log = `${agent},${time},${method},${resource},${version},${status}\n`;

  console.log(log);

  fs.appendFile('./server/log.csv', log, (err) => {
    if (err) {
      console.error(err);
    }
  });

  next();
});

app.get('/', (req, res) => {
  res.status(200).send('ok');
});

app.get('/logs', (req, res) => {
  fs.readFile('./server/log.csv', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Unable to read log file');
    }

    const lines = data.trim().split('\n');
    const headers = lines.shift().split(',');

    const logs = lines.map((line) => {
      const values = line.split(',');

      return {
        Agent: values[0],
        Time: values[1],
        Method: values[2],
        Resource: values[3],
        Version: values[4],
        Status: values[5]
      };
    });

    res.json(logs);
  });
});

module.exports = app;
