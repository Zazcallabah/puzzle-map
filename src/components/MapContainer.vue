<script setup lang="ts">
import { paths, names, coords, europe } from "@/mapdata";
import type { Group, Piece } from "@/models";
import { onMounted, ref } from "vue";
import { hex } from "@/helpers";
import { colorMerge, rndcolor } from "@/colorMerge";

const groups = ref<Group[]>([]);

onMounted(() => {
  let ix = 1;
  groups.value = Object.keys(paths)
    .filter((p) => europe.includes(p))
    .map((c) => {
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
          } as Piece,
        ],
        offX: -1 * coord.x + Math.floor(Math.random() * 500),
        offY: -1 * coord.y + Math.floor(Math.random() * 500),
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
  inc.pieces.forEach((p) => {
    main.pieces.push(p);
  });
  colorMerge(main.pieces, 0.5);
};

const getGroup = (code: string | undefined) => {
  return groups.value.filter((g) => g.id === code)[0];
};

const dragstart = (e: MouseEvent) => {
  const g = getGroup((e.currentTarget as any).id);
  g.dragging = true;
};
const dragend = () => {
  const typedGroupList = groups.value as Group[]; // typescript got confused about the typing, cast to force no errors
  const dragged = typedGroupList.filter((g) => g.dragging) as Group[];
  if (dragged.length > 1) {
    console.error("bad dragend");
  }
  for (const g of dragged) {
    const merges = typedGroupList.filter((g2) => areClose(g, g2));
    const mergedIds = merges.map((m) => m.id);
    merges.forEach((m) => {
      merge(g, m);
    });
    groups.value = typedGroupList.filter((g2) => !mergedIds.includes(g2.id));
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
