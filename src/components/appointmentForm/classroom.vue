<template>
  <div>
    <DesktopApp v-if="!isMobile" :if-visible="ifVisible" :userInfo="userInfo" @close-dialog="emit('closeDialog')"/>
    <MobileApp v-else :if-visible="ifVisible" :userInfo="userInfo" @close-dialog="emit('closeDialog')"/>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import DesktopApp from '@/components/appointmentForm/classroomDesktop.vue'
import MobileApp from '@/components/appointmentForm/classroomMobile.vue'

const isMobile = ref(false)
const props = defineProps(["ifVisible", "userInfo"])
const emit = defineEmits(["closeDialog"])

onMounted(() => {
  // 方式 1：通过 UserAgent 判断
  isMobile.value = /Mobile|Android|iP(hone|od)|BlackBerry|IEMobile|Kindle|Silk-Accelerated|Opera Mini/i.test(
      navigator.userAgent
  )

  // 方式 2：通过屏幕宽度判断（如小于 768 像素认为是移动端）
  isMobile.value = window.innerWidth < 960
})
</script>
