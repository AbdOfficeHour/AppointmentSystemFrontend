<script setup>
  import Introduction from "@/components/index/Introduction.vue";
  import {onMounted, ref} from "vue";
  import axios from "axios";

  let username = null
  let userID = null
  let email = null
  let role = []
  let credits = []
  let classroomTime = []
  let classroomEvent = []

  onMounted(function () {
    console.log("HomeView Classroom开始挂载")
    // 从后端获取用户信息和权限信息
    console.log("获取用户信息和权限信息")
    axios({
      method: 'get',
      url: '/User/info',
    }).then(res => {
      console.log(res)
      if(res.data.code === 0){
        console.log("获取用户信息和权限信息成功")
        username = res.data.data.username
        userID = res.data.data.userID
        email = res.data.data.email
        role = res.data.data.userAuthority.role
        credits = res.data.data.userAuthority.credit
      }else{
        console.log("获取用户信息和权限信息失败")
        console.log(res.data.message)
      }
    })

    // 从后端获取时间表信息
    console.log("获取时间表信息")
    axios({
      method: 'get',
      url: '/TableInfo/classroom',
    }).then(res => {
      console.log(res)
      if(res.data.code === 0){
        console.log("获取Classroom时间表信息成功")
        classroomTime = res.data.data.classroomTime
        classroomEvent = res.data.data.events
      }else{
        console.log("获取Classroom时间表信息失败")
        console.log(res.data.message)
      }
    })

  })

</script>

<template>
  <Introduction></Introduction>
</template>

<style scoped>

</style>
