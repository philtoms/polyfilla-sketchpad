// server.js
const express = require('express');
const fs = require('fs');
const template = fs.readFileSync('./views/index.html', 'utf-8');

const opusList = {};

const app = express();
app.use(express.json());
app.use(express.static('assets'));
app.use('/', express.static('public'));

app.get('/:title?', (req, res) => {
  const { title } = req.params;
  if (!title) {
    res.setHeader('location', `/opus-${Object.keys(opusList).length + 1}`);
    return res.sendStatus(302);
  }
  res.send(template.replace('${title}', title));
});

app.post('/:title/data/:idx', (req, res) => {
  const { title, idx } = req.params;
  const opus = opusList[title] || [];
  const data = req.body;
  if (Array.isArray(data)) {
    opus.splice(idx, data.length, ...data);
  } else if (idx === opus.length) {
    opus.push(data);
  } else {
    opus.length = idx - 1;
    opus.push(data);
  }
  opusList[title] = opus;
  res.json({ title, idx, length: data.length || 1 });
});

app.get('/:title/data', (req, res) => {
  const { title } = req.params;
  const opus = opusList[title] || [];
  res.json(opus);
});

app.get('/:title/data/:idx', (req, res) => {
  const { title, idx } = req.params;
  const opus = opusList[title] || [];
  res.json(opus[idx]);
});

app.post('/:title/data', (req, res) => {
  const { title } = req.params;
  opusList[title] = req.body;
  res.json({ title });
});

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
