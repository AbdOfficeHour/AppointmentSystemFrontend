<script setup>
import {ref} from 'vue';

const selectDate = ref("3");


</script>

<template>
<div class="appointment-table">
  <div class="date-picker">
    <label class="date-picker-option">
      <input type="radio" name="selectDate" value="3" v-model="selectDate" checked>
      <span class="option-box">三月内</span>
    </label>
    <label class="date-picker-option">
      <input type="radio" name="selectDate" value="6" v-model="selectDate">
      <span class="option-box">半年内</span>
    </label>
    <label class="date-picker-option">
      <input type="radio" name="selectDate" value="12" v-model="selectDate">
      <span class="option-box">一年内</span>
    </label>
  </div>

  <div class="appointment-table">
    <table>
      <thead>
      <tr>
        <th>a</th>
        <th>b</th>
        <th>c</th>
        <th>d</th>
      </tr>
      </thead>
      <tbody>
       <tr>
         <td>e</td>
         <td>e</td>
         <td>e</td>
         <td>e</td>
       </tr>
       <tr>
         <td>e</td>
         <td>e</td>
         <td>e</td>
         <td>e</td>
       </tr>
       <tr>
         <td>e</td>
         <td>e</td>
         <td>e</td>
         <td>e</td>
       </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<style scoped>
.appointment-table{
  margin-top: 10px;
  width: 100%;

  display: flex;
  flex-direction: column;

  align-items: center;
}

/**
日期选择器
 */
.date-picker{
  display: grid;
  position: relative;
  cursor: pointer;
  user-select: none;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
}

.date-picker-option{
  width: 75px;
  height: 25px;
}

.date-picker-option input{
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 75px;
  height: 25px;
}

.date-picker-option input[type="radio"]:checked + span{
  background-color: #0a77f3;
  color: white;
}

.option-box{
  display: inline-block;
  width: 75px;
  height: 25px;

  border: #8c8c8c solid 1px;
  border-radius: 5px;

  text-align: center;
}

/**
表格部分
 */
.appointment-table table{
  border-collapse: collapse;
  width: 80%;
}

.appointment-table table thead{
  background-color: #f0f5ff;
}
.appointment-table table tbody tr:nth-child(even){
  background-color: #f0f5ff;
}

</style>