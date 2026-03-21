import { DEFAULT_CHARACTER } from '../data/events.js';
import { drawTrabalhador } from './trabalhador.js';
import { drawCadeirante } from './cadeirante.js';
import { drawDefVisual } from './def_visual.js';
import { drawMaeSolo } from './mae_solo.js';

const CHARACTER_RENDERERS = {
  trabalhador: drawTrabalhador,
  cadeirante: drawCadeirante,
  def_visual: drawDefVisual,
  mae_solo: drawMaeSolo,
};

export function drawCharacterSprite(characterId, ctx, options) {
  const drawFn = CHARACTER_RENDERERS[characterId] || CHARACTER_RENDERERS[DEFAULT_CHARACTER] || drawTrabalhador;
  drawFn(ctx, options);
}
