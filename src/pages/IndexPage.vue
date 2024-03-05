<template lang="pug">
q-page.row.items-center.justify-center
  .metronom-wrapper.column.items-center
    span {{ beatCounter }}
    .beat-dots.row
      div.beat-dots__item(
        v-for="(dot, index) in timeSignature.bottomNumber" 
        :key="index" 
        :class="index+1 === currentBeat && isActive ? 'active' : ''"
        )
    .tempo-wrapper.text-center
      .tempo-controller.flex.no-wrap.items-center
        q-btn.tempo-btn__plus(
          push 
          color="primary" 
          round @click="currentTempo > minTempo && currentTempo--"
        ) -
        q-slider.tempo-input(
          v-model="currentTempo" 
          :min="minTempo" 
          :max="maxTempo" 
          color="green" 
          selection-color="transparent" 
          track-size="15px" 
          thumb-size="30px"
          )
        q-btn.tempo-btn__minus(
          push color="primary" 
          round 
          @click="currentTempo < maxTempo && currentTempo++"
        ) +
      span.tempo-counter {{ currentTempo }} BPM
    q-btn(
      color="primary" 
      :label="isActive ? 'STOP' : 'START'"
      @click="isActive ? stop(): start()"
    )
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';

import { computed, onMounted, ref } from 'vue';
const interval = computed(() => Math.round(60000 / currentTempo.value));
const beatCounter = ref('- -');
const timeSignature = ref({
  topNumber: 4,
  bottomNumber: 4,
});
const currentBeat = ref(0);
const minTempo = ref(0);
const maxTempo = ref(300);
const currentTempo = ref(60);

const { pause, resume, isActive } = useIntervalFn(() => {
  if (currentBeat.value > timeSignature.value.bottomNumber - 1) {
    beatCounter.value = '0';
    currentBeat.value = 0;
  }
  currentBeat.value = currentBeat.value + 1;
  beatCounter.value = String(currentBeat.value);
}, interval);

const start = () => {
  currentBeat.value = 1;
  beatCounter.value = String(currentBeat.value);
  resume();
};

const stop = () => {
  currentBeat.value = 0;
  beatCounter.value = '- -';
  pause();
};

onMounted(() => {
  pause();
});
</script>

<style lang="scss">
.beat-dots {
  gap: 25px;
}

.beat-dots__item {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background: rgb(205, 204, 204);
  overflow: hidden;

  &.active {
    background: rgb(30, 150, 58);
  }
}

.tempo-input {
  width: 500px;
  margin-inline: 20px;
}
</style>
