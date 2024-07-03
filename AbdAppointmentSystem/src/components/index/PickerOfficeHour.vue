<script setup>
import {ref, watch, reactive, onMounted} from 'vue';
import { defineProps, defineEmits } from 'vue';

// 接收父组件传递的props
const props = defineProps({
  selectors: Array
});

// 向父组件传递的事件
const emit = defineEmits(
    ['update:selectedTeacher']
)

// 本地状态，深拷贝props避免直接修改props
const localSelectors = reactive(JSON.parse(JSON.stringify(props.selectors)));

// 选择器状态变量
const currentSelection = ref(new Array(localSelectors.length).fill(null));  // 六个选择器内，被选中的选项
const selectedTeacher = ref(null);  // 被选中的教师

onMounted(function (){
  /**
   * 组件初始化
   */
  console.log("PickerOfficeHour组件开始挂载")
})

const handleChange = (event, index) => {
  /**
   * 选择器选项发生变化时触发
   * 向父组件传递选中教师变更信息
   */
  const selectedValue = event.target.value; // 暂存被选中的数据
  selectedTeacher.value = selectedValue;

  // 触发父组件事件，传递selectedTeacher
  emit('update:selectedTeacher', selectedTeacher.value)

  // 重置其他选择器的选项
  currentSelection.value = new Array(localSelectors.length).fill(null);
  currentSelection.value[index] = selectedValue;

  // 恢复所有选择器的选项为原始教师名单
  localSelectors.forEach((selector, i) => {
    selector.options = [...props.selectors[i].options];
  });
};

// 监听props的变化，并同步更新localSelectors
watch(() => props.selectors, (newSelectors) => {
  Object.assign(localSelectors, JSON.parse(JSON.stringify(newSelectors)));
}, { deep: true });

</script>

<template>
  <div class="selectors-container">
    <div v-for="(selector, index) in localSelectors" :key="index" class="selector">
      <label>{{ selector.title }}</label>
      <select :value="currentSelection[index]" @change="handleChange($event, index)">
        <option :value="option" v-for="option in selector.options" :key="option">{{ option }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.selectors-container {
  display: flex;
  justify-content: space-between;
}

.selector {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 15%;
}

select {
  width: 100%;
}
</style>
