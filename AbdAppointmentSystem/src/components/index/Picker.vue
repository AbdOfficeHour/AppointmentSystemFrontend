<script setup>
  import {ref, watch} from "vue";

  const props = defineProps(['PickerList']) // 父组件传递的数据
  const emits = defineEmits(['picker-change']) // 父组件监听的事件
  let options = ref([]) // 选择器内选项
  let select_value= ref(null) // 被选中的对象

  watch(props, (newVal, oldVal) => { // 侦听PickerList数据变化
    console.log('Picker组件侦听器发现父组件传递的信息发生变化，开始更新')
    newVal = newVal.PickerList
    options.value = []
    for (let i = 0; i < newVal.length; i++) {
      options.value.push({
        value: newVal[i],
        label: newVal[i]
      })
    }
    console.log("Picker组件侦听器发现父组件传递的信息发生变化，并更新完成，更新options为：", options)
  })

  function pickerChange() {
    console.log("Picker组件选择器发生变化，选中的对象为", select_value.value)
    emits('picker-change', select_value.value)
  }
</script>

<template>
  <p>{{ $t("index.select_teacher_hint")}}</p>
  <el-select v-model="select_value"
             placeholder="Select"
             @change="pickerChange">
    <!-- v-for遍历渲染选择器内选项 -->
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"/>
  </el-select>
</template>

<style scoped>

</style>