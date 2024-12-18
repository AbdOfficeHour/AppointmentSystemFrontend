<script setup>
import { ref, watch, reactive, onMounted } from 'vue';

// 接收父组件传递的props
const props = defineProps({
  selectors: Array // OfficeHour选择器列表信息
});

// 向父组件传递的事件
const emit = defineEmits(
    ['update:selectedTeacher'] // 选中教师后，触发的变更事件
)

// PickerOfficeHour组件全局变量定义

// 组件内全局变量定义 - 本地状态，避免浅拷贝
const localSelectors = reactive(JSON.parse(JSON.stringify(props.selectors)));  // 本地状态，深拷贝props避免直接修改props

// 组件内全局变量定义 - 选择器状态变量
const currentSelection = ref(new Array(localSelectors.length).fill(null));  // 六个选择器内，被选中的选项
const selectedTeacher = ref(null);  // 被选中的教师

/**
 * PickerOfficeHour组件初始化
 */
onMounted(function (){
  console.log("PickerOfficeHour组件开始挂载")
})

/**
 * 选择器选项发生变化时触发
 * 向父组件传递选中教师变更信息
 */
const handleChange = (event, index) => {
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

/**
 * 监听props的变化，并同步更新localSelectors
 */
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
  padding-top: 10px;
  padding-bottom: 10px;
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
