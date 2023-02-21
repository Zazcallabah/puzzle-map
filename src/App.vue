<script setup lang="ts">
import { computed, ref } from "vue";
import MapContainer from "./components/MapContainer.vue";
import AllPaths from "./components/AllPaths.vue";
import { arraySame } from "./helpers";
const urlParams = new URLSearchParams(window.location.search);

const continentData = [
  { code: "AF", name: "Africa" },
  { code: "AS", name: "Asia" },
  { code: "EU", name: "Europe" },
  { code: "ME", name: "Middle East" },
  { code: "NA", name: "North America" },
  { code: "OC", name: "Oceania" },
  { code: "SA", name: "South America" },
];
const validContinents = continentData.map((c) => c.code);
const filteredContinents = (urlParams.getAll("continent") ?? []).filter((c) =>
  validContinents.includes(c)
);
const minSize = parseInt(urlParams.get("size") ?? "1");
const scale = ref(parseInt(urlParams.get("scale") ?? "1"));
const go = () => {
  const cc = continentSelection.value.map((c) => `continent=${c}`).join("&");
  window.location.search = `?scale=${scale.value}&size=${sizeSelection.value}&${cc}`;
};

const largest = ref(0);
const total = ref(0);

const cango = computed(() => {
  return (
    minSize !== sizeSelection.value ||
    !arraySame(continentSelection.value, filteredContinents)
  );
});
const continentSelection = ref(
  filteredContinents.length == 0 ? validContinents.slice(0) : filteredContinents
);
const sizeSelection = ref(minSize);
const cChange = () => {
  if (continentSelection.value.length == 0) {
    continentSelection.value = validContinents.slice(0);
  }
};
const updateLargest = (l: number, t: number) => {
  largest.value = l;
  total.value = t;
};
</script>

<template>
  <header>
    <label v-for="data in continentData" :for="data.code" :key="data.code">
      <input
        type="checkbox"
        :id="data.code"
        :value="data.code"
        @change="cChange"
        v-model="continentSelection"
      />
      {{ data.name }}<br />
    </label>

    <label>
      <input type="range" min="1" max="100" v-model="sizeSelection" />
      Minimum size {{ sizeSelection }}
    </label>
    <br />
    <button :disabled="!cango" @click="go">Go</button>
    <hr />
    <label>
      Scale
      <input type="range" min="1" max="3" step="0.01" v-model="scale" />
    </label>
    Largest group: {{ largest }} / {{ total }}
  </header>
  <main>
    <MapContainer
      :continents="filteredContinents"
      :sizeFilter="minSize"
      :scale="scale"
      :onLargestGroup="updateLargest"
    />
    <!-- <AllPaths /> -->
  </main>
</template>

<style scoped>
input[type="range"] {
  width: 70vw;
}
hr {
  margin: 2em;
}
</style>
