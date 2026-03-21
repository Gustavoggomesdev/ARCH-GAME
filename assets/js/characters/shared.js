export function drawHumanoid(ctx, options) {
  const {
    px,
    py,
    frame,
    playerState,
    palette,
    accessory,
  } = options;

  const shirt = palette.shirt || '#c0392b';
  const skin = palette.skin || '#e8b87a';
  const pants = palette.pants || '#2c3e7f';
  const shoes = palette.shoes || '#e08010';
  const hair = palette.hair || '#3d2200';

  if (playerState === 'run') {
    ctx.fillStyle = hair;
    ctx.fillRect(px + 7, py, 10, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(px + 7, py + 2, 10, 9);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 13, py + 5, 2, 2);
    ctx.fillStyle = shirt;
    ctx.fillRect(px + 8, py + 11, 8, 11);
    ctx.fillStyle = pants;
    ctx.fillRect(px + 8, py + 22, 8, 10);

    const armOffset = [0, 3, 0, -3][frame];
    ctx.fillStyle = skin;
    ctx.fillRect(px + 4, py + 13 + armOffset, 4, 3);
    ctx.fillRect(px + 16, py + 13 - armOffset, 4, 3);

    const legOffset = [[0, 7], [3, 4], [0, 7], [-3, 4]][frame];
    ctx.fillStyle = pants;
    ctx.fillRect(px + 8, py + 22 + legOffset[0], 4, 9);
    ctx.fillRect(px + 12, py + 22 + legOffset[1], 4, 9);
    ctx.fillStyle = shoes;
    ctx.fillRect(px + 7, py + 29 + legOffset[0], 5, 3);
    ctx.fillRect(px + 11, py + 29 + legOffset[1], 5, 3);
    ctx.fillStyle = '#444';
    ctx.fillRect(px + 2, py + 13, 4, 7);
  } else if (playerState === 'idle') {
    const bob = frame === 0 ? 0 : 1;
    ctx.fillStyle = hair;
    ctx.fillRect(px + 7, py - bob, 10, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(px + 7, py + 2 - bob, 10, 9);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 13, py + 5 - bob, 2, 2);
    ctx.fillStyle = shirt;
    ctx.fillRect(px + 8, py + 11, 8, 11);
    ctx.fillStyle = pants;
    ctx.fillRect(px + 8, py + 22, 8, 10);
    ctx.fillStyle = skin;
    ctx.fillRect(px + 4, py + 14, 4, 3);
    ctx.fillRect(px + 16, py + 14, 4, 3);
    ctx.fillStyle = pants;
    ctx.fillRect(px + 8, py + 22, 4, 10);
    ctx.fillRect(px + 12, py + 22, 4, 10);
    ctx.fillStyle = shoes;
    ctx.fillRect(px + 7, py + 30, 5, 3);
    ctx.fillRect(px + 11, py + 30, 5, 3);
    ctx.fillStyle = '#444';
    ctx.fillRect(px + 2, py + 13, 4, 7);
  } else if (playerState === 'tired') {
    const bob = frame === 0 ? 0 : 1;
    ctx.fillStyle = hair;
    ctx.fillRect(px + 6, py + 2 - bob, 10, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(px + 6, py + 4 - bob, 10, 9);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 11, py + 7 - bob, 2, 2);
    ctx.fillStyle = shirt;
    ctx.fillRect(px + 7, py + 13, 10, 10);
    ctx.fillStyle = pants;
    ctx.fillRect(px + 7, py + 23, 8, 10);
    ctx.fillStyle = skin;
    ctx.fillRect(px + 3, py + 16, 4, 3);
    ctx.fillRect(px + 15, py + 16, 4, 3);
    ctx.fillStyle = pants;
    ctx.fillRect(px + 7, py + 23, 4, 10);
    ctx.fillRect(px + 11, py + 23, 4, 10);
    ctx.fillStyle = shoes;
    ctx.fillRect(px + 6, py + 31, 5, 3);
    ctx.fillRect(px + 10, py + 31, 5, 3);
    ctx.fillStyle = '#f5c842';
    ctx.font = '9px serif';
    ctx.fillText('💫', px + 17, py + 6);
  } else if (playerState === 'victory') {
    ctx.fillStyle = hair;
    ctx.fillRect(px + 7, py, 10, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(px + 7, py + 2, 10, 9);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 13, py + 5, 2, 2);
    ctx.fillStyle = shirt;
    ctx.fillRect(px + 8, py + 11, 8, 11);
    ctx.fillStyle = pants;
    ctx.fillRect(px + 8, py + 22, 8, 10);

    const armUp = frame === 0 ? -9 : -7;
    ctx.fillStyle = skin;
    ctx.fillRect(px + 2, py + armUp, 4, 3);
    ctx.fillRect(px + 18, py + armUp, 4, 3);
    ctx.fillStyle = pants;
    ctx.fillRect(px + 8, py + 22, 4, 10);
    ctx.fillRect(px + 12, py + 22, 4, 10);
    ctx.fillStyle = shoes;
    ctx.fillRect(px + 7, py + 30, 5, 3);
    ctx.fillRect(px + 11, py + 30, 5, 3);
  }

  if (typeof accessory === 'function') {
    accessory(ctx, { px, py, frame, playerState, palette });
  }
}
