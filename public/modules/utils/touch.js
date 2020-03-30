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

let lastX, lastY;
export const draw = ctx => ({ pageX, pageY, paintType }) => {
  ctx.beginPath();
  const color = `rgb(0,0,0)`;
  if (paintType === 'fill') {
    ctx.arc(pageX, pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pageX, pageY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  lastX = pageX;
  lastY = pageY;
};
