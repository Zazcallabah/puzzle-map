import { Vec } from "@/vec";
import { describe, it, expect } from "vitest";
import { colorMerge } from "../colorMerge";

describe("color merge", () => {
  it("does nothing when only two colors", () => {
    const b = { color: new Vec([0, 0, 0]) };
    const w = { color: new Vec([255, 255, 255]) };

    colorMerge([w, b] as any, 1);
  });
  it("it makes third color greyscale when base colors are pure black and white", () => {
    const b = { color: new Vec([0, 0, 0]) };
    const w = { color: new Vec([255, 255, 255]) };
    const r = { color: new Vec([255, 0, 0]) };

    colorMerge([w, b, r] as any, 1);

    expect(r.color.x()).toBe(r.color.y());
    expect(r.color.x()).toBe(r.color.z());
  });
  it("it mixes third color into base colors", () => {
    const a = { color: new Vec([150, 100, 0]) };
    const b = { color: new Vec([0, 200, 200]) };
    const mid = { color: new Vec([100, 100, 100]) };

    colorMerge([mid, b, a] as any, 1);
  });
});
