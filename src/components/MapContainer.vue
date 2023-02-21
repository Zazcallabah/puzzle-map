<script setup lang="ts">
import { paths, names, coords, continentFilter, shades } from "@/mapdata";
import type { Group, Piece } from "@/models";
import { onMounted, ref, toRefs } from "vue";
import { hex } from "@/helpers";
import { colorMerge, rndcolor } from "@/colorMerge";

const props = defineProps<{
  continents: string[];
  sizeFilter: number;
  scale: number;
}>();
const last = ref("");
const emit = defineEmits<{
  (e: "largestGroup", l: number, total: number): void;
}>();

const { scale } = toRefs(props);
const groups = ref<Group[]>([]);
let buffer = [] as Group[];

const addGroup = () => {
  if (buffer.length > 0) {
    const g = buffer.splice(0, 1);
    groups.value.push(g[0]);
  }
};

const closer = () => {
  groups.value
    .filter((g) => g.pieces.length === 1)
    .forEach((g) => {
      const px = g.pieces[0].coord.x;
      const py = g.pieces[0].coord.y;
      const dx = 500 - g.offX - px;
      const dy = 100 - g.offY - py;
      g.offX += dx * 0.1;
      g.offY += dy * 0.1;
    });
};

onMounted(() => {
  let ix = 1;
  buffer = Object.keys(paths)
    .filter(
      (p) =>
        props.continents.length === 0 ||
        props.continents.includes(continentFilter[p])
    )
    .map((c) => {
      const coord = coords[c];
      const shade = shades[c];
      return {
        id: (ix++).toString(),
        pieces: [
          {
            id: c,
            name: names[c],
            color: rndcolor(),
            path: paths[c],
            coord,
            shade,
          } as Piece,
        ],
        offX: -1 * coord.x + Math.floor(Math.random() * 1000),
        offY: -1 * coord.y + Math.floor(Math.random() * 1000),
        dragging: false,
        size: Math.abs(coord.x2 - coord.x) * Math.abs(coord.y2 - coord.y),
      } as Group;
    });
  buffer.sort((a: any, b: any) => {
    return b.size - a.size;
  });
  addGroup();
});

const defaultRange = 10;

const withinRange = (g1: Group, g2: Group, dist: number) => {
  const dx = Math.abs(g1.offX - g2.offX);
  const dy = Math.abs(g1.offY - g2.offY);
  return dx < dist && dy < dist;
};

const areCloseSingle = (g: Group, single: Group) => {
  const bigIslands = ["MG", "NZ", "CU", "JP", "PH", "IS", "GL"];
  if (bigIslands.includes(single.id)) {
    return withinRange(g, single, 50);
  }
  const midIslands = ["JM", "BS", "CV", "CY", "FK"];
  if (midIslands.includes(single.id)) {
    return withinRange(g, single, 30);
  }
  const p = single.pieces[0];
  const dx = Math.abs(p.coord.x2 - p.coord.x);
  const dy = Math.abs(p.coord.y2 - p.coord.y);
  const smallnation = dx < 10 && dy < 10;
  if (smallnation) {
    return withinRange(g, single, 80);
  } else {
    return withinRange(g, single, defaultRange);
  }
};

const areClose = (g1: Group, g2: Group) => {
  if (g1.id === g2.id) return false;
  if (g1.pieces.length === 1) {
    return areCloseSingle(g2, g1);
  }
  if (g2.pieces.length === 1) {
    return areCloseSingle(g1, g2);
  }
  return withinRange(g1, g2, defaultRange);
};

const merge = (main: Group, inc: Group) => {
  inc.pieces.forEach((p) => {
    main.pieces.push(p);
  });
  colorMerge(main.pieces, 0.5);
};

const dragstart = (e: MouseEvent) => {
  const code = (e.currentTarget as any).id as string;
  const ix = groups.value.findIndex((u) => u.id === code);
  if (ix === -1) {
    throw "Bad index";
  }
  if (ix > 0) {
    // move ix to top of group
    // this makes everything else paint over the drag -> easier to see
    const tmp = groups.value[0];
    groups.value[0] = groups.value[ix];
    groups.value[ix] = tmp;
  }

  groups.value[0].dragging = true;
  if (groups.value[0].pieces.length === 1) {
    last.value = groups.value[0].pieces[0].id;
  }
};
const dragend = () => {
  const typedGroupList = groups.value as Group[]; // typescript got confused about the typing, cast to force no errors
  const dragged = typedGroupList.filter((g) => g.dragging) as Group[];
  if (dragged.length > 1) {
    return;
  }
  let hasMerged = false;
  for (const g of dragged) {
    const merges = typedGroupList.filter((g2) => areClose(g, g2));
    const mergedIds = merges.map((m) => m.id);
    if (mergedIds.length > 0) {
      hasMerged = true;
    }
    merges.forEach((m) => {
      merge(g, m);
    });
    groups.value = typedGroupList.filter((g2) => !mergedIds.includes(g2.id));
    g.dragging = false;
  }

  let largest = 0;
  let total = 0;
  for (const g of typedGroupList) {
    total += g.pieces.length;
    if (g.pieces.length > largest) {
      largest = g.pieces.length;
    }
  }
  emit("largestGroup", largest, total);
  if (hasMerged || Math.random() > 0.9) addGroup();
};
const drag = (e: MouseEvent) => {
  groups.value
    .filter((g) => g.dragging)
    .forEach((g) => {
      g.offX += e.movementX / scale.value;
      g.offY += e.movementY / scale.value;
    });
};
// const setCurrent = (e: MouseEvent) => {};
// const clearCurrent = (e: MouseEvent) => {};
</script>

<template>
  {{ names[last] ?? "" }} {{ coords[last]?.x }} {{ coords[last]?.y }}
  <button @click="addGroup">More</button> <button @click="closer">Merge</button>
  <div>
    <svg
      :width="2000 * scale"
      :height="2000 * scale"
      view-box="0 0 5000 5000"
      xmlns="http://www.w3.org/2000/svg"
      @mouseup="dragend"
      @mousemove="drag"
      @mouseleave="dragend"
    >
      <g
        v-for="g in groups"
        :key="g.id"
        :id="g.id"
        @mousedown="dragstart"
        :transform="`translate(${g.offX * scale}, ${
          g.offY * scale
        }) scale(${scale})`"
      >
        <g v-for="p in g.pieces" :key="p.id">
          <path
            v-if="p.shade"
            :d="p.shade"
            stroke="black"
            :fill="`rgba(${p.color.x()},${p.color.y()},${p.color.z()},0.1)`"
          />
          <path
            :data-x="`${p.coord.x}-${p.coord.y}`"
            :d="p.path"
            :stroke="g.dragging ? 'white' : 'black'"
            :fill="`#${hex(p.color.x())}${hex(p.color.y())}${hex(p.color.z())}`"
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
