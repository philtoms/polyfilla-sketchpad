const raf = requestAnimationFrame.bind(window) || setTimeout.bind(window);

export const copy = (offsetX, offsetY) => (touches, paintType) => {
  const { identifier, pageX, pageY, radiusX, radiusY, rotationAngle, force } =
    // touches.length > 1
    //   ? Array.from(touches).reduce(
    //       (acc, touch) => {
    //         return acc.pageX > touch.pageX ? touch : acc;
    //       },
    //       { pageX: Number.MAX_VALUE }
    //     )
    //   : touches[0];
    touches[0];
  return (
    pageY >= offsetY && {
      channel: 0, // single voice only
      pageX: Math.abs(pageX - offsetX),
      pageY: Math.abs(pageY - offsetY),
      radiusX,
      radiusY,
      rotationAngle,
      force,
      paintType,
    }
  );
};

let working = true;
export const fade = (ctx, width, height) => {
  raf(() => {
    if (working) {
      working = false;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const opacity = data[i + 3];
        const dfade = opacity - opacity / 250;
        if (dfade && !working) {
          working = true;
        }
        data[i + 3] = Math.max(0, dfade - 1);
      }
      ctx.putImageData(imageData, 0, 0);
    }
    fade(ctx, width, height);
  });
};

export const draw = (ctx) => {
  ctx.beginPath();
  return ({ pageX, pageY, paintType }) => {
    working = true;
    const color = `rgb(0,0,0)`;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    if (paintType === 'fill') {
      ctx.beginPath();
      ctx.arc(pageX, pageY, 2, 0, 2 * Math.PI, false); // a circle at the start
      ctx.fill();
    } else {
      ctx.lineTo(pageX, pageY);
      ctx.stroke();
    }
  };
};