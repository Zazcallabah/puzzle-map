<script setup lang="ts">
import { paths, names, coords } from "@/mapdata";
import type { Coord } from "@/mapdata";
import { onMounted, ref } from "vue";
type Color = {
  r: number;
  g: number;
  b: number;
};
type Piece = {
  id: string;
  path: string;
  color: Color;
  name: string;
  coord: Coord;
};

type Group = {
  id: string;
  pieces: Piece[];
  offX: number;
  offY: number;
  dragging: boolean;
};

const groups = ref<Group[]>([]);
onMounted(() => {
  let ix = 1;
  groups.value = Object.keys(paths).map((c) => {
    const coord = coords[c];
    return {
      id: (ix++).toString(),
      pieces: [
        {
          id: c,
          name: names[c],
          color: rndcolor(),
          path: paths[c],
          coord,
        },
      ],
      offX: -1 * coord.x,
      offY: -1 * coord.y, // + Math.floor(Math.random() * 500)
      dragging: false,
    } as Group;
  });
});

const areClose = (g1: Group, g2: Group) => {
  if (g1.id === g2.id) return false;
  const dx = Math.abs(g1.offX - g2.offX);
  const dy = Math.abs(g1.offY - g2.offY);
  return dx < 10 && dy < 10;
};
const merge = (main: Group, inc: Group) => {
  const c1 = blendRgb(main.pieces.map((p) => p.color));
  const c2 = blendRgb(inc.pieces.map((p) => p.color));
  if (inc.pieces.length > 1) {
    main.pieces.forEach((p) => {
      p.color = blendRgb([p.color, c2]);
    });
  }
  if (main.pieces.length > 1) {
    inc.pieces.forEach((p) => {
      p.color = blendRgb([p.color, c1]);
    });
  }
  inc.pieces.forEach((p) => {
    main.pieces.push(p);
  });
};
const blendRgb = (colors: Color[]): Color => {
  return {
    r: blend(colors.map((c) => c.r)),
    g: blend(colors.map((c) => c.g)),
    b: blend(colors.map((c) => c.b)),
  };
};
const blend = (c: number[]) => {
  const sum = c.reduce((ack, n) => ack + n, 0);
  return Math.floor(sum / c.length);
};

const rnd = (max: number) => {
  return Math.floor(Math.random() * max);
};

const hex = (n: number) => {
  const nn = n.toString(16);
  return nn.length == 1 ? "0" + nn : nn;
};

const choose = (a: number[]): number => {
  return a.splice(Math.floor(Math.random() * a.length), 1)[0];
};
const getGroup = (code: string | undefined) => {
  return groups.value.filter((g) => g.id === code)[0];
};
const rndcolor = () => {
  const choiche = [255, rnd(255), rnd(255)];
  const r = choose(choiche);
  const g = choose(choiche);
  const b = choiche[0];
  return { r, g, b };
};
const dragstart = (e: MouseEvent) => {
  const g = getGroup((e.currentTarget as any).id);
  g.dragging = true;
};
const dragend = () => {
  const dragged = groups.value.filter((g) => g.dragging);
  if (dragged.length > 1) {
    console.error("bad dragend");
  }
  for (const g of dragged) {
    const merges = groups.value.filter((g2) => areClose(g, g2));
    const mergedIds = merges.map((m) => m.id);
    merges.forEach((m) => {
      merge(g, m);
    });
    groups.value = groups.value.filter((g2) => !mergedIds.includes(g2.id));
    g.dragging = false;
  }
};
const drag = (e: MouseEvent) => {
  groups.value
    .filter((g) => g.dragging)
    .forEach((g) => {
      g.offX += e.movementX;
      g.offY += e.movementY;
    });
};
// const setCurrent = (e: MouseEvent) => {};
// const clearCurrent = (e: MouseEvent) => {};
</script>

<template>
  <div>
    <svg
      width="2000"
      height="2000"
      xmlns="http://www.w3.org/2000/svg"
      @mouseup="dragend"
      @mousemove="drag"
    >
      <g
        v-for="g in groups"
        :key="g.id"
        :id="g.id"
        @mousedown="dragstart"
        :transform="`translate(${g.offX},${g.offY})`"
      >
        <g v-for="p in g.pieces" :key="p.id">
          <path
            :d="p.path"
            :stroke="g.dragging ? 'white' : 'black'"
            :fill="`#${hex(p.color.r)}${hex(p.color.g)}${hex(p.color.b)}`"
            :id="p.id"
          />
        </g>
      </g>
    </svg>
  </div>
  <!-- @mouseenter="setCurrent"
            @mouseleave="clearCurrent" -->
  <!--
            <text
            style="fill: white; background-color: black"
            :x="(p.coord.x2 + p.coord.x) / 2"
            :y="(p.coord.y + p.coord.y2) / 2"
          >
            {{ p.name }}
          </text>
        -->
</template>
