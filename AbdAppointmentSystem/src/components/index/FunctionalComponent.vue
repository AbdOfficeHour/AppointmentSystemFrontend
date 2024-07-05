<script setup>

</script>

<template>
  <div class="legend">
    <div class="legend-item">
      <span class="color-box free"></span>
      <span>空闲，可以预约</span>
    </div>
    <div class="legend-item">
      <span class="color-box busy"></span>
      <span>繁忙，不可预约</span>
    </div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-direction: column;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.color-box {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.color-box.free {
  background-color: #b7caea;
  border-style: solid;
}

.color-box.busy {
  background-color: #b0aeae;
  border-style: solid;
}
</style>
