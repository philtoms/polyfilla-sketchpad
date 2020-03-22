export const copy = (offsetX, offsetY) => (
  { identifier = 0, pageX, pageY, radiusX, radiusY, rotationAngle, force },
  paintType
) => ({
  channel: identifier,
  pageX: pageX - offsetX,
  pageY: pageY - offsetY,
  radiusX,
  radiusY,
  rotationAngle,
  force,
  paintType
});

export const fade = (ctx, width, height) => () => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = Math.max(0, data[i + 3] - 10);
  }
  ctx.putImageData(imageData, 0, 0);
};

export const draw = (ctx, m, l) => {
  ctx.beginPath();
  const color = `rgb(0,0,0)`;
  if (m.paintType === 'fill') {
    ctx.arc(m.pageX, m.pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.moveTo(m.pageX, m.pageY);
    ctx.lineTo(l.pageX, l.pageY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
};
