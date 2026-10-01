import fs from 'node:fs';
import {PNG} from 'pngjs';

export function assertVisiblePng(filePath, minVisiblePixels = 32) {
  if (!fs.existsSync(filePath)) throw new Error(`${filePath} was not rendered.`);
  let png;
  try {
    png = PNG.sync.read(fs.readFileSync(filePath));
  } catch (error) {
    throw new Error(`${filePath} is not a decodable PNG: ${error.message}`);
  }
  if (png.width < 1 || png.height < 1) throw new Error(`${filePath} has invalid dimensions.`);
  let visiblePixels = 0;
  for (let i = 3; i < png.data.length; i += 4) if (png.data[i] > 0) visiblePixels += 1;
  if (visiblePixels < minVisiblePixels) {
    throw new Error(`${filePath} has ${visiblePixels} visible pixels; expected at least ${minVisiblePixels}.`);
  }
  return {width: png.width, height: png.height, visiblePixels};
}
