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
    .start-buttons.q-ma-sm
      q-btn(
        :disable="advancedMode && !bars.length"
        :color="isActive ? 'negative' : isPaused ? 'negative' :'primary'"
        :label="isActive ? 'stop' : isPaused ? 'stop' : 'start'"
        @click="isActive ? stop(): isPaused ? stop() : start()"
      )
      q-btn.q-ml-sm(
        v-if="advancedMode"
        :disable="!isActive && !isPaused || advancedMode && !bars.length"
        :color="isActive ? 'warning' :'primary'"
        :label="isActive ? 'pause' : 'resume'"
        @click="isActive ? handlePause(): handleResume()"
      )
    q-btn(
      color="secondary"
      label="tap tempo"
      @click="tapTempo"
    )
    q-toggle(
      v-model="isAccent"
      label="Accent"
    )
    q-toggle(
      @update:model-value="toggleMode"
      v-model="advancedMode"
      label="Advanced Mode"
    )

    .column.items-center
      .q-gutter-sm(v-if="!advancedMode")
        q-radio(v-model="timeSignature.topNumber" :val="4" label="4")
        q-radio(v-model="timeSignature.topNumber" :val="8" label="8")
        q-radio(v-model="timeSignature.topNumber" :val="16" label="16")
      .q-gutter-sm(v-if="!advancedMode")
        q-radio(
          v-model="timeSignature.bottomNumber"
          :val="size"
          :label="size"
          v-for="(size, index) in timeSignature.topNumber"
          :key="index"
        )
      .q-pa-md.column.items-center(v-if="advancedMode")
        .q-pa-md.flex.items-center
          q-select.q-mr-md(
            :disable="isActive"
            dense
            v-model="timeSignature.bottomNumber"
            :options="[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]"
            behavior="menu"
          )
          q-select.q-mr-md(
            :disable="isActive"
            dense
            v-model="timeSignature.topNumber"
            :options="[4, 8, 16, 32]"
            color="primary"
            behavior="menu"
          )
          q-btn(
            :disable="isActive"
            round
            color="primary"
            size="10px"
            label="+"
            style="height: 10px"
            @click="addBar"
          )
        .q-px-lg.flex.items-center.justify-between(style="width: 190px")
          q-btn(
            :disable="isActive"
            round
            color="primary"
            size="10px"
            label="-"
            style="height: 10px"
            @click="timeSignature.repeat > 1 && timeSignature.repeat--"
          )
          span {{ timeSignature.repeat }}
          q-btn(
            :disable="isActive"
            round
            color="primary"
            size="10px"
            label="+"
            style="height: 10px"
            @click="timeSignature.repeat++"
          )
        .q-pa-lg.flex.items-center(v-if="bars.length")
          .row.items-center(v-for="(bar, index) in bars" :key="bar.id")
            .bar-wrapper.column.items-center
              .bar-info.column.items-center.q-px-
                .q-pa-md.column.items-center
                  .bar-size.flex.items-center
                    q-select.q-mr-md(
                      :disable="isActive"
                      v-model="bar.bottomNumber"
                      :options="[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]"
                      behavior="menu"
                      dense
                    )
                    q-select(
                      :disable="isActive"
                      v-model="bar.topNumber"
                      :options="[4, 8, 16, 32]"
                      color="primary"
                      behavior="menu"
                      dense
                    )
                  .bar-times.flex.items-center
                    q-input(
                      :disable="isActive"
                      v-model="bar.repeat"
                      type="number"
                      :min="1"
                      :max="99"
                      dense
                      style="width: 100%"
                      )
                      template(v-slot:before)
                        q-icon(name="close" size="sm")
              q-btn(
                :disable="isActive"
                outline
                round
                size="8px"
                style="width:8px"
                dense
                color="primary"
                label="x"
                @click="removeBar(index)"
              )
            q-btn(
              :disable="isActive"
              v-if="index+1 < bars.length"
              flat
              round
              color="primary"
              icon="compare_arrows"
              @click="[bars[index], bars[index+1]] = [bars[index+1], bars[index]]"
            )
        q-toggle(
          v-model="isLooped"
          label="Loop"
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

interface TimeSignature {
  id: number;
  topNumber: number;
  bottomNumber: number;
  repeat: number;
}

const onSoundLow = useSound(low, { volume: 0.25 });
const onSoundHigh = useSound(high, { volume: 0.25 });

const beatCounter = ref('- -');
const timeSignature: TimeSignature = reactive({
  id: 0,
  topNumber: 4,
  bottomNumber: 4,
  repeat: 1,
});

const currentBeat = ref<number>(0);
const currentTempo = ref<number>(60);
const minTempo = ref<number>(30);
const maxTempo = ref<number>(240);
const isAccent = ref<boolean>(true);
const currentSound = ref<string>('marimba');
const advancedMode = ref<boolean>(false);
const bars = ref<TimeSignature[] | []>([]);
const currentBar = ref<number>(0);
const currentBarRepeats = ref<number>(0);
const isLooped = ref<boolean>(true);
const isPaused = ref<boolean>(false);

const interval = computed(() =>
  Math.round((60000 / currentTempo.value / timeSignature.topNumber) * 4)
);

const { pause, resume, isActive } = useIntervalFn(() => {
  // const nextBeat = currentBeat.value + 1;
  if (currentBeat.value > timeSignature.bottomNumber - 1) {
    isAccent.value ? onSoundHigh.play() : onSoundLow.play();
    beatCounter.value = '1';
    currentBeat.value = 1;
    advancedMode.value && ifAdvanceMode();
  } else {
    currentBeat.value = currentBeat.value + 1;
    beatCounter.value = String(currentBeat.value);
    onSoundLow.play();
  }
}, interval);

const ifAdvanceMode = () => {
  if (bars.value.length > 1) {
    if (currentBar.value + 1 < bars.value.length) {
      ifRepeats(false);
      timeSignature.topNumber = bars.value[currentBar.value].topNumber;
      timeSignature.bottomNumber = bars.value[currentBar.value].bottomNumber;
      timeSignature.repeat = bars.value[currentBar.value].repeat;
    } else {
      ifRepeats(true);
      timeSignature.topNumber = bars.value[currentBar.value].topNumber;
      timeSignature.bottomNumber = bars.value[currentBar.value].bottomNumber;
      timeSignature.repeat = bars.value[currentBar.value].repeat;
    }
  } else {
    ifRepeats(true);
  }
  isLooped.value && start();
};

const ifRepeats = (condition: boolean) => {
  const repeats = bars.value[currentBar.value].repeat;
  const nextRepeats = currentBarRepeats.value + 1;
  if (repeats <= nextRepeats) {
    condition
      ? stop()
      : ((currentBar.value = currentBar.value + 1),
        (currentBarRepeats.value = 0));
  } else {
    currentBarRepeats.value++;
  }
};

const start = () => {
  isPaused.value = false;

  if (advancedMode.value) {
    timeSignature.topNumber = bars.value[currentBar.value].topNumber;
    timeSignature.bottomNumber = bars.value[currentBar.value].bottomNumber;
  }

  isAccent.value ? onSoundHigh.play() : onSoundLow.play();
  currentBeat.value = 1;
  beatCounter.value = String(currentBeat.value);
  resume();
};

const stop = () => {
  currentBeat.value = 0;
  beatCounter.value = '- -';
  currentBar.value = 0;
  currentBarRepeats.value = 0;
  isPaused.value = false;
  pause();
};

const tapTempo = () => {
  currentTempo.value = Math.floor(Math.random() * (240 - 30 + 1)) + 30;
};
const toggleMode = () => {
  isActive && stop();
  timeSignature.topNumber = 4;
  timeSignature.bottomNumber = 4;
};

const addBar = () => {
  const timeSignatureCopy = Object.assign({}, timeSignature);
  if (!bars.value.length) {
    bars.value = [timeSignatureCopy];
  } else {
    timeSignatureCopy.id = bars.value.length;
    bars.value = [...bars.value, timeSignatureCopy];
  }
  //???
  timeSignature.topNumber = 4;
  timeSignature.bottomNumber = 4;
  timeSignature.repeat = 1;
};

const removeBar = (index: number) => {
  bars.value.splice(index, 1);
};

const handlePause = () => {
  isPaused.value = true;
  pause();
};

const handleResume = () => {
  isPaused.value = false;
  resume();
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
