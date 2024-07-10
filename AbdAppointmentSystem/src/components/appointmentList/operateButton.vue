<script setup>
import {defineProps,defineEmits} from 'vue';

const props = defineProps(["operateType","state","operateMode","eventId","mode"])
const emit = defineEmits(["addEventClicked","editEventClicked"])


/**
 * 处理添加事件的情况
 */
const handleAddEvent = () => {
  emit("addEventClicked")
}

/**
 * 处理数据操作
 * @operate 1取消操作 2同意操作 3拒绝操作 4完成操作
 */
const handleEventOp = (operate) => {
  emit("editEventClicked",props.eventId,operate)
}

</script>

<template>
<!--  添加按钮-->
  <div class="button-group" v-if="operateType === 1">
    <button class="view-button" @click="handleAddEvent">
      <span>+</span>
      <span>添加预约</span>
    </button>
  </div>
<!--  数据操作按钮-->
  <div v-else-if="operateType === 2">
    <template v-if="operateMode === 'view'">
      <button v-if="state === 2 || state === 3" class="view-button" @click="handleEventOp(1)">
        <span>X</span>
        <span>取消预约</span>
      </button>
      <div v-else>没有操作</div>
    </template>
    <template v-else>
      <div class="button-group" v-if="state === 2">
        <button
            class="approve-button"
            style="color:#1d39c4"
            @click="handleEventOp(2)"
        >同意</button>
        <button
            class="approve-button"
            style="color:white;background-color:#1d39c4"
            @click="handleEventOp(3)"
        >拒绝</button>
      </div>
      <div class="button-group" v-else-if="state === 3">
        <button
            class="approve-button"
            style="color:#1d39c4"
            @click="handleEventOp(1)"
        >撤回</button>
        <button
            v-if="props.mode === 'officeHour'"
            class="approve-button"
            style="color:white;background-color:#1d39c4"
            @click="handleEventOp(4)"
        >完成</button>
      </div>
      <div v-else>
        没有操作
      </div>
    </template>
  </div>
</template>

<style scoped>
.button-group{
  display: inline-flex;
  gap: 10px;
}

.view-button{
  background-color: white;
  color:#1d39c4;
  border: #1d39c4 solid 1px;
  border-radius: 5px;

  display: grid;
  grid-template-columns: 1fr 3fr;
}

.view-button span{
  text-align: center;
  line-height: 200%;
}

.view-button span:first-child{
  color:#ff5733
}

.view-button:active{
  background-color: #4eaacb;
}

.approve-button{
  background-color: white;
  border: #1d39c4 solid 1px;
  border-radius: 5px;
  padding-left: 10px;
  padding-right: 10px;
}

.approve-button:active{
  background-color: #4eaacb;
}

</style>