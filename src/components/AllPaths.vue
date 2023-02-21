<script setup lang="ts">
import { paths, names, coords, shades, continentFilter } from "@/mapdata";
import type { Group, Piece } from "@/models";
import { onMounted, ref, toRefs } from "vue";
import { hex } from "@/helpers";
import { rndcolor } from "@/colorMerge";

function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const randomizer = mulberry32(10);

const groups = ref<Group[]>([]);
const current = ref("");

const smallfilter = [
  "BL",
  "BM",
  "BN",
  "WS",
  "RE",
  "GU",
  "GS",
  "GP",
  "BH",
  "GD",
  "GM",
  "HK",
  "KN",
  "AI",
  "KY",
  "MF",
  "MC",
  "MT",
  "MV",
  "MQ",
  "MP",
  "MS",
  "BB",
  "FO",
  "NR",
  "CY",
  "CW",
  "CV",
  "SX",
  "KM",
  "ST",
  "SG",
  "DM",
  "VG",
  "YT",
  "LC",
  "TV",
  "TT",
  "LI",
  "LU",
  "TC",
  "VC",
  "AD",
  "AG",
  "VI",
  "AS",
  "AW",
  "IC",
];
onMounted(() => {
  let ix = 1;
  groups.value = Object.keys(paths)
    .filter((c) => smallfilter.includes(c))
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
            shade,
            coord,
          } as Piece,
        ],
        offX: -1 * coord.x + Math.floor(randomizer() * 500),
        offY: -1 * coord.y + Math.floor(randomizer() * 500),
        dragging: false,
        size: Math.abs(coord.x2 - coord.x) * Math.abs(coord.y2 - coord.y),
      } as Group;
    });
  groups.value.sort((a: any, b: any) => {
    return b.size - a.size;
  });
});
const dragstart = (e: MouseEvent) => {
  const target = e.currentTarget as any;
  const code = target.id as string;
  current.value = target.firstElementChild.dataset.key;
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
};
const dragend = () => {
  const typedGroupList = groups.value as Group[]; // typescript got confused about the typing, cast to force no errors
  const dragged = typedGroupList.filter((g) => g.dragging) as Group[];
  for (const g of dragged) {
    //   g.pieces = [];
    g.dragging = false;
  }
  current.value = "";
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
  {{ current }}<br />
  <div>
    <svg
      :width="2000"
      :height="2000"
      view-box="0 0 5000 5000"
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
        <g v-for="p in g.pieces" :key="p.id" :data-key="p.id">
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
