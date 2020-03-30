// server.js
const express = require('express');
const fs = require('fs');
const template = fs.readFileSync('./views/index.html', 'utf-8');

let opusList = {};

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
  // opusList = {};
  res.send(template.replace('${title}', title));
});

const emptyChannels = {
  0: [],
  1: [],
  2: []
};

app.post('/:title/data/:idx', (req, res) => {
  const { title, idx } = req.params;
  const opus = opusList[title] || [];
  const event = req.body;
  opus.length = idx;
  opus[idx] = {
    ...emptyChannels,
    ...opus[idx],
    time: (opus[idx] || event).time,
    [event.channel]: event
  };
  opusList[title] = opus;
  res.json({ title, idx });
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
