<script setup>
import {reactive} from "vue";
import axios from "axios";
import {useRouter} from "vue-router";

const router = useRouter()

const form = reactive({
    userID: '',
    password: ''
  })

function onSubmit(){
  console.log(form)
  let api = '/User/login'
  let data = {
    userID: form.userID,
    password: form.password
  }
  axios({
    method: 'post',
    url: api,
    data: data
  }).then(res => {
    console.log(res)
    if(res.data.code === 0){
      localStorage.setItem('token', res.data.data.token)
      router.push('/index')
    }else{
      alert(res.data.message)
    }
  })
}

</script>

<template>
  <p>login</p>
  <el-from :model="form" label-width="auto" style="max-width: 600px">
    <el-form-item label="用户名">
      <el-input v-model="form.userID"></el-input>
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password"></el-input>
    </el-form-item>
    <el-button type="primary" @click="onSubmit">Create</el-button>
  </el-from>
</template>

<style scoped>

</style>