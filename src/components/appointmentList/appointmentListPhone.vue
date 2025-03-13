<script setup>
import { defineEmits, defineProps, onMounted, onUnmounted, ref, watch, computed, nextTick } from 'vue';
import stateIcon from './stateIcon.vue';
import operateButtonPhone from './operateButtonPhone.vue';
import { usePullToLoad } from '@/utils/usePullToLoad';


// 外部需要触发的两个事件
const emit = defineEmits(["rowClick", "editEventClicked", "update:page"]);
// 外部传入的数据
const props = defineProps(["pageData", "mode", "operateMode", "page", "pageSize", "totalLength"]);

const offset = ref([]);    // 储存每个卡片的偏移量
const touchStartX = ref(0);      // 触摸起始位置
const touchStartY = ref(0);
const startOffset = ref(0);
const bottomMarker = ref(null);
const buttonContainers = ref([]);
const page = computed({
    get: () => props.page,
    set: (newVal) => emit("update:page", newVal)
});

offset.value = new Array(props.pageData.length).fill(0);

/**
 * 处理手机屏幕开始触摸
 */
function handleTouchStart(index, event) {
    touchStartX.value = event.touches[0].clientX;
    startOffset.value = offset.value[index];
    touchStartY.value = event.touches[0].clientY;
}

/**
 * 处理手机屏幕上的手指移动
 */
function handleTouchMove(index, event) {
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    const deltaX = touchEndX - touchStartX.value;
    const deltaY = touchEndY - touchStartY.value

    // const buttonContainer = buttonContainers.value[index];
    // const buttonWidth = buttonContainer ? buttonContainer.$el.offsetWidth : 0;
    // if (deltaX < -buttonWidth) {
    //     // 向左最大偏移量
    //     offset.value[index] = -buttonWidth;
    // } else if (deltaX > -startOffset.value) {
    //     // 向右最大偏移
    // } else {
    //     offset.value[index] = deltaX + startOffset.value;
    // }

    // const deltaY = event.touches[0].clientY - touchStartY.value;
    // touchStartY.value = event.touches[0].clientY;
    // window.scrollBy(0, -deltaY);

    // 判断主导滑动方向 ✅
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        console.log("水平滑动")
        // 水平滑动：处理卡片偏移（阻止垂直滚动）
        event.preventDefault() // 必须阻止垂直滚动干扰 ✅
        const buttonContainer = buttonContainers.value[index]
        const buttonWidth = buttonContainer ? buttonContainer.$el.offsetWidth : 0
        const newOffset = deltaX + startOffset.value
        offset.value[index] = Math.min(0, Math.max(-buttonWidth, newOffset))
    } else {
        // 垂直滚动：交由原生处理（不阻止默认行为） ✅
        console.log("垂直滑动")
    }
}

/**
 * 处理手机屏幕上的手指离开
 */
function handleTouchEnd(index) {
    const buttonContainer = buttonContainers.value[index];
    const buttonWidth = buttonContainer ? buttonContainer.$el.offsetWidth : 0;
    // 只有超过一半才完全展开
    if (offset.value[index] < -buttonWidth / 2) {
        offset.value[index] = -buttonWidth;
    } else {
        offset.value[index] = 0;
    }
}

const fetchData = () => {
    if (props.pageData.length < props.totalLength) {
        page.value++
    }
}

const { init, cleanup } = usePullToLoad(fetchData, {
    triggerDistance: 30,     // 可调节触感灵敏度
    throttleTime: 800,
    rootMargin: '200px'  // 提前 200px 开始检测触底
})

onMounted(() => {
    nextTick(() => {
        if (bottomMarker.value) {
            init(bottomMarker.value)
        }
    })
})

onUnmounted(cleanup)



</script>

<template>
    <div class="phone-list-container">
        <p>{{ $t("appointment_list.moveHit") }}</p>
        <div class="phone-list">
            <div v-for="data, index in props.pageData" :key="index" class="phone-list-card"
                @touchstart="handleTouchStart(index, $event)" @touchmove="handleTouchMove(index, $event)"
                @touchend="handleTouchEnd(index)" :style="{ transform: `translateX(${offset[index]}px)` }">
                <el-card shadow="never"
                    @click="() => { emit('rowClick', { originIndex: index }, { property: 'phone' }) }">
                    <div class="phone-list-item" v-if="props.mode === 'officeHour'">
                        <div class="phone-state-icon-container">
                            <stateIcon :state="data.state" />
                        </div>
                        <div class="phone-list-display">
                            <p>
                                {{ $t("appointment_list.officehourCard.teacher") }} : {{ data.teacher_name }}
                            </p>
                            <p>
                                {{ $t("appointment_list.officehourCard.time") }} :
                                {{ data.date }}
                                {{ data.startTime }}-{{ data.endTime }}
                            </p>
                        </div>
                    </div>
                    <div class="phone-list-item" v-else-if="props.mode === '教室预约'">
                        <div class="phone-state-icon-container">
                            <stateIcon :state="data.state" />
                        </div>
                        <div class="phone-list-display">
                            <p>
                                {{ $t("appointment_list.classroomCard.classroom") }} : {{ data.classroom }}
                            </p>
                            <P>
                                {{ $t("appointment_list.classroomCard.applicant") }} : {{ data.applicant }}
                            </P>
                            <p>
                                {{ $t("appointment_list.classroomCard.time") }} :
                                {{ data.date }}
                                {{ data.startTime }}-{{ data.endTime }}
                            </p>
                        </div>
                    </div>
                </el-card>
                <operateButtonPhone :operate-mode="props.operateMode" :state="data.state" :datetime="data.originalDate"
                    :mode="mode" ref="buttonContainers" :event-id="data.id"
                    @edit-event-clicked="(eventId, operate) => emit('editEventClicked', eventId, operate)" />
            </div>
        </div>
        <div ref="bottomMarker"></div>
    </div>
</template>

<style>
.phone-list-container {
    height: 80%;
    margin-top: 10px;
    -webkit-overflow-scrolling: touch;
}

.phone-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    gap: 10px;
    background-color: #ffffff;
}

.phone-list-item {
    display: grid;
    gap: 10px;
    grid-template-columns: 90px 1fr;
}

.phone-list-card {
    display: grid;
    grid-template-columns: 100% 1fr;
    transition: transform 0.3s ease;
}

.phone-state-icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.phone-list-display {}

.phone-list-button {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>