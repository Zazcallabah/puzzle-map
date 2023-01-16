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
