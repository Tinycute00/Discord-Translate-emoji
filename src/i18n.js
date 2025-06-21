const enTranslations = require('../locales/en.json');
const zhTWTranslations = require('../locales/zh-TW.json');

const translations = {
    'en': enTranslations,
    'zh-TW': zhTWTranslations
};

let currentLanguage = 'zh-TW'; // 預設語言

function getTranslation(key, lang = currentLanguage, params = {}) {
    const langTranslations = translations[lang];
    if (langTranslations && langTranslations[key]) {
        let translation = langTranslations[key];
        // 替換翻譯中的參數
        for (const paramKey in params) {
            translation = translation.replace(`{${paramKey}}`, params[paramKey]);
        }
        return translation;
    }
    return key; // 如果找不到翻譯，返回 key 本身
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
    } else {
        console.warn(`Unsupported language: ${lang}. Keeping current language: ${currentLanguage}`);
    }
}

function getCurrentLanguage() {
    return currentLanguage;
}

module.exports = {
    getTranslation,
    setLanguage,
    getCurrentLanguage
};