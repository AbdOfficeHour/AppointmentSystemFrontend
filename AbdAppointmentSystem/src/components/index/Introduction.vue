<script setup>
</script>

<template>
  <div class="legend">
    <div class="legend-item">
      <span class="legend-color" style="background-color: blue;"></span>
      <span class="legend-text">{{ $t("index.introduction_available")}}</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: grey;"></span>
      <span class="legend-text">{{ $t("index.introduction_unavailable")}}</span>
    </div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.legend-color {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  display: inline-block;
}

.legend-text {
  display: inline;
}
</style>