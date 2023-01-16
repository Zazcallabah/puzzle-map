import { Vec } from "@/vec";
import { choose, rnd } from "./helpers";
import type { Piece, Color } from "./models";

export const rndcolor = (): Color => {
  const choiche = [rnd(200) + 55, rnd(200) + 55, rnd(200) + 55];
  const r = choose(choiche);
  const g = choose(choiche);
  const b = choiche[0];
  return new Vec([r, g, b]);
};

export const colorMerge = (pieces: Piece[], weight: number = 1) => {
  if (pieces.length <= 2) {
    return;
  }

  // from main pieces, pick the two pieces that are furthest apart in color space
  let high1 = 0;
  let high2 = 1;
  let highdist = 0;
  for (let i1 = 0; i1 < pieces.length - 1; i1++) {
    for (let i2 = i1 + 1; i2 < pieces.length; i2++) {
      const p1 = pieces[i1];
      const p2 = pieces[i2];
      const delta = distance(p1.color, p2.color);
      if (delta > highdist) {
        highdist = delta;
        high1 = i1;
        high2 = i2;
      }
    }
  }

  // find vector from one to the other in color space
  const startColor = pieces[high1];
  const endColor = pieces[high2];
  const mainColorPath = endColor.color.sub(startColor.color); // this vector is the line within color space where we want all colors to eventually end up

  // project all other pieces color onto this vector (percentage?)
  for (let ix = 0; ix < pieces.length; ix++) {
    if (ix != high1 && ix != high2) {
      const transformedColor = pieces[ix].color.sub(startColor.color); // the vector from startColor to our current color
      const projectedF = transformedColor.dot(mainColorPath.unit()); // how far along colorVector will that project?
      const projected = mainColorPath.unit().mul(projectedF); // scale maincolorpath accordingly

      const traverseVector = projected.sub(transformedColor); // find path from original color to target on colorVector
      const scaledTraverse = traverseVector.mul(weight);
      pieces[ix].color = pieces[ix].color.add(scaledTraverse);
    }
  }
};

//mergeColors(main.pieces);

// const c1 = blendRgb(main.pieces.map((p) => p.color));
// const c2 = blendRgb(inc.pieces.map((p) => p.color));
// if (inc.pieces.length > 1) {
//   main.pieces.forEach((p) => {
//     p.color = blendRgb([p.color, c2]);
//   });
// }
// if (main.pieces.length > 1) {
//   inc.pieces.forEach((p) => {
//     p.color = blendRgb([p.color, c1]);
//   });
// }
const distance = (a: Color, b: Color) => {
  const diff = a.sub(b); // vector from b to a
  return diff.mag(); //return abs(diff) squared (we are only interested in relative magnitude, so can do away with the sqrt()
};
