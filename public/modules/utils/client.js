export default context => {
  const post = (data, path = '') =>
    fetch(`${context.value.title}/sketch/${path}`, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    });

  const batched = [];
  setInterval(() => {
    if (batched.length) {
      const batch = batched.splice(0, Math.min(batched.length, 100));
      post(batch, 'batch');
    }
  }, 3000);
  const batch = data => {
    batched.push(data);
  };
  // .then(res => res.json())
  // .then(data => console.log(data)),

  const get = () =>
    fetch(`${context.value.title}/sketch`, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'GET'
    }).then(res => res.json());

  return {
    post,
    batch,
    get
  };
};
