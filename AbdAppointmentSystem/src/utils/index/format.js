import {all} from "axios";

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
         * 返回数据类型为：
         * [
         * {teacherId: 101, teacherName: 'Alice'},
         * {teacherId: 102, teacherName: 'Bob'}
         * ]
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
    },

    get_id_by_teacher_name(teacherName, allTeacherInfo) {
        /**
         * 从教师用户选中的教师中，通过教师姓名获取教师ID，以向后端查询教师的时间表
         *
         */
        let teacherId = null
        allTeacherInfo.forEach(teacher =>{
            if (teacher.teacherName == teacherName) {
                teacherId = teacher.teacherId
            }
        })
        return teacherId
    },

    all_classroom_info(classroomList) {
        /**
         * 从教师列表中筛选出所有Classroom数据，并创建从id到name的映射表，用于向后端请求时间表数据
         * [
         * {classroomId: '1', classroom: '102'}
         * {classroomId: '2', classroom: '104'}
         * {classroomId: '3', classroom: '106'}
         * {classroomId: '4', classroom: '202B'}
         * ]
         */
        console.log("从教室列表中筛选出所有有Classroom的数据，并创建id-name的map")
        let allClassroomFormat = null
        allClassroomFormat = classroomList.reduce((acc, item) => {
            if (item.classrooms) {
                acc.push(...item.classrooms)
            }
            return acc
        }, [])
        return allClassroomFormat
    },

    allow_classroom_info(authorityTable, allClassroomInfo) {
        /**
         * 从所有教室的信息中，筛选出用户权限可以预约的教室
         * [
         * {classroomId: '1', classroom: '102'}
         * {classroomId: '2', classroom: '104'}
         * {classroomId: '3', classroom: '106'}
         * ]
         */
        console.log("从教室列表中筛选出用户可以预约的Classroom的数据，并创建id-name的map")
        let allowClassroomFormat = []
        allClassroomInfo.forEach(classroom => {
            if (authorityTable[`classroom:appointment:${classroom.classroom}`]) {
                allowClassroomFormat.push(classroom);
            }
        })
        return allowClassroomFormat
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
            "classroom:appointment:102": null,
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
