const raf = requestAnimationFrame.bind(window) || setTimeout.bind(window);
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

export const fade = (ctx, width, height) => {
  raf(() => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = Math.max(0, data[i + 3] - 5);
    }
    ctx.putImageData(imageData, 0, 0);
    fade(ctx, width, height);
  }, 30);
};

let lastX, lastY;
export const draw = ctx => ({ pageX, pageY, paintType }) => {
  const color = `rgb(0,0,0)`;
  if (paintType === 'fill') {
    ctx.beginPath();
    ctx.arc(pageX, pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.lineTo(pageX, pageY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  lastX = pageX;
  lastY = pageY;
};
