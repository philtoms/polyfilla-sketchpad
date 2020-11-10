const post = (data, root, path = '') =>
  fetch(`${root}/sketch/${path}`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(data),
  });

const batched = {};
setInterval(() => {
  Object.entries(batched).forEach(([root, batched]) => {
    if (batched.length) {
      const data = batched.splice(0, Math.min(batched.length, 100));
      post(data, root, 'batch');
    }
  });
}, 3000);

const batch = (data, root) => {
  if (!batched[root]) batched[root] = [];
  batched[root].push(data);
};
// .then(res => res.json())
// .then(data => console.log(data)),

const get = (root) =>
  fetch(`${root}/sketch`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'GET',
  }).then((res) => res.json());

export default {
  post,
  batch,
  get,
};
