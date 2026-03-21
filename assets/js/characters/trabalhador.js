import { drawHumanoid } from './shared.js';

function drawBriefcase(ctx, state) {
  const { px, py, playerState } = state;
  const y = playerState === 'run' ? py + 15 : py + 16;
  ctx.fillStyle = '#2d2d2d';
  ctx.fillRect(px + 1, y, 4, 6);
  ctx.fillStyle = '#707070';
  ctx.fillRect(px + 2, y - 1, 2, 1);
}

export function drawTrabalhador(ctx, options) {
  drawHumanoid(ctx, {
    ...options,
    palette: {
      shirt: '#c0392b',
      skin: '#e8b87a',
      pants: '#2c3e7f',
      shoes: '#e08010',
      hair: '#3d2200',
    },
    accessory: drawBriefcase,
  });
}
