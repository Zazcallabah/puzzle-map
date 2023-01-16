import type { Coord } from "./mapdata";
import type { Vec } from "./vec";

export type Color = Vec;

export type Piece = {
  id: string;
  path: string;
  color: Color;
  name: string;
  coord: Coord;
};

export type Group = {
  id: string;
  pieces: Piece[];
  offX: number;
  offY: number;
  dragging: boolean;
};
