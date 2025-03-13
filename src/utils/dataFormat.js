/**
 * 负责对选择器相关数据执行格式化操作
 */

let PickerFormat = {
    /**
     * @description 从后端返回的完整教师列表中，筛选出教师分类选择器需要的数据
     * @param teacherList - 后端返回的完整教师列表
     * @returns {*} - 教师分类选择器需要的数据
     */
    teacher_list_format(teacherList) {
        let teacherListFormat = null
        teacherListFormat = teacherList.map(item => {
            return {
                title: item.classification,
                options: item.teachers ? item.teachers.map(teacher => teacher.teacherName) : ['no teachers available']
            }
        })
        return teacherListFormat
    },

    /**
     * @description 从教师列表中筛选出所有有OfficeHour的教师数据，并创建从id到name的映射表，用于向后端请求时间表数据
     * @example 返回数据类型为：
     * [
     * {teacherId: 101, teacherName: 'Alice'},
     * {teacherId: 102, teacherName: 'Bob'}
     * ]
     * @param teacherList - 后端返回的完整教师列表
     * @returns {*} - 教师数据
     */
    all_teacher_info(teacherList) {
        let allTeacherFormat = null
        allTeacherFormat = teacherList.reduce((acc, item) => {
            if (item.teachers) {
                acc.push(...item.teachers)
            }
            return acc
        }, [])
        return allTeacherFormat
    },

    /**
     * @description 从教师用户选中的教师中，通过教师姓名获取教师ID，以向后端查询教师的时间表
     * @param teacherName - 用户选中的教师姓名
     * @param allTeacherInfo - 从后端返回的完整教师列表中筛选出的有OfficeHour的教师数据
     * @returns { Number } - 教师ID
     */
    get_id_by_teacher_name(teacherName, allTeacherInfo) {

        let teacherId = null
        allTeacherInfo.forEach(teacher =>{
            if (teacher.teacherName === teacherName) {
                teacherId = teacher.teacherId
            }
        })
        return teacherId
    },

    /**
     * @description 从教师列表中筛选出所有Classroom数据，并创建从id到name的映射表，用于向后端请求时间表数据
     * @example [
     * {classroomId: '1', classroom: '102'}
     * {classroomId: '2', classroom: '104'}
     * {classroomId: '3', classroom: '106'}
     * {classroomId: '4', classroom: '202B'}
     * ]
     * @param classroomList - 后端返回的完整教室列表
     * @returns {*} - 教室数据
     */
    all_classroom_info(classroomList) {
        let allClassroomFormat = null
        allClassroomFormat = classroomList.reduce((acc, item) => {
            if (item.classrooms) {
                acc.push(...item.classrooms)
            }
            return acc
        }, [])
        return allClassroomFormat
    },

    /**
     * @description 从所有教室的信息中，筛选出用户权限可以预约的教室
     * @example [
     * {classroomId: '1', classroom: '102'}
     * {classroomId: '2', classroom: '104'}
     * {classroomId: '3', classroom: '106'}
     * ]
     * @param authorityTable - 用户权限表
     * @param allClassroomInfo - 从后端返回的完整教室列表中筛选出的教室数据
     * @returns {*[]} - 用户权限可以预约的教室
     */
    allow_classroom_info(authorityTable, allClassroomInfo) {
        let allowClassroomFormat = []
        allClassroomInfo.forEach(classroom => {
            if (authorityTable[`classroom:appointment:${classroom.classroom}`]) {
                allowClassroomFormat.push(classroom);
            }
        })
        return allowClassroomFormat
    }
}

/**
 * 负责对用户信息相关数据执行格式化操作
 */
