<script setup>
import { ref, watch, reactive, onMounted, onUpdated, nextTick } from 'vue';
import { useI18n } from "vue-i18n";
import { ElSelect, ElOption } from 'element-plus';

// 接收父组件传递的props
const props = defineProps({
  selectors: Array // 选择器列表信息
});

// 向父组件传递的事件
const emit = defineEmits(
    [
    'update:selectedTeacher', // 选中教师后，触发的变更事件
    'loading-done'
  ]
);

const { t } = useI18n() // 国际化翻译函数
const localSelectors = reactive(JSON.parse(JSON.stringify(props.selectors))); // 本地状态，深拷贝props避免直接修改props
const selectedType = ref(null); // 当前选中的类型
const selectedTeacher = ref(null); // 当前选中的教师
const teacherOptions = ref([]); // 根据选中的类型动态更新的教师选项

/**
 * @description 初始化教师选项
 * @returns {void}
 */
const initializeTeacherOptions = () => {
  teacherOptions.value = [];
  if (selectedType.value) {
    const selectedTypeIndex = localSelectors.findIndex(selector => selector.title === selectedType.value);
    if (selectedTypeIndex !== -1) {
      teacherOptions.value = localSelectors[selectedTypeIndex].options;
    }
  }
};

/**
 * @description 选择器类型选择选项发生变化时触发
 * @param value - 选中的类型
 */
const handleTypeChange = (value) => {
  selectedType.value = value;
  selectedTeacher.value = null; // 重置教师选择
};

/**
 * @description 选择器教师选择选项发生变化时触发
 * @param value - 选中的教师
 */
const handleTeacherChange = (value) => {
  selectedTeacher.value = value;
  emit('update:selectedTeacher', selectedTeacher.value);
};

// 监听类型选择器的变化
watch(selectedType, () => {
  initializeTeacherOptions();
});

// 监听props的变化，并同步更新localSelectors
watch(() => props.selectors, (newSelectors) => {
  Object.assign(localSelectors, JSON.parse(JSON.stringify(newSelectors)));
}, { deep: true });

// Mounted生命周期钩子，用于通知父组件加载完成
onMounted(() => {
  nextTick(() => {
    emit("loading-done")
  })
})

// Updated生命周期钩子，用于通知父组件加载完成
onUpdated(() => {
  nextTick(() => {
    emit("loading-done")
  })
})
</script>

<template>
  <div class="selectors-container">
    <div class="selector">
      <label>{{ t("index.office_hour_type") }}</label>
      <el-select v-model="selectedType" :placeholder="t('index.office_hour_type')" @change="handleTypeChange">
        <el-option
            v-for="selector in localSelectors"
            :key="selector.title"
            :label="selector.title"
            :value="selector.title"
        ></el-option>
      </el-select>
    </div>
    <div class="selector">
      <label>{{ t("index.choose_teacher") }}</label>
      <el-select v-model="selectedTeacher" :placeholder="t('index.choose_teacher')" @change="handleTeacherChange">
        <el-option
            v-for="teacher in teacherOptions"
            :key="teacher"
            :label="teacher"
            :value="teacher"
        ></el-option>
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.selector {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

@media (min-width: 1000px) {
  .selectors-container {
    display: flex;
    justify-content: space-between;
    margin-left: 10px;
    margin-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .selector {
    width: 40%
  }
}

@media (max-width: 999px) {
  .selectors-container {
    display: flex;
    justify-content: space-between;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .selector {
    width: 45%
  }
}

.el-select {
  width: 100%;
}
</style>