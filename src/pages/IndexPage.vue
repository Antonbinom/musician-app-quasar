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
      :label="isActive ? 'stop' : 'start'"
      @click="isActive ? stop(): start()"
    )
    q-btn(
      color="primary"
      label="tap tempo"
      @click="tapTempo"
    )
    <q-toggle v-model="isAccent" label="Accent" />
    .q-gutter-sm
      q-radio(v-model="timeSignature.topNumber" :val="1" label="4")
      q-radio(v-model="timeSignature.topNumber" :val="2" label="8")
      q-radio(v-model="timeSignature.topNumber" :val="4" label="16")
    .q-gutter-sm
      q-radio(
        v-model="timeSignature.bottomNumber"
        :val="size"
        :label="size"
        v-for="(size, index) in timeSignature.topNumber*4"
        :key="index"
      )
    .q-gutter-sm
      q-radio(v-model="currentSound" val="marimba" label="Marimba")
      q-radio(v-model="currentSound" val="conga" label="Conga")
      q-radio(v-model="currentSound" val="drum kit" label="Drum kit")
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useSound } from '@vueuse/sound';
import { useIntervalFn } from '@vueuse/core';
import high from '../assets/sounds/marimba_high.mp3';
import low from '../assets/sounds/marimba_low.mp3';

const onSoundLow = useSound(low, { volume: 0.25 });
const onSoundHigh = useSound(high, { volume: 0.25 });

const beatCounter = ref('- -');
const timeSignature = reactive({
  topNumber: 1,
  bottomNumber: 4,
});

const currentBeat = ref(0);
const currentTempo = ref(60);
const minTempo = ref(30);
const maxTempo = ref(300);
const isAccent = ref(true);
const currentSound = ref('marimba');

const interval = computed(() =>
  Math.round(60000 / currentTempo.value / timeSignature.topNumber)
);

const { pause, resume, isActive } = useIntervalFn(() => {
  if (currentBeat.value > timeSignature.bottomNumber - 1) {
    isAccent.value ? onSoundHigh.play() : onSoundLow.play();
    beatCounter.value = '1';
    currentBeat.value = 1;
  } else {
    currentBeat.value = currentBeat.value + 1;
    beatCounter.value = String(currentBeat.value);
    onSoundLow.play();
  }
}, interval);

const start = () => {
  isAccent.value ? onSoundHigh.play() : onSoundLow.play();
  currentBeat.value = 1;
  beatCounter.value = String(currentBeat.value);
  resume();
};

const stop = () => {
  currentBeat.value = 0;
  beatCounter.value = '- -';
  pause();
};

const tapTempo = () => {
  currentTempo.value = Math.floor(Math.random() * (300 - 30 + 1)) + 30;
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
