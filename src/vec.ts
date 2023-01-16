export class Vec {
  private data: number[];
  private _mag: number | undefined;
  private _abs: number | undefined;

  constructor(data: number[]) {
    this.data = data;
  }

  x = () => {
    return this.data[0];
  };
  y = () => {
    return this.data[1];
  };
  z = () => {
    return this.data[2];
  };

  add = (v: Vec) => {
    return new Vec([
      this.data[0] + v.data[0],
      this.data[1] + v.data[1],
      this.data[2] + v.data[2],
    ]);
  };
  sub = (v: Vec) => {
    return new Vec([
      this.data[0] - v.data[0],
      this.data[1] - v.data[1],
      this.data[2] - v.data[2],
    ]);
  };
  mul = (scal: number) => {
    return new Vec([
      scal * this.data[0],
      scal * this.data[1],
      scal * this.data[2],
    ]);
  };

  cross = (v: Vec) => {
    return new Vec([
      this.data[1] * v.data[2] - this.data[2] * v.data[1],
      this.data[2] * v.data[0] - this.data[0] * v.data[2],
      this.data[0] * v.data[1] - this.data[1] * v.data[0],
    ]);
  };
  dot = (v: Vec) => {
    return (
      this.data[0] * v.data[0] +
      this.data[1] * v.data[1] +
      this.data[2] * v.data[2]
    );
  };

  mag = () => {
    if (this._mag === undefined) {
      this._mag =
        this.data[0] * this.data[0] +
        this.data[1] * this.data[1] +
        this.data[2] * this.data[2];
    }
    return this._mag;
  };
  abs = () => {
    if (this._abs === undefined) {
      this._abs = Math.sqrt(this.mag());
    }
    return this._abs;
  };

  unit = () => {
    return this.mul(1 / this.abs());
  };

  angle = (other: Vec) => {
    const t =
      this.data[0] * other.x() +
      this.data[1] * other.y() +
      this.data[2] * other.z();
    const n = this.abs() * other.abs();
    return Math.acos(t / n);
  };

  rotate = (theta: number, around: Vec) => {
    // this is basically the extracted arithmetic of multiplying a series of rotational matrixes with vector ve
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const u = around.x();
    const v = around.y();
    const w = around.z();
    const x = this.data[0];
    const y = this.data[1];
    const z = this.data[2];
    const rx =
      u * (u * x + v * y + w * z) * (1 - cos) +
      x * cos +
      (-1 * w * y + v * z) * sin;
    const ry =
      v * (u * x + v * y + w * z) * (1 - cos) + y * cos + (w * x - u * z) * sin;
    const rz =
      w * (u * x + v * y + w * z) * (1 - cos) +
      z * cos +
      (-1 * v * x + u * y) * sin;
    return new Vec([rx, ry, rz]);
  };

  clone = () => {
    return new Vec([this.data[0], this.data[1], this.data[2]]);
  };
  toString = () => {
    return `[${this.x()}, ${this.y()}, ${this.z()}]`;
  };
}
