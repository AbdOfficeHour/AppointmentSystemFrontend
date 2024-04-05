let UserInfoFormat = {
    credit_format(credits) {
        console.log("从用户信息中提取出权限表")
        let authorityTable = {
            "OfficeHour:appointment": null,
            "OfficeHour:approve": null,
            "OfficeHour:check:all": null,
            "OfficeHour:check:me": null,
            "OfficeHour:timeTable:all": null,
            "classroom:appointment:104": null,
            "classroom:appointment:106": null,
            "classroom:appointment:202B": null,
            "classroom:check:all": null,
            "classroom:timeTable:all": null,
            "classroom:approve": null,
        }
        for (let key in authorityTable) {
            authorityTable[key] = credits.includes(key)
        }
        return authorityTable
    },
}

let OfficeHourTableFormat = {
    teacher_list_format(officeHourTime) {
        let teacherList = []
        console.log("从时间表中提取出教师列表信息")
        for (let i = 0; i < officeHourTime.length; i++) {
            let teacher = officeHourTime[i].name
            if (teacherList.indexOf(teacher) === -1) { // 教师是否已经存在于数组中，不存在则添加
                teacherList.push(teacher)
            }
        }
        return teacherList
    },

}

export{
    UserInfoFormat,
    OfficeHourTableFormat
}