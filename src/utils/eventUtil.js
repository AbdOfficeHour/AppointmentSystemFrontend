/**
 * 我的预约事件管理器
 */
import i18n from "@/i18n/index.js";
const t = i18n.global.t;

const EventUtils = {

    headToCn: {
        student_name: t("appointment_list.detailMessage.student_name"),
        teacher_name: t("appointment_list.detailMessage.teacher_name"),
        note: t("appointment_list.detailMessage.note"),
        question: t("appointment_list.detailMessage.question"),
        present: t("appointment_list.detailMessage.present"),
        state: t("appointment_list.detailMessage.state"),
        refuse_reason: t("appointment_list.detailMessage.refuse_result"),
        work_summary: t("appointment_list.detailMessage.work_summary"),
        withdraw_reason: t("appointment_list.detailMessage.withdrawl_reason"),
        teacher_room: t("appointment_list.detailMessage.teacher_room"),
        teacher_course: t("appointment_list.detailMessage.teacher_course"),
        applicant: t("appointment_list.detailMessage.applicant"),
        approver: t("appointment_list.detailMessage.approver"),
        classroom: t("appointment_list.detailMessage.classroom"),
        isMedia: t("appointment_list.detailMessage.isMedia"),
        isComputer: t("appointment_list.detailMessage.isComputer"),
        isSound: t("appointment_list.detailMessage.isSound"),
        events: t("appointment_list.detailMessage.events"),
        aim: t("appointment_list.detailMessage.aim"),
        flag: t("appointment_list.detailMessage.flag")
    },

    codeToState: {
        [2]: t("appointment_list.stateIcon.2"),
        [3]: t("appointment_list.stateIcon.3"),
        [4]: t("appointment_list.stateIcon.4"),
        [5]: t("appointment_list.stateIcon.5"),
        [6]: t("appointment_list.stateIcon.6"),
        [7]: t("appointment_list.stateIcon.7")
    },

    updateTranslations() {
        this.headToCn = {
            student_name: t("appointment_list.detailMessage.student_name"),
            teacher_name: t("appointment_list.detailMessage.teacher_name"),
            note: t("appointment_list.detailMessage.note"),
            question: t("appointment_list.detailMessage.question"),
            present: t("appointment_list.detailMessage.present"),
            state: t("appointment_list.detailMessage.state"),
            refuse_reason: t("appointment_list.detailMessage.refuse_result"),
            work_summary: t("appointment_list.detailMessage.work_summary"),
            withdraw_reason: t("appointment_list.detailMessage.withdrawl_reason"),
            teacher_room: t("appointment_list.detailMessage.teacher_room"),
            teacher_course: t("appointment_list.detailMessage.teacher_course"),
            applicant: t("appointment_list.detailMessage.applicant"),
            approver: t("appointment_list.detailMessage.approver"),
            classroom: t("appointment_list.detailMessage.classroom"),
            isMedia: t("appointment_list.detailMessage.isMedia"),
            isComputer: t("appointment_list.detailMessage.isComputer"),
            isSound: t("appointment_list.detailMessage.isSound"),
            events: t("appointment_list.detailMessage.events"),
            aim: t("appointment_list.detailMessage.aim"),
            flag: t("appointment_list.detailMessage.flag")
        }
        this.codeToState = {
            [2]: t("appointment_list.stateIcon.2"),
            [3]: t("appointment_list.stateIcon.3"),
            [4]: t("appointment_list.stateIcon.4"),
            [5]: t("appointment_list.stateIcon.5"),
            [6]: t("appointment_list.stateIcon.6"),
            [7]: t("appointment_list.stateIcon.7")
        }
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

    getClassroomFormatData(originData) {
        const dataAfterFormat = []
        console.log("教室", originData)

        originData.forEach((item, index) => {
            dataAfterFormat.push({
                id: item.id,
                originIndex: index,
                applicant: item.applicant,
                classroom: item.classroom,
                date: this.handleDate(item.time.date),
                startTime: this.handleTime(item.time.startTime),
                endTime: this.handleTime(item.time.endTime),
                isMedia: item.isMedia ? "是" : "否",
                isComputer: item.isComputer ? "是" : "否",
                isSound: item.isSound ? "是" : "否",
                aim: item.aim,
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

            if (item === "time") {
                const time = data[item]
                const date = {
                    head: t("appointment_list.detailMessage.date"),
                    data: this.handleDate(time.date)
                }
                const startTime = {
                    head: t("appointment_list.detailMessage.startTime"),
                    data: this.handleTime(time.startTime)
                }
                const endTime = {
                    head: t("appointment_list.detailMessage.endTime"),
                    data: this.handleTime(time.endTime)
                }
                formatData.push(date, startTime, endTime)
            } else if (typeof data[item] == "boolean") {
                // 针对布尔类型的值做特殊处理
                const displayData = data[item] ? t("appointment_list.detailMessage.true") : t("appointment_list.detailMessage.false")

                formatData.push({
                    head: this.headToCn[item],
                    data: displayData
                })
            } else if (item === "state") {
                const state = this.codeToState[data[item]]
                formatData.push({
                    head: this.headToCn[item],
                    data: state
                })
            } else if (item === "present") {
                const present = data[item]

                if (present.length <= 0) {
                    formatData.push({
                        head: this.headToCn[item],
                        data: t("appointment_list.detailMessage.noPresent")
                    })
                } else {
                    formatData.push({
                        head: this.headToCn[item],
                        data: present
                    })
                }

            } else if (item === "flag") { }
            else {

                let displayData = data[item];
                if (!displayData) {
                    displayData = t("appointment_list.detailMessage.null")
                }

                formatData.push({
                    head: this.headToCn[item],
                    data: displayData
                })
            }
        }

        return formatData;
    },

    /**
     * 对比现在的日期和指定的日期
     */
    compareDate(targetDate) {
        let today = new Date()
        today = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        targetDate = new Date(targetDate)
        targetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
        const diff = (targetDate - today) / (1000 * 60 * 60 * 24);

        return diff >= 2

    }

}

export default EventUtils