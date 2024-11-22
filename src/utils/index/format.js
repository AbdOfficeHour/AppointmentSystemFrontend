/**
 * 负责对选择器相关数据执行格式化操作
 */
let PickerFormat = {
    /**
     * 从后端返回的完整教师列表中，筛选出教师分类选择器需要的数据
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
     * 从教师列表中筛选出所有有OfficeHour的教师数据，并创建从id到name的映射表，用于向后端请求时间表数据
     * 返回数据类型为：
     * [
     * {teacherId: 101, teacherName: 'Alice'},
     * {teacherId: 102, teacherName: 'Bob'}
     * ]
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
     * 从教师用户选中的教师中，通过教师姓名获取教师ID，以向后端查询教师的时间表
     */
    get_id_by_teacher_name(teacherName, allTeacherInfo) {

        let teacherId = null
        allTeacherInfo.forEach(teacher =>{
            if (teacher.teacherName == teacherName) {
                teacherId = teacher.teacherId
            }
        })
        return teacherId
    },

    /**
     * 从教师列表中筛选出所有Classroom数据，并创建从id到name的映射表，用于向后端请求时间表数据
     * [
     * {classroomId: '1', classroom: '102'}
     * {classroomId: '2', classroom: '104'}
     * {classroomId: '3', classroom: '106'}
     * {classroomId: '4', classroom: '202B'}
     * ]
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
     * 从所有教室的信息中，筛选出用户权限可以预约的教室
     * [
     * {classroomId: '1', classroom: '102'}
     * {classroomId: '2', classroom: '104'}
     * {classroomId: '3', classroom: '106'}
     * ]
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
     * 从用户信息中提取出权限表
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
    formatTimestamp: function(timestamp, isDate = false) {
        let date = new Date(timestamp);
        if (isDate) {
            return date.toLocaleDateString().replaceAll("/","-"); // 格式化为 YYYY-MM-DD
        } else {
            return date.toTimeString().split(' ')[0].slice(0, 5); // 格式化为 HH:mm
        }
    },

    /**
     * 用于组合一天的日期和时间
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
     * 将date对象归零，作为一天的开始
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
     * 负责对时间表信息相关数据执行格式化操作
     * [{
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
    }
}

export{
    UserInfoFormat,
    TableFormat,
    TimeFormat,
    PickerFormat,
}
