import fs from 'fs';

const dataPath = './data/sketchList.json';

let dataList;

try {
  dataList = JSON.parse(fs.readFileSync(dataPath));
} catch (e) {
  if (e) console.error(e);
  dataList = {};
}

const download = (req, res) => {
  res.json(dataList);
};

const upload = (req, res) => {
  dataList = req.body;
  fs.writeFile(dataPath, JSON.stringify(dataList), err => {
    res.json({ err, count: Object.keys(dataList).length });
  });
};

setInterval(() => {
  fs.writeFile(dataPath, JSON.stringify(dataList), err => {
    if (err) console.error(err);
  });
}, 3000);

export default {
  download,
  upload,
  entry: name => dataList[name],
  clear: name => delete dataList[name],
  count: Object.keys(dataList).length,
  insert: (name, entry) => (dataList[name] = entry),
  list: (start = 0, end) => Object.entries(dataList).slice(start, end)
};
