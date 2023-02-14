<script setup lang="ts">
import { computed, ref } from "vue";
import MapContainer from "./components/MapContainer.vue";
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
      <input type="range" min="1" max="4" step="0.1" v-model="scale" />
    </label>
  </header>
  <main>
    <MapContainer
      :continents="filteredContinents"
      :sizeFilter="minSize"
      :scale="scale"
    />
  </main>
</template>

<style scoped>
hr {
  margin: 2em;
}
</style>
