// All Figma frames in this project are designed at a fixed 402x874 canvas.
// Pixel coordinates from Figma convert to % so absolute layouts stay put
// when LetterboxViewport scales the frame up or down.
export const DESIGN_WIDTH = 402;
export const DESIGN_HEIGHT = 874;

export function xPct(x: number) {
  return `${(x / DESIGN_WIDTH) * 100}%`;
}

export function yPct(y: number) {
  return `${(y / DESIGN_HEIGHT) * 100}%`;
}
