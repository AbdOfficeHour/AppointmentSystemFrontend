let TimeFormat = {
    formatTimestamp(timestamp, if_date = false) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);
        if (if_date) {
            return `${year}-${month}-${day}`;
        }
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
}

let UserInfoFormat = {
    credit_format(credits) {
        // 从用户信息中提取出权限表
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
            authorityTable[key] = credits.includes(key) // 结果为布尔值
        }
        return authorityTable
    },
}

let OfficeHourTableFormat = {
    teacher_list_format(officeHourTime) {
        // 从后端返回的OfficeHour时间表中提取出教师列表信息
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

    officehour_timetable_format(timeTable, getSelection) {
        // 从后端返回的完整时间表中提取出被选中教师的时间表
        let timeTableTeacher = []
        console.log("从时间表中提取出被选中教师的时间表")
        for (let i = 0 ; i < timeTable.length; i++) {
            if (timeTable[i].name === getSelection) {
                timeTableTeacher = timeTable[i].time
            }
        }
        let timeTableFormat = timeTableTeacher.map(entry => {
            let transformedBusy = entry.busy.map(timeSlot => ({
                start: TimeFormat.formatTimestamp(timeSlot.start),
                end: TimeFormat.formatTimestamp(timeSlot.end)
            }))
            let transformedAvailable = entry.available.map(timeSlot => ({
                start: TimeFormat.formatTimestamp(timeSlot.start),
                end: TimeFormat.formatTimestamp(timeSlot.end)
            }))
            return {
                date:TimeFormat.formatTimestamp(entry.date, true),
                busy: transformedBusy,
                available: transformedAvailable
            }
        })
        return timeTableFormat
    }

}

export{
    UserInfoFormat,
    OfficeHourTableFormat,
    TimeFormat
}