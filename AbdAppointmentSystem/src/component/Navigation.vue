<script setup>
import {computed, onBeforeMount, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import axios from "axios";

const {t,locale} = useI18n()

const officeHourNav = ref("none")
const classRoomNav = ref("none")
const userInfo = reactive({
  username:t("other.unLogin"),
  email:"",
  userID:"",
  userAuth:{
    credit:[],
    role:""
  }
})

const nav_list_officeHour = computed(()=>{
  //计算菜单栏
  let menu = Array()
  let menuName = new Set()
  userInfo.userAuth.credit.forEach((item)=>{
    if(item==="OfficeHour:timeTable:all"){
      if(!menuName.has("other./index/officehour")) {
        menu.push({
          name: t("other./index/officehour"),
          path: "/index/officehour",
        })
        menuName.add("other./index/officehour")
      }
    }else if(item==="OfficeHour:check:me"||item==="OfficeHour:check:all"){
      if(!menuName.has("other./list/officehour")) {
        menu.push({
          name: t("other./list/officehour"),
          path: "/list/officehour",
        })
        menuName.add("other./list/officehour")
      }
    }else if(item==="OfficeHour:appointment"||item==="OfficeHour:approve"){
      if(!menuName.has("other./list/officehour/appointment")) {
        menu.push({
          name: t("other./list/officehour/appointment"),
          path: "/list/officehour/appointment"
        })
        menuName.add("other./list/officehour/appointment")
      }
    }
  })
  return [
      ...menu.reverse(),
    {
      name:t("other./user"),
      path:"/User"
    },
    {
      name:t("other./contant"),
      path:"/contant"
    }
  ]
})
const nav_list_classroom = computed(()=>{
  let menu = Array()
  let menuName = new Set()
  userInfo.userAuth.credit.forEach((item)=>{
    if(item==="classroom:timeTable:all"){
      if (!menuName.has("other./index/classroom")) {
        menu.push({
          name: t("other./index/classroom"),
          path: "/index/classroom"
        })
        menuName.add("other./index/classroom")
      }
    }else if(item==="classroom:check:all"){
      if(!menuName.has("other./list/classroom")) {
        menu.push({
          name: t("other./list/classroom"),
          path: "/list/classroom"
        })
        menuName.add("other./index/classroom")
      }
    }else if(item.split(":")[0]==="classroom"&&item.split(":")[1]==="appointment"){
      if(!menuName.has("other./list/classroom/appointment")) {
        menu.push({
          name: t("other./list/classroom/appointment"),
          path: "/list/classroom/appointment"
        })
        menuName.add("other./list/classroom/appointment")
      }
    }
  })

  return [
      ...menu.reverse(),
    {
      name:t("other./user"),
      path:"/User"
    },
    {
      name:t("other./contant"),
      path:"/contant"
    }
  ]
})


onBeforeMount(()=>{
  axios.get("/User/info")
      .then(res=>{
        if(res.data.code===0){
          userInfo.username = res.data.data.username
          userInfo.email = res.data.data.email
          userInfo.userID = res.data.data.userID
          userInfo.userAuth.role = res.data.data.userAuth.role
          userInfo.userAuth.credit = res.data.data.userAuth.credit
        }
      })
      .catch(err=>{
        console.log(err)
      })
})

const changeLanguage = () => {
  if(localStorage.getItem("language")==="zh"){
   localStorage.setItem("language","en")
    locale.value = "en"
  }else{
    localStorage.setItem("language","zh")
    locale.value = "zh"
  }
}

</script>

<template>
  <nav class="nav">
    <ul class="nav-one">
      <li>
        <a
            @mouseover="()=>{officeHourNav = 'flex'}"
            @mouseout="()=>{officeHourNav = 'none'}"
        >
          {{$t("other.officeHour")}}
        </a>
      </li>
      <li>
        <a
            @mouseover="()=>{classRoomNav = 'flex'}"
            @mouseout="()=>{classRoomNav = 'none'}"
        >
          {{$t("other.classAppointment")}}
        </a>
      </li>
      <li class="nav-language-btn">
        <a @click="changeLanguage">{{ $t("other.language-switch") }}</a>
      </li>
      <li>
        <el-popover
            placement="bottom"
            :width="100"
            trigger="click"

        >
          <template #reference>
            <el-avatar class="user-avatar" size="default">{{userInfo.username}}</el-avatar>
          </template>
          <el-row>
            {{$t("other.name")}}: {{userInfo.username}}
          </el-row>
          <el-row>
            {{ $t("other.language") }}:{{locale}}
          </el-row>
          <el-row>
            <router-link to="/User">{{$t("other./user")}}</router-link>
          </el-row>
        </el-popover>
      </li>
    </ul>
  <!--二级导航部分 -->
    <ul id="officeHour" class="nav-one nav-two">
      <li v-for="item in nav_list_officeHour">
        <router-link :to="item.path">{{item.name}}</router-link>
      </li>
    </ul>
    <ul id="classroom" class="nav-one nav-two">
      <li v-for="item in nav_list_classroom">
        <router-link :to="item.path">{{item.name}}</router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.nav{
  background-color: #31b0e6;
  width: 100%;
}

.nav a{
  color: white;
  user-select: none;
}

.nav a:hover{
  background-color: #318ce6;
}


/**
一级导航栏样式
*/
.nav-one {
  margin: 0;
  padding: 0;
  list-style-type: none;
  width: 100%;
  display: inline-flex;
  flex-wrap: wrap;
}

.nav-one li{
  align-self: flex-start;
}

.nav-one li a{
  display: block;
  text-align: center;
  padding: 14px 16px;
}

.nav-one .nav-language-btn{
  margin-left: auto;
}

.user-avatar{
  margin-top: 7px;
  margin-right: 8px;
}

/**
二级导航栏样式
 */

.nav-two{
  background-color: #3195e6;
}

#officeHour{
  display: v-bind(officeHourNav);
}

#officeHour:hover{
  display: flex;
}

#classroom{
  display: v-bind(classRoomNav);
}

#classroom:hover{
  display: flex;
}

.el-row a{
  color: black;
}

.el-row a:hover{
  background-color: white;
}

</style>