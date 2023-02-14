import { arraySame, largerThan } from "@/helpers";
import { continentFilter, names, coords, paths } from "@/mapdata";
import { describe, it, expect } from "vitest";
describe("map data", () => {
  it("gives all paths a corresponding continent code", () => {
    for (const code in paths) {
      expect(Object.keys(continentFilter)).toContain(code);
    }
  });
  it("has a name for all paths", () => {
    for (const code in paths) {
      expect(Object.keys(names)).toContain(code);
    }
  });
  it("has coords for all paths", () => {
    for (const code in paths) {
      expect(Object.keys(coords)).toContain(code);
    }
  });
});
describe("size detection", () => {
  it("can tell both sides are too small", () => {
    expect(
      largerThan(
        {
          y: 419.3,
          x: 593.1,
          x2: 594.1,
          y2: 420.7,
        },
        10
      )
    ).toBeFalsy();
  });

  it("can tell both sides are big enough", () => {
    expect(
      largerThan(
        {
          y: 246,
          x: 1216,
          x2: 1333,
          y2: 339,
        },
        10
      )
    ).toBeTruthy();
  });
  it("can tell one side is big enough", () => {
    expect(
      largerThan(
        {
          y: 246,
          x: 1216,
          x2: 1333,
          y2: 247,
        },
        10
      )
    ).toBeTruthy();
  });
});

describe("array same", () => {
  it("detects empty arrays", () => {
    const a = [] as string[];
    const b = [] as string[];
    expect(arraySame(a, b)).toBeTruthy();
  });
  it("detects identical arrays with one element", () => {
    const a = ["AB"] as string[];
    const b = ["AB"] as string[];
    expect(arraySame(a, b)).toBeTruthy();
  });
  it("detects different arrays with one element", () => {
    const a = ["CC"] as string[];
    const b = ["AB"] as string[];
    expect(arraySame(a, b)).toBeFalsy();
  });
  it("detects different arrays with two elements", () => {
    const a = ["AB", "CC"] as string[];
    const b = ["AB", "DD"] as string[];
    expect(arraySame(a, b)).toBeFalsy();
  });
  it("detects arrays with different lengths", () => {
    const a = ["AB"] as string[];
    const b = ["AB", "DD"] as string[];
    expect(arraySame(a, b)).toBeFalsy();
  });
  it("detects arrays with two elements", () => {
    const a = ["AB", "DD"] as string[];
    const b = ["AB", "DD"] as string[];
    expect(arraySame(a, b)).toBeTruthy();
  });
  it("detects arrays with two elements in different orders", () => {
    const a = ["AB", "DD"] as string[];
    const b = ["DD", "AB"] as string[];
    expect(arraySame(a, b)).toBeTruthy();
  });
});
