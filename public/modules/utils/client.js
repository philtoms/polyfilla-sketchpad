export default context => ({
  post: (data, path = '') =>
    fetch(`${context.value.title}/data/${path}`, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }),
  // .then(res => res.json())
  // .then(data => console.log(data)),

  get: () =>
    fetch(`${context.value.title}/data`, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'GET'
    }).then(res => res.json())
});
