<script setup>
import {reactive} from "vue";
import {ElMessage} from "element-plus";
import axios from "axios";
import router from "@/router/index.js";

const form = reactive({
  username:"",
  password:""
})

const handleClick = () => {
  if(form.username === "" || form.password === "")
    ElMessage.error("用户名或密码不能为空")
  axios.post("http://localhost:3000/login",{
    id:form.username,
    pass:form.password
  },{
    headers:{
      "Content-Type":"application/json"
    }
  })
  .then(res => {
    if(res.status === 200){
      ElMessage.success("登录成功")
      localStorage.setItem("token",res.data.token)
      router.push("/index/officehour")
    }else{
      ElMessage.error("登录失败")
    }
  }).catch(res=>{
        ElMessage.error("登录失败")
      })
}


</script>

<template>
  <el-card style="width: 350px; margin: 100px auto">
    <el-form
        :model="form"
        label-width="auto"
    >
    <el-form-item label="用户id">
      <el-input v-model="form.username"/>
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password" type="password"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleClick">登录</el-button>
    </el-form-item>
  </el-form>
  </el-card>
</template>

<style scoped>

</style>