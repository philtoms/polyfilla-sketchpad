// server.js
const express = require('express');
const fs = require('fs');
const mainTemplate = fs.readFileSync('./views/index.html', 'utf-8');
const listTemplate = fs.readFileSync('./views/list.html', 'utf-8');

let sketchList = {};

const app = express();
app.use(express.json());
app.use(express.static('assets'));
app.use('/', express.static('public'));

app.get('/data', (req, res) => {
  res.json(sketchList);
});

app.post('/data', (req, res) => {
  sketchList = req.body;
  res.json({ count: Object.keys(sketchList).length });
});

app.get('/list?', (req, res) => {
  res.send(
    listTemplate.replace(
      '${sketches}',
      `<ul>${Object.entries(sketchList).reduce(
        (acc, [title, events]) =>
          `${acc}<li>${`<a href="/${title}">${title}</a><div class="events">${events
            .slice(0, 6)
            .reduce(
              (acc, event) => `${acc} ${event[0].name}`,
              ''
            )}</div>`}</li>`,
        ''
      )}</ul>`
    )
  );
});

app.get('/:title?', (req, res) => {
  const { title } = req.params;
  if (!title) {
    res.setHeader('location', `/sketch-${Object.keys(sketchList).length + 1}`);
    return res.sendStatus(302);
  }
  // sketchList = {};
  res.send(mainTemplate.replace('${title}', title));
});

const emptyChannels = {
  0: [],
  1: [],
  2: []
};

app.post('/:title/data/:idx', (req, res) => {
  const { title, idx } = req.params;
  const sketch = sketchList[title] || [];
  const event = req.body;
  sketch.length = idx;
  sketch[idx] = {
    ...emptyChannels,
    ...sketch[idx],
    time: (sketch[idx] || event).time,
    [event.channel]: event
  };
  sketchList[title] = sketch;
  res.json({ title, idx });
});

app.get('/:title/data', (req, res) => {
  const { title } = req.params;
  const sketch = sketchList[title] || [];
  res.json(sketch);
});

app.get('/:title/data/:idx', (req, res) => {
  const { title, idx } = req.params;
  const sketch = sketchList[title] || [];
  res.json(sketch[idx]);
});

app.get('/:title/data/clear', (req, res) => {
  const { title } = req.params;
  sketchList[title] = [];
  res.json([]);
});

app.post('/:title/data', (req, res) => {
  const { title } = req.params;
  sketchList[title] = req.body;
  res.json({ title });
});

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
