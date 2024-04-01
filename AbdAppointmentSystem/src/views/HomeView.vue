<script setup>
  import TheWelcome from '../components/TheWelcome.vue'
  import { useI18n } from 'vue-i18n'
  let $locale = useI18n().locale
  const change = () => {
    $locale.value = $locale.value === 'en' ? 'zh' : 'en'
  }
</script>

<template>
  <button @click="change">切换语言</button>
  <p>{{ $t("index.introduction_available")}}</p>
  <main>
    <TheWelcome />
  </main>
</template>
