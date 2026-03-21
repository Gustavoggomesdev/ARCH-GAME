import { drawHumanoid } from './shared.js';

function drawBackpack(ctx, state) {
  const { px, py } = state;
  ctx.fillStyle = '#8e24aa';
  ctx.fillRect(px + 2, py + 14, 5, 7);
  ctx.fillStyle = '#ce93d8';
  ctx.fillRect(px + 3, py + 15, 3, 3);
}

function drawChildIcon(ctx, state) {
  const { px, py, playerState } = state;
  if (playerState === 'run' || playerState === 'idle') {
    ctx.fillStyle = '#fbc02d';
    ctx.fillRect(px + 19, py + 17, 3, 3);
  }
}

export function drawMaeSolo(ctx, options) {
  drawHumanoid(ctx, {
    ...options,
    palette: {
      shirt: '#d81b60',
      skin: '#d8a070',
      pants: '#5e35b1',
      shoes: '#f57c00',
      hair: '#4e342e',
    },
    accessory: (localCtx, state) => {
      drawBackpack(localCtx, state);
      drawChildIcon(localCtx, state);
    },
  });
}
