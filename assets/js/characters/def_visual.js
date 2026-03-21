import { drawHumanoid } from './shared.js';

function drawCane(ctx, state) {
  const { px, py, playerState } = state;
  const y = playerState === 'run' ? py + 20 : py + 21;
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px + 20, y - 5);
  ctx.lineTo(px + 24, y + 9);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 23, y + 9, 2, 2);
}

export function drawDefVisual(ctx, options) {
  drawHumanoid(ctx, {
    ...options,
    palette: {
      shirt: '#4e342e',
      skin: '#d9a66a',
      pants: '#283593',
      shoes: '#ef6c00',
      hair: '#212121',
    },
    accessory: drawCane,
  });
}
