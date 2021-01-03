export default function (acc, e) {
  e.preventDefault();
  this.el.className = 'compose';
  return acc;
}
