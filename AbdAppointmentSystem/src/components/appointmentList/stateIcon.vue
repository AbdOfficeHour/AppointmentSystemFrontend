<script setup>
import {computed,defineProps} from 'vue';

const props = defineProps(["state"])

const stateTitle = computed(()=>{
  if (props.state===2)
    return "等待中"
  else if (props.state===3)
    return "已同意"
  else if (props.state===4)
    return "已拒绝"
  else if (props.state===5)
    return "已完成"
  else if (props.state===6)
    return "已取消"
  else if (props.state===7)
    return "已超时"
})

</script>

<template>
    <div class="state-icon" :class="'state-'+state">
      <div class="point">
        <span></span>
      </div>
      <div>{{stateTitle}}</div>
    </div>
</template>

<style scoped>
.state-icon{
  border-radius: 10px;
  height: 25px;
  width: 60px;
  display: grid;

  grid-template-columns: 20% 80%;
}

.point{
  position: relative;
}

.point span{
  border-radius: 90px;
  height: 6px;
  width: 6px;
  position: absolute;
  top: calc(50% - 3px);
  left: calc(50% - 3px);
}

.state-2{
  background-color: #fffaeb;
  color: #b54708;
}
.state-2 span{
  background-color: #f79009;
}
.state-3{
  background-color: #ecfdf3;
  color: #027a48;
}
.state-3 span{
  background-color: #12b76a;
}
.state-4{
  background-color: #fef3f2;
  color: #b42318;
}
.state-4 span{
  background-color: #f04438;
}
.state-5{
  background-color: #eff8ff;
  color: #175cd3;
}
.state-5 span{
  background-color: #2e90fa;
}
.state-6{
  background-color: #fffaeb;
  color: #292727;
}
.state-6 span{
  background-color: #949191;
}
.state-7{
  background-color: #cac8c8;
  color: #292727;
}
.state-7 span{
  background-color: #949191;
}



</style>