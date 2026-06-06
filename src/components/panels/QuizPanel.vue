<script setup>
import { ref, computed, watch } from 'vue';
import { quizQuestions, localize } from '@/quiz.js';
import { highlight } from '@/highlight.js';
import { useI18n } from '@/composables/useI18n';

const props = defineProps({ cat: { type: String, default: 'all' } });
const emit = defineEmits(['goto']);
const { t, tf, locale } = useI18n();

const CATS = ['all', 'general', 'js', 'vue', 'swift', 'ruby', 'kotlin', 'git'];
// Pool synced to the app's active category ('general' has no questions → all).
const poolFor = (c) => (quizQuestions(c).length ? c : 'all');
const cat = ref(poolFor(props.cat));

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const questions = ref(shuffle(quizQuestions(cat.value)));
const idx = ref(0);
const picked = ref(null);
const score = ref(0);
const finished = ref(false);

const q = computed(() => questions.value[idx.value]);
const codeHtml = computed(() => (q.value ? highlight(q.value.code, q.value.lang) : ''));
const L = (v) => localize(v, locale.value);

function restart(newCat = cat.value) {
  cat.value = newCat;
  questions.value = shuffle(quizQuestions(newCat));
  idx.value = 0;
  picked.value = null;
  score.value = 0;
  finished.value = false;
}

function onCat(e) {
  restart(e.target.value);
}

// Follow the app's category selector (the panel stays alive under KeepAlive).
watch(() => props.cat, (c) => restart(poolFor(c)));

function pick(i) {
  if (picked.value !== null) return;
  picked.value = i;
  if (i === q.value.answer) score.value += 1;
}

function next() {
  if (idx.value + 1 >= questions.value.length) { finished.value = true; return; }
  idx.value += 1;
  picked.value = null;
}

function seeIt() {
  emit('goto', q.value.goto.mode);
}

const grade = computed(() => {
  const r = score.value / questions.value.length;
  return r === 1 ? '🏆' : r >= 0.75 ? '🎉' : r >= 0.5 ? '👍' : '📚';
});
</script>

<template>
  <section class="panel">
    <div class="controls">
      <label><span>{{ t('quiz.cat') }}</span>
        <select :value="cat" @change="onCat">
          <option v-for="c in CATS" :key="c" :value="c">{{ t('cat.' + c) }}</option>
        </select>
      </label>
      <span v-if="!finished" class="el-phase">{{ tf('quiz.progress', idx + 1, questions.length) }} — {{ tf('quiz.score', score) }}</span>
      <button @click="restart()">{{ t('quiz.replay') }}</button>
    </div>

    <template v-if="!finished && q">
      <p class="qz-prompt">{{ t('quiz.pick') }} <b>{{ L(q.question) }}</b></p>
      <div class="code-box">
        <div class="code-head"><span>{{ q.lang === 'js' ? 'JavaScript' : q.lang === 'kotlin' ? 'Kotlin' : q.lang === 'swift' ? 'Swift' : q.lang === 'ruby' && q.cat === 'git' ? 'git' : 'Ruby' }}</span></div>
        <pre><code v-html="codeHtml"></code></pre>
      </div>
      <div class="qz-choices">
        <button
          v-for="(c, i) in q.choices"
          :key="i"
          class="qz-choice"
          :class="{
            correct: picked !== null && i === q.answer,
            wrong: picked === i && i !== q.answer,
            faded: picked !== null && picked !== i && i !== q.answer,
          }"
          @click="pick(i)"
        >{{ L(c) }}</button>
      </div>
      <div v-if="picked !== null" class="qz-feedback">
        <p class="qz-verdict" :class="picked === q.answer ? 'ok' : 'ko'">
          {{ picked === q.answer ? t('quiz.correct') : t('quiz.wrong') }}
        </p>
        <p class="qz-explain">{{ L(q.explain) }}</p>
        <div class="qz-actions">
          <button class="primary" @click="next">{{ idx + 1 >= questions.length ? t('quiz.results') : t('quiz.next') }}</button>
          <button @click="seeIt">{{ t('quiz.see') }}</button>
        </div>
      </div>
    </template>

    <div v-else-if="finished" class="qz-final">
      <p class="qz-grade">{{ grade }}</p>
      <p class="qz-score">{{ tf('quiz.final', score, questions.length) }}</p>
      <button class="primary" @click="restart()">{{ t('quiz.replay') }}</button>
    </div>

    <p class="hint">{{ t('quiz.note') }}</p>
  </section>
</template>
