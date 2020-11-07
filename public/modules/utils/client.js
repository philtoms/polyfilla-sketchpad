const post = (data, root, path = '') =>
  fetch(`${root}/sketch/${path}`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(data),
  });

const batched = [];
setInterval(() => {
  if (batched.length) {
    const [data, root] = batched.splice(0, Math.min(batched.length, 100));
    post(data, root, 'batch');
  }
}, 3000);

const batch = (data, root) => {
  batched.push([data, root]);
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
