<script setup>
import {defineProps} from 'vue';
import EventUtils from "@/utils/MyAppointment/eventUtil.js";

const props = defineProps(["data"])


</script>

<template>
  <el-table :data="EventUtils.getDetailFormat(props.data)" border style="width: 100%">
    <el-table-column prop="head" label=""/>
    <el-table-column prop="data" label="数据"/>
  </el-table>
</template>

<style scoped>

</style>