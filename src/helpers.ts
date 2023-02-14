import type { Coord } from "./mapdata";

export const rnd = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const hex = (n: number) => {
  const nn = Math.floor(n).toString(16);
  return nn.length == 1 ? "0" + nn : nn;
};

export const choose = (a: number[]): number => {
  return a.splice(Math.floor(Math.random() * a.length), 1)[0];
};

export const arraySame = (a: Array<any>, b: Array<any>) => {
  if (a.length !== b.length) {
    return false;
  }
  if (a.some((s) => !b.includes(s))) {
    return false;
  }
  return true;
};

export const largerThan = (area: Coord, size: number): boolean => {
  const dx = Math.abs(area.x2 - area.x);
  const dy = Math.abs(area.y2 - area.y);

  return dx > size || dy > size;
};
