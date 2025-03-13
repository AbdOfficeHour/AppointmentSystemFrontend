<script setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import EventUtils from "@/utils/eventUtil.js";

const props = defineProps(["data"])
const { t } = useI18n()

</script>

<template>
  <el-table :data="EventUtils.getDetailFormat(props.data)" border style="width: 100%">
    <el-table-column prop="head" label="" />
    <el-table-column prop="data" :label="t('appointment_list.detailMessage.data')" />
  </el-table>
</template>

<style scoped></style>