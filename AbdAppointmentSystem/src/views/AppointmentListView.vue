<script setup>
import appointmentTable from '@/component/appointmentList/AppointmentTable.vue'


</script>

<template>
  <div class="main-container">
    <div class="main-title">
      <h1>我的预约</h1> <h1>My Appointment</h1>
    </div>
    <appointment-table/>
  </div>
</template>

<style scoped>

.main-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title{
  display: grid;
  grid-template-columns: 0.6fr 1fr;

  height: 78px;
  font-size: 24px;
  margin-top: 20px;
  margin-bottom: 20px;
}

</style>