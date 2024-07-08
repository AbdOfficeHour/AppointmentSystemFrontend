<script setup>
import { RouterView } from 'vue-router'
import { onMounted,ref } from 'vue';
import router from '@/router';
import route from '@/router';
import TabSelector from "@/components/TabSelector.vue";
import officehour from '@/components/officehour.vue';
import classroom from '@/components/classroom.vue'

// onMounted(() => {
//   /**
//    * 如果当前路径不是教室预约页面，则重定向到教室预约页面
//    */
//   if (route.name !== 'HomeViewClassroom') {
//     router.push({ name: 'HomeViewClassroom' });
//   }
// });

// classroom和officehour转换
let tip=ref(true);
const change=()=>{
  tip.value=!tip.value;
};
</script>

<template>
  <el-button type="primary" @click="change">转换</el-button>
  <div class="tab-selector" v-if="tip">
    <officehour/>
  </div>
  <div v-if="!tip">
    <classroom/>
  </div>
  <!-- <RouterView /> -->
</template>

<style scoped>

</style>
