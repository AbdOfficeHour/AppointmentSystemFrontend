import {createI18n} from 'vue-i18n'
import index_en from './index/en.json' assert {type: "json"}
import index_zh from './index/zh.json' assert {type: "json"}
import user_en from './user/en.json' assert {type: "json"}
import user_zh from './user/zh.json' assert {type: "json"}
import appointment_list_en from './appointment_list/en.json' assert {type: "json"}
import appointment_list_zh from './appointment_list/zh.json' assert {type: "json"}
import appointment_en from './appointment/en.json' assert {type: "json"}
import appointment_zh from './appointment/zh.json' assert {type: "json"}
import other_en from './other/en.json' assert {type: "json"}
import other_zh from './other/zh.json' assert {type: "json"}

const messages = {
    en: {
        index: index_en,
        user: user_en,
        appointment_list: appointment_list_en,
        appointment: appointment_en,
        other: other_en,
    },
    zh: {
        index: index_zh,
        user: user_zh,
        appointment_list: appointment_list_zh,
        appointment: appointment_zh,
        other: other_zh,
    }
}

const i18n = createI18n({
    locale: 'zh', // 使用的语言，这里默认为zh中文
    legacy: false,
    messages,
})

export default i18n