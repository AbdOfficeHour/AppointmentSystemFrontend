let PickerFormat = {
    /**
     * 负责对选择器相关数据执行格式化操作
     */
    teacher_list_format(teacherList) {
        /**
         * 从后端返回的完整教师列表中，筛选出教师分类选择器需要的数据
         */
        console.log("从教师列表中筛选出教师分类选择器需要的数据")
        let teacherListFormat = null
        teacherListFormat = teacherList.map(item => {
            return {
                title: item.classification,
                options: item.teachers ? item.teachers.map(teacher => teacher.teacherName) : ['no teachers available']
            }
        })
        return teacherListFormat
    },
    all_teacher_info(teacherList) {
        /**
         * 从教师列表中筛选出所有有OfficeHour的教师数据，并创建从id到name的映射表，用于向后端请求时间表数据
         */
        console.log("从教师列表中筛选出所有有OfficeHour的教师数据，并创建id-name的map")
        let allTeacherFormat = null
        allTeacherFormat = teacherList.reduce((acc, item) => {
            if (item.teachers) {
                acc.push(...item.teachers)
            }
            return acc
        }, [])
        return allTeacherFormat
    }
}

let UserInfoFormat = {
    /**
     * 负责对用户信息相关数据执行格式化操作
     */
    credit_format(credits) {
        /**
         * 从用户信息中提取出权限表
         */
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
    /**
     * 负责对OfficeHour时间表信息相关数据执行格式化操作
     */
    office_hour_timetable_format(timeTable, getSelection) {
        /**
         * 从后端返回的完整时间表中提取出被选中教师的时间表
         */
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

let TimeFormat = {
    /**
     * 负责对时间格式相关数据执行格式化操作
     */
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

export{
    UserInfoFormat,
    OfficeHourTableFormat,
    TimeFormat,
    PickerFormat
}
