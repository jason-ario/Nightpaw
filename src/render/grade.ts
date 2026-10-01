// The game's colour grade (2.4): pulls saturation down and adds a little contrast, so painted
// toys and lamplight read as old and worn instead of bright and new. WebGL only; the canvas
// renderer simply skips it.
export function grade(cam: any, strength = 1) {
  const fx = cam?.postFX;
  if (!fx || cam.__graded) return;
  cam.__graded = true;
  const cm = fx.addColorMatrix();
  cm.saturate(-0.32 * strength);
  cm.contrast(0.1 * strength, true);
  cm.brightness(1 - 0.05 * strength, true);
}
