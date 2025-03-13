import {createI18n} from "vue-i18n";
import index_en from "./index/en.json" assert {type: "json"};
import index_zh from "./index/zh.json" assert {type: "json"};
import user_en from "./user/en.json" assert {type: "json"};
import user_zh from "./user/zh.json" assert {type: "json"};
import appointment_list_en from "./appointment_list/en.json" assert {type: "json"};
import appointment_list_zh from "./appointment_list/zh.json" assert {type: "json"};
import classroom_form_en from "./forms/classroomForm/en.json" assert {type: "json"};
import classroom_form_zh from "./forms/classroomForm/zh.json" assert {type: "json"};
import officeHour_form_en from "./forms/officehourForm/en.json" assert {type: "json"};
import officeHour_form_zh from "./forms/officehourForm/zh.json" assert {type: "json"};
import time_bar_en from "./time_bar/en.json" assert {type: "json"};
import time_bar_zh from "./time_bar/zh.json" assert {type: "json"};
import other_en from "./other/en.json" assert {type: "json"};
import other_zh from "./other/zh.json" assert {type: "json"};
import navigation_en from './navigation/en.json' assert {type: "json"}
import navigation_zh from './navigation/zh.json' assert {type: "json"}
import setting_en from './setting/en.json' assert {type: "json"}
import setting_zh from './setting/zh.json' assert {type: "json"}
import web_connection_en from './web_connection/en.json' assert {type: "json"}
import web_connection_zh from './web_connection/zh.json' assert {type: "json"}

const messages = {
    en: {
        index: index_en,
        user: user_en,
        appointment_list: appointment_list_en,
        classroom_form: classroom_form_en,
        officeHour_form: officeHour_form_en,
        time_bar: time_bar_en,
        other: other_en,
        navigation: navigation_en,
        setting: setting_en,
        web_connection: web_connection_en
    },
    zh: {
        index: index_zh,
        user: user_zh,
        appointment_list: appointment_list_zh,
        classroom_form: classroom_form_zh,
        officeHour_form: officeHour_form_zh,
        time_bar: time_bar_zh,
        other: other_zh,
        navigation: navigation_zh,
        setting: setting_zh,
        web_connection: web_connection_zh
    }
}

const i18n = createI18n({
    locale: localStorage.getItem("preferLanguage"), // 默认语言
    legacy: false,
    messages,
});

export default i18n;