let UserInfoFormat = {
    /**
     * @description 从用户信息中提取用户权限表
     * @param credits - 用户信息中的权限信息
     * @returns {{"OfficeHour:appointment": null,
     * "OfficeHour:approve": null,
     * "OfficeHour:check:me": null,
     * "classroom:appointment:202B": null,
     * "classroom:timeTable:all": null,
     * "OfficeHour:check:all": null,
     * "classroom:appointment:102": null,
     * "OfficeHour:timeTable:all": null,
     * "classroom:appointment:104": null,
     * "classroom:approve": null,
     * "classroom:appointment:106": null,
     * "classroom:check:all": null}} - 用户权限表
     */
    credit_format(credits) {
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

/**
 * 负责对时间格式相关数据执行格式化操作
 */
let TimeFormat = {
    /**
     * @description 将时间戳转化为指定格式的时间字符串
     * @param timestamp - 时间戳
     * @param isDate - 是否只保留日期
     * @returns {string} - 格式化后的时间字符串
     */
    formatTimestamp: function(timestamp, isDate = false) {
        let date = new Date(timestamp);
        if (isDate) {
            return date.toLocaleDateString().replaceAll("/","-"); // 格式化为 YYYY-MM-DD
        } else {
            return date.toTimeString().split(' ')[0].slice(0, 5); // 格式化为 HH:mm
        }
    },

    /**
     * @description 用于组合一天的日期和时间
     * @param __date 时间戳只有日期正确
     * @param __time 时间戳只有时间正确
     * @return {Date} 真正的日期时间
     */
    combineDateAndTime: function (__date,__time){
        const date = new Date(__date)
        const time = new Date(__time)
        return new Date(date.getFullYear(),date.getMonth(),date.getDate(),time.getHours(),time.getMinutes(),time.getSeconds())
    },

    /**
     * @description - 将date对象归零，作为一天的开始
     * @param timestamp
     * @return {Date}
     */
    timestampAsStartOfDate: function (timestamp){
        const date = new Date(timestamp);
        return new Date(date.getFullYear(),date.getMonth(),date.getDate())
    }
};

/**
 * 负责对时间表相关数据执行格式化操作
 */
let TableFormat = {
    /**
     * @description 负责对时间表信息相关数据执行格式化操作
     * @example [{
     *   date: '2024-07-17',
     *   available: [
     *     {start: '09:30', end: '11:00'},
     *     {start: '12:30', end: '14:00'},
     *     {start: '17:00', end: '20:00'}
     *   ],
     *   busy: [
     *     {start: '08:00', end: '09:30'},
     *     {start: '11:00', end: '12:30'},
     *     {start: '14:00', end: '17:00'}
     *   ]
     * },
     * {
     *   date: '2024-07-18',
     *   busy: [
     *     {start: '08:00', end: '09:30'},
     *     {start: '11:00', end: '12:30'},
     *     {start: '14:00', end: '17:00'}
     *   ],
     *   available: [
     *     {start: '09:30', end: '11:00'},
     *     {start: '12:30', end: '14:00'},
     *     {start: '17:00', end: '20:00'}
     *   ]
     * }]
     * @param timeTableTeacher - 后端返回的时间表
     * @returns {*} - 前端渲染时间表所需的数据结构
     */
    timetable_format(timeTableTeacher) {
        // 从后端返回的时间表，格式化为前端渲染所需的数据结构
        let timeTableFormat = timeTableTeacher.map(entry => {
            let transformedBusy = entry.busy.map(timeSlot => ({
                start: TimeFormat.formatTimestamp(timeSlot.start),
                end: TimeFormat.formatTimestamp(timeSlot.end)
            }));
            let transformedAvailable = entry.available.map(timeSlot => ({
                start: TimeFormat.formatTimestamp(timeSlot.start),
                end: TimeFormat.formatTimestamp(timeSlot.end)
            }));
            return {
                date: TimeFormat.formatTimestamp(entry.date, true),
                busy: transformedBusy,
                available: transformedAvailable
            };
        });
        return timeTableFormat;
    },

    /**
     * @description 负责对时间表信息相关数据执行格式化操作
     * 将后端返回的所有start字段改为startTime，将所有end字段改为endTime
     * @param backend_list - 后端返回的时间表
     * @returns {*} - 格式化后前端渲染时间表所需的数据结构
     */
    start2startTime_format(backend_list) {
        backend_list.forEach(item => {
            item.startTime = item.start
            item.endTime = item.end
            delete item.start
            delete item.end
        })
        return backend_list
    }
}

export{
    UserInfoFormat,
    TableFormat,
    TimeFormat,
    PickerFormat,
}
