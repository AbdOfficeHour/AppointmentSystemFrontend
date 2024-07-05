<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue';
import router from '@/router';
import route from '@/router';
import TabSelector from "@/components/TabSelector.vue";

onMounted(() => {
  /**
   * 如果当前路径不是教室预约页面，则重定向到教室预约页面
   */
  if (route.name !== 'HomeViewClassroom') {
    router.push({ name: 'HomeViewClassroom' });
  }
});

</script>

<template>
  <div class="tab-selector">
    <TabSelector />
  </div>
  <RouterView />
</template>

<style scoped>

</style>
