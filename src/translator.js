require('dotenv').config();
const axios = require('axios');
const i18n = require('./i18n');

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const PRIMARY_TRANSLATION_SERVICE = i18n.getTranslation('deepl_service_name', 'zh-TW');
const SECONDARY_TRANSLATION_SERVICE = null;

console.log(i18n.getTranslation('translator_deepl_api_key', 'zh-TW'), DEEPL_API_KEY ? i18n.getTranslation('config_set', 'zh-TW') : i18n.getTranslation('config_not_set', 'zh-TW'));
console.log(i18n.getTranslation('translator_primary_translation_service', 'zh-TW'), PRIMARY_TRANSLATION_SERVICE);

// DeepL 支援語言代碼對應表
const DEEPL_LANG_MAP = {
    'en': 'EN',
    'zh-TW': 'ZH',
    'zh-CN': 'ZH',
    'ja': 'JA',
    'fr': 'FR',
    'de': 'DE',
    'es': 'ES',
    'pt': 'PT',
    'ru': 'RU',
    'it': 'IT',
    'pl': 'PL',
    'nl': 'NL',
    'sv': 'SV',
    'da': 'DA',
    'norsk': 'NO', // 修正：DeepL 不支援 'no'，應為 'nb' 或 'nn'，但這裡先保留 'no'
    'suomi': 'FI',
    'tr': 'TR',
    'id': 'ID',
    'vi': 'VI',
    'th': 'TH',
    'filipino': 'FIL',
    'uk': 'UK',
    'cs': 'CS',
    // 其他語言可依需求補充
};

async function translateText(text, targetLanguage) {
    if (!text || !targetLanguage) {
        console.error(i18n.getTranslation('translation_text_or_target_language_empty', 'zh-TW'));
        return null;
    }
    let translatedText = null;
    const deeplTarget = DEEPL_LANG_MAP[targetLanguage] || targetLanguage.toUpperCase();
    if (DEEPL_API_KEY) {
        try {
            console.log(`DeepL API 呼叫的目標語言 (target_lang): ${deeplTarget}`);
            const response = await axios.post('https://api-free.deepl.com/v2/translate', {
                text: [text],
                target_lang: deeplTarget,
            }, {
                headers: {
                    'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            translatedText = response.data.translations[0].text;
            console.log(`使用 DeepL 翻譯成功。`);
        } catch (error) {
            console.error(i18n.getTranslation('deepl_translation_error', 'zh-TW'), error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        }
    }
    if (translatedText === null) {
        console.error(i18n.getTranslation('all_translation_services_failed', 'zh-TW'));
    }
    return translatedText;
}

async function detectLanguage(text) {
    if (!text) {
        console.error(i18n.getTranslation('text_for_language_detection_empty', 'zh-TW'));
        return null;
    }
    let detectedLang = null;
    if (DEEPL_API_KEY) {
        try {
            // ${i18n.getTranslation('deepl_no_official_detect_endpoint', 'zh-TW')}
            const response = await axios.post('https://api-free.deepl.com/v2/translate', {
                text: [text],
                target_lang: 'EN',
            }, {
                headers: {
                    'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            detectedLang = response.data.translations[0].detected_source_language.toLowerCase();
            console.log(`使用 DeepL 檢測語言成功。`);
        } catch (error) {
            console.error(i18n.getTranslation('deepl_language_detection_error', 'zh-TW'), error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        }
    }
    if (detectedLang === null) {
        console.error(i18n.getTranslation('all_language_detection_services_failed', 'zh-TW'));
    }
    return detectedLang;
}

module.exports = {
    translateText,
    detectLanguage,
};
