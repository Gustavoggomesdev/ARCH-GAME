export function drawCadeirante(ctx, options) {
  const { px, py, frame, playerState } = options;
  const bob = playerState === 'run' ? 0 : frame === 0 ? 0 : 1;

  ctx.fillStyle = '#3d2200';
  ctx.fillRect(px + 8, py + 2 - bob, 8, 3);
  ctx.fillStyle = '#e8b87a';
  ctx.fillRect(px + 8, py + 5 - bob, 8, 8);
  ctx.fillStyle = '#111';
  ctx.fillRect(px + 13, py + 8 - bob, 2, 2);

  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(px + 8, py + 14, 10, 8);
  ctx.fillStyle = '#3949ab';
  ctx.fillRect(px + 9, py + 22, 8, 7);

  ctx.fillStyle = '#7e7e7e';
  ctx.fillRect(px + 6, py + 23, 14, 2);
  ctx.fillRect(px + 18, py + 16, 2, 10);

  const wheelSpin = playerState === 'run' ? (frame % 4) : 0;
  ctx.fillStyle = '#1f1f1f';
  ctx.beginPath();
  ctx.arc(px + 21, py + 30, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8f8f8f';
  ctx.beginPath();
  ctx.arc(px + 21, py + 30, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#bdbdbd';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const angle = (wheelSpin + i) * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(px + 21, py + 30);
    ctx.lineTo(px + 21 + Math.cos(angle) * 4, py + 30 + Math.sin(angle) * 4);
    ctx.stroke();
  }

  ctx.fillStyle = '#1f1f1f';
  ctx.beginPath();
  ctx.arc(px + 7, py + 31, 3, 0, Math.PI * 2);
  ctx.fill();

  if (playerState === 'tired') {
    ctx.fillStyle = '#f5c842';
    ctx.font = '9px serif';
    ctx.fillText('💫', px + 17, py + 6);
  }
}
