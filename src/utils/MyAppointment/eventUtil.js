/**
 * 我的预约事件管理器
 */
const EventUtils = {

    headToCn:{
        student_name: "学生姓名",
        teacher_name: "教师姓名",
        note: "备注",
        question: "要咨询的问题",
        present: "参与人员",
        state: "状态",
        refuse_result: "拒绝原因",
        work_summary: "工作总结",
        applicant:"申请人",
        approver:"审批人",
        classroom:"教室",
        isMedia:"是否使用投影仪",
        isComputer:"是否使用电脑",
        isSound:"是否使用音响",
        events:"活动内容",
        aim:"使用目的"
    },

    codeToState: {
        [2]: "等待中",
        [3]: "已同意",
        [4]: "已拒绝",
        [5]: "已完成",
        [6]: "已取消",
        [7]: "已过期"
    },

    getOfficeHourFormatData(originData) {
        const dataAfterFormat = []

        originData.forEach((item, index) => {
            dataAfterFormat.push({
                id: item.id,
                originIndex: index,
                student_name: item.student_name,
                teacher_name: item.teacher_name,
                date: this.handleDate(item.time.date),
                startTime: this.handleTime(item.time.startTime),
                endTime: this.handleTime(item.time.endTime),
                note: item.note,
                question: item.question,
                state: item.state,
                operation: 2,
                originalDate: item.time.date
            })
        })

        return dataAfterFormat
    },

    getClassroomFormatData(originData){
        const dataAfterFormat = []
        console.log("教室",originData)

        originData.forEach((item, index) => {
            dataAfterFormat.push({
                id: item.id,
                originIndex: index,
                applicant: item.applicant,
                classroom: item.classroom,
                date: this.handleDate(item.time.date),
                startTime: this.handleTime(item.time.startTime),
                endTime: this.handleTime(item.time.endTime),
                isMedia:item.isMedia?"是":"否",
                isComputer:item.isComputer?"是":"否",
                isSound:item.isSound?"是":"否",
                aim:item.aim,
                state: item.state,
                events: item.events,
                operation: 2,
                originalDate: item.time.date
            })
        })
        return dataAfterFormat
    },

    /**
     * 处理时间的显示
     */
    handleTime(timestamp) {
        const dateTime = new Date(timestamp)
        return `${dateTime.getHours() > 9 ? dateTime.getHours() : '0' + dateTime.getHours()}:${dateTime.getMinutes() > 9 ? dateTime.getMinutes() : '0' + dateTime.getMinutes()}`
    },

    handleDate(timestamp) {
        const date = new Date(timestamp)
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    },

    /**
     * 转化成详细信息的格式
     * @param data
     */
    getDetailFormat(data) {
        const formatData = [];
        for (const item in data) {
            if (item === "id") continue
            if (!data[item]) continue

            if (item === "time") {
                const time = data[item]
                const date = {
                    head: "日期",
                    data: this.handleDate(time.date)
                }
                const startTime = {
                    head: "开始时间",
                    data: this.handleTime(time.startTime)
                }
                const endTime = {
                    head: "结束时间",
                    data: this.handleTime(time.endTime)
                }
                formatData.push(date, startTime, endTime)
            } else if (item === "state") {
                const state = this.codeToState[data[item]]
                formatData.push({
                    head: this.headToCn[item],
                    data: state
                })
            } else {
                formatData.push({
                    head: this.headToCn[item],
                    data: data[item]
                })
            }
        }

        return formatData;
    },

    /**
     * 对比现在的日期和指定的日期
     */
    compareDate(targetDate){
        let today = new Date()
        today = new Date(today.getFullYear(),today.getMonth(),today.getDate())
        targetDate = new Date(targetDate)
        targetDate = new Date(targetDate.getFullYear(),targetDate.getMonth(),targetDate.getDate())
        const diff = (targetDate - today) / (1000*60*60*24);

        return diff >= 2

    }

}

export default EventUtils