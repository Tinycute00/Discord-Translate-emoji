const fs = require('node:fs/promises');
const path = require('node:path');
const i18n = require('./i18n');

const CONFIG_FILE = path.resolve(__dirname, '..', 'config.json');

// 內部快取，用於儲存 Guild 配置
const guildConfigs = {};

async function loadConfig() {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(i18n.getTranslation('config_json_not_found', 'zh-TW'));
            return {};
        }
        console.error(i18n.getTranslation('error_loading_config', 'zh-TW'), error);
        return {};
    }
}

async function saveConfig(config) {
    try {
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
        console.log(i18n.getTranslation('config_saved_successfully', 'zh-TW'));
    } catch (error) {
        console.error(i18n.getTranslation('error_saving_config', 'zh-TW'), error);
    }
}

async function loadGuildConfig(guildId) {
    // 如果快取中存在，直接返回快取值
    if (guildConfigs[guildId]) {
        return guildConfigs[guildId];
    }

    const allConfig = await loadConfig();
    if (!allConfig[guildId]) {
        // 預設空設定
        allConfig[guildId] = {
            emojis: [],
            languageRoles: {},
            monitoredChannels: [],
            defaultLanguage: 'zh-TW'
        };
        await saveConfig(allConfig);
    }
    // 將讀取到的配置存入快取
    guildConfigs[guildId] = allConfig[guildId];
    return guildConfigs[guildId];
}

async function saveGuildConfig(guildId, guildConfig) {
    const allConfig = await loadConfig();
    allConfig[guildId] = guildConfig;
    await saveConfig(allConfig);
    // 更新快取
    guildConfigs[guildId] = guildConfig;
}

async function getGuildLanguage(guildId) {
    const guildConfig = await loadGuildConfig(guildId);
    return guildConfig.defaultLanguage || 'zh-TW';
}

async function setGuildLanguage(guildId, language) {
    const allConfig = await loadConfig();
    if (!allConfig[guildId]) {
        allConfig[guildId] = {
            emojis: [],
            languageRoles: {},
            monitoredChannels: [],
            defaultLanguage: 'zh-TW'
        };
    }
    allConfig[guildId].defaultLanguage = language;
    await saveConfig(allConfig);
    // 更新快取
    guildConfigs[guildId] = allConfig[guildId];
}

module.exports = {
    loadConfig,
    saveConfig,
    loadGuildConfig,
    saveGuildConfig,
    getGuildLanguage,
    setGuildLanguage
};
