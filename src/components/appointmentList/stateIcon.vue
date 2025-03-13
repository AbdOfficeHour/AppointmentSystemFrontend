<script setup>
import {computed,defineProps} from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps(["state"])
const {t} = useI18n();


const stateTitle = computed(()=>{
  if (props.state===2)
    return t("appointment_list.stateIcon.2")
  else if (props.state===3)
    return t("appointment_list.stateIcon.3")
  else if (props.state===4)
    return t("appointment_list.stateIcon.4")
  else if (props.state===5)
    return t("appointment_list.stateIcon.5")
  else if (props.state===6)
    return t("appointment_list.stateIcon.6")
  else if (props.state===7)
    return t("appointment_list.stateIcon.7")
})

</script>

<template>
    <div class="state-icon" :class="'state-'+state">
      <span class="point" ></span>
      <span class="content">{{stateTitle}}</span>
    </div>
</template>

<style scoped>
.state-icon{
  display: flex;
  border-radius: 25px 25px 25px 25px;
  align-items: center;
  height: 25px;
  padding: 10px;
}

.content{
  width: auto;
}

.point{
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
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
}
.state-2 .content{
  color: #f79009;
}
.state-2 .point{
  background-color: #f79009;
}

.state-3{
  background-color: #ecfdf3;
}
.state-3 .content{
  color: #12b76a;
}
.state-3 .point{
  background-color: #12b76a;
}

.state-4{
  background-color: #fef3f2;
}
.state-4 .content{
  color: #f04438;
}
.state-4 .point{
  background-color: #f04438;
}

.state-5{
  background-color: #eff8ff;
}
.state-5 .content{
  color: #2e90fa;
}
.state-5 .point{
  background-color: #2e90fa;
}

.state-6{
  background-color: #fffaeb;
}
.state-6 .content{
  color: #949191;
}
.state-6 .point{
  background-color: #949191;
}

.state-7{
  background-color: #cac8c8;
}
.state-7 .content{
  color: #949191;
}
.state-7 .point{
  background-color: #949191;
}



</style>