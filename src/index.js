require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, ChannelType, MessageFlags } = require('discord.js');
const { sendSetupMenu, handleSetEmoji, handleSetRoles, handleSetChannels, handleLanguageSelect, handleRoleSelect, handleDeleteLanguageRole, handleLanguageDeleteSelect, handleChannelSelect, handlePagination, handleEmojiModalSubmit, handleSetLanguage } = require('./configHandler');
const { loadGuildConfig, saveGuildConfig, getGuildLanguage } = require('./configManager');
const { translateText, detectLanguage } = require('./translator');
const { SlashCommandBuilder } = require('@discordjs/builders');
const i18n = require('./i18n');

// 檢查訊息是否僅包含 Discord 表情符號的輔助函數
function containsDiscordCustomEmoji(text) {
    // Discord 自訂表情符號的正規表達式：<:name:id> 或 <a:name:id>
    const customEmojiRegex = /<a?:[a-zA-Z0-9_]+:[0-9]+>/;
    return customEmojiRegex.test(text);
}

// 檢查訊息是否僅包含 Discord 自訂表情符號的輔助函數
function isMessageOnlyCustomEmojis(text) {
    const customEmojiRegex = /<a?:[a-zA-Z0-9_]+:[0-9]+>/g; // 使用 g 旗標進行全域匹配
    const originalTextTrimmed = text.trim();

    // 如果原始訊息為空，則不可能是僅包含表情符號
    if (!originalTextTrimmed) {
        return false;
    }

    // 移除所有 Discord 自訂表情符號
    const textWithoutCustomEmojis = originalTextTrimmed.replace(customEmojiRegex, '');

    // 檢查移除自訂表情符號後，剩餘的字串是否為空或只包含空白字元
    // 同時確保原始字串中確實包含至少一個 Discord 自訂表情符號
    return textWithoutCustomEmojis.trim().length === 0 && customEmojiRegex.test(originalTextTrimmed);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });

console.log(i18n.getTranslation('attempting_to_load_axios', i18n.getCurrentLanguage()));
try {
    const axiosTest = require('axios');
    console.log(i18n.getTranslation('axios_load_success', i18n.getCurrentLanguage()), axiosTest !== null);
} catch (e) {
    console.error(i18n.getTranslation('axios_load_failed', i18n.getCurrentLanguage()), e.message);
}

console.log(i18n.getTranslation('discord_token', i18n.getCurrentLanguage()), process.env.DISCORD_TOKEN ? i18n.getTranslation('config_set', i18n.getCurrentLanguage()) : i18n.getTranslation('config_not_set', i18n.getCurrentLanguage()));
console.log(i18n.getTranslation('translation_service', i18n.getCurrentLanguage()), process.env.TRANSLATION_SERVICE);
console.log(i18n.getTranslation('google_translate_api_key', i18n.getCurrentLanguage()), process.env.GOOGLE_TRANSLATE_API_KEY ? i18n.getTranslation('config_set', i18n.getCurrentLanguage()) : i18n.getTranslation('config_not_set', i18n.getCurrentLanguage()));
console.log(i18n.getTranslation('deepl_api_key', i18n.getCurrentLanguage()), process.env.DEEPL_API_KEY ? i18n.getTranslation('config_set', i18n.getCurrentLanguage()) : i18n.getTranslation('config_not_set', i18n.getCurrentLanguage()));
console.log(i18n.getTranslation('client_id', i18n.getCurrentLanguage()), process.env.CLIENT_ID ? i18n.getTranslation('config_set', i18n.getCurrentLanguage()) : i18n.getTranslation('config_not_set', i18n.getCurrentLanguage()), process.env.CLIENT_ID);

// 定義斜線命令
const commands = [
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription(i18n.getTranslation('setting_up_bot_for_emoji_translation', i18n.getCurrentLanguage()))
        .toJSON(),
];

client.once('ready', async () => {
    console.log(`${i18n.getTranslation('logged_in_as', i18n.getCurrentLanguage())} ${client.user.tag}!`);

    // 初始化所有 Guild 的語言設定
    for (const guild of client.guilds.cache.values()) {
        const lang = await getGuildLanguage(guild.id);
        i18n.setLanguage(lang); // 確保在啟動時為每個 Guild 設定語言
        console.log(`Guild ${guild.name} (${guild.id}) 的語言設定為: ${lang}`);
    }

    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (!clientId) {
        console.error(i18n.getTranslation('error_client_id_not_set', i18n.getCurrentLanguage()));
        return;
    }

    // 生成邀請連結
    const permissions = '8'; // Administrator 權限的位元值
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
    console.log(`請使用此連結邀請機器人到您的公會並授予所需權限：\n${inviteUrl}`);

    // 註冊應用程式 (/) 命令 (全域)
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    console.log(i18n.getTranslation('client_id', i18n.getCurrentLanguage()), clientId ? i18n.getTranslation('config_set', i18n.getCurrentLanguage()) : i18n.getTranslation('config_not_set', i18n.getCurrentLanguage()), clientId);

    try {
        console.log(i18n.getTranslation('start_refreshing_slash_commands_global', i18n.getCurrentLanguage()));
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log(i18n.getTranslation('successfully_refreshed_slash_commands_global', i18n.getCurrentLanguage()), data);
    } catch (error) {
        console.error(i18n.getTranslation('error_refreshing_slash_commands', i18n.getCurrentLanguage()), error);
        if (error.code === 50001) {
            console.error(i18n.getTranslation('error_missing_permissions', i18n.getCurrentLanguage()));
        } else {
            console.error(i18n.getTranslation('other_error', i18n.getCurrentLanguage()), error.message);
        }
    }
});

// 儲存已翻譯訊息的 ID，避免重複翻譯
const translatedMessages = new Set();

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; // i18n.getTranslation('ignoring_bot_own_reaction', i18n.getCurrentLanguage())

    const { message, emoji } = reaction;
    // 取得用戶成員物件（移到最前面）
    const member = await message.guild.members.fetch(user.id);
    const guildId = message.guild.id;
    const config = await loadGuildConfig(guildId);
    const { monitoredChannels, emojis, languageRoles } = config;

    // 檢查是否為監視頻道
    if (!monitoredChannels || !monitoredChannels.includes(message.channel.id)) {
        return;
    }

    // 檢查是否為設定的 emoji
    if (!emojis || !emojis.includes(emoji.name)) {
        return;
    }

    // 檢查訊息是否已被翻譯過
    if (translatedMessages.has(message.id)) {
        console.log(`訊息 ${message.id} 已被翻譯過，跳過。`);
        return;
    }

    // 獲取使用者持有的所有語言身分組
    let userLangs = [];
    if (languageRoles) {
        for (const [langCode, roleIds] of Object.entries(languageRoles)) {
            // 檢查用戶是否擁有該語言對應的任何一個身分組
            if (Array.isArray(roleIds) && roleIds.some(id => member.roles.cache.has(id))) {
                userLangs.push(langCode);
            } else if (typeof roleIds === 'string' && member.roles.cache.has(roleIds)) {
                // i18n.getTranslation('compatible_with_old_single_role_id_format', i18n.getCurrentLanguage())
                userLangs.push(langCode);
            }
        }
    }

    if (!userLangs.length) {
        await message.channel.send({ content: `${i18n.getTranslation('error_no_target_language_role_set', 'zh-TW')}\n${i18n.getTranslation('error_no_target_language_role_set', 'en')}`, reply: { messageReference: message.id } });
        return;
    }

    const originalText = message.content;
    if (!originalText) {
        console.log(i18n.getTranslation('original_message_content_empty', i18n.getCurrentLanguage()));
        return;
    }

    let textToTranslate = originalText;
    if (containsDiscordCustomEmoji(originalText)) {
        // 移除 Discord 自訂表情符號，只保留文字和通用 Unicode 表情符號
        textToTranslate = originalText.replace(/<a?:[a-zA-Z0-9_]+:[0-9]+>/g, '');
        console.log('訊息包含 Discord 自訂表情符號，翻譯前已移除表情符號。');
    }

    if (!textToTranslate.trim()) { // 如果移除表情符號後只剩下空白或空字串，則不進行翻譯
        console.log('移除 Discord 自訂表情符號後，訊息內容為空，跳過翻譯。');
        return;
    }

    // 檢測原始語言
    let detectedLang = null;
    try {
        detectedLang = await detectLanguage(textToTranslate);
    } catch (e) {
        console.error(i18n.getTranslation('language_detection_exception', i18n.getCurrentLanguage()), e);
    }
    let targetLangs = [];
    let translationNeeded = true; // 預設需要翻譯

    if (detectedLang) {
        // 偵測成功，排除原文語言，只比較主語言代碼
        const baseDetectedLang = detectedLang.toLowerCase().split('-')[0];
        targetLangs = userLangs.filter(lang => {
            const baseLang = lang.toLowerCase().split('-')[0];
            return baseLang !== baseDetectedLang;
        });

        if (targetLangs.length === 0) {
            // 原始語言與所有目標語言相同，無需翻譯
            console.log(`原始語言 (${detectedLang}) 與用戶所有目標語言相同，無需翻譯，保持靜默。`);
            translationNeeded = false;
        }
    } else {
        // 無法偵測原始語言，全部都翻譯，並發送提示
        targetLangs = userLangs;
        await message.channel.send({ content: `${i18n.getTranslation('error_cannot_detect_language', 'zh-TW')}\n${i18n.getTranslation('error_cannot_detect_language', 'en')}`, reply: { messageReference: message.id } });
    }

    if (!translationNeeded) {
        return; // 無需翻譯，直接返回，保持靜默
    }

    if (targetLangs.length === 0) {
        // 如果偵測失敗後，目標語言列表仍然為空，則無需翻譯
        console.log(`偵測失敗後，用戶沒有設定任何目標語言，無需翻譯。`);
        return;
    }

    let hasSuccess = false;
    for (const targetLanguage of targetLangs) {
        console.log(`${i18n.getTranslation('attempting_to_translate_message', i18n.getCurrentLanguage())} ${message.id} ${i18n.getTranslation('from', i18n.getCurrentLanguage())} ${detectedLang || i18n.getTranslation('unknown', i18n.getCurrentLanguage())} ${i18n.getTranslation('to', i18n.getCurrentLanguage())} ${targetLanguage}`);
        const translatedText = await translateText(textToTranslate, targetLanguage);
        if (translatedText) {
            await message.channel.send({ content: translatedText, reply: { messageReference: message.id } });
            hasSuccess = true;
        } else {
            console.warn(`翻譯到 ${targetLanguage} 失敗。`);
        }
    }

    if (hasSuccess) {
        translatedMessages.add(message.id); // 標記為已翻譯
        console.log(`訊息 ${message.id} 翻譯成功並已標記。`);
    } else {
        await message.channel.send({ content: `${i18n.getTranslation('error_translation_failed_try_again', 'zh-TW')}\n${i18n.getTranslation('error_translation_failed_try_again', 'en')}`, reply: { messageReference: message.id } });
        console.error(`訊息 ${message.id} 翻譯完全失敗。`);
    }
});
 
 client.on('messageCreate', async message => {
     if (message.author.bot) return; // i18n.getTranslation('ignoring_bot_own_message', i18n.getCurrentLanguage())
 
     const guildId = message.guild.id;
    const config = await loadGuildConfig(guildId);
    const { monitoredChannels, emojis } = config;

    // 檢查是否為監視頻道
    if (!monitoredChannels || !monitoredChannels.includes(message.channel.id)) {
        return;
    }

    // 檢查訊息是否僅包含 Discord 自訂表情符號
    // 如果訊息內容僅包含 Discord 自訂表情符號，則跳過反映操作。
    // 在所有其他情況下（即訊息包含文字，無論是否帶有表情符號，或僅包含通用 Unicode 表情符號），都應正常添加反映。
    if (isMessageOnlyCustomEmojis(message.content)) {
        console.log('訊息僅包含 Discord 自訂表情符號，跳過反映。');
        return;
    }

    // 對每個訊息反映設定的 emoji
    if (emojis && emojis.length > 0) {
        for (const emojiIdentifier of emojis) {
            try {
                // 嘗試使用 Discord 內建的表情符號或自訂表情符號
                // Discord.js 會自動解析 <:name:id> 或 <a:name:id> 格式
                await message.react(emojiIdentifier);
                console.log(`成功對訊息 ${message.id} 反映 emoji ${emojiIdentifier}`);
            } catch (error) {
                console.error(`無法對訊息 ${message.id} 反映 emoji ${emojiIdentifier}:`, error);
                // 如果是自訂表情符號且機器人不在該伺服器，或者沒有權限，會失敗
                // 可以考慮在這裡添加更詳細的錯誤處理，例如檢查權限
            }
        }
    }
});

// 處理互動
client.on('interactionCreate', async interaction => {
    // 確保在處理任何互動之前，根據 Guild 的最新配置設定語言
    const guildId = interaction.guild.id;
    const currentLanguage = await getGuildLanguage(guildId);
    i18n.setLanguage(currentLanguage);

    if (interaction.isCommand()) {
        const { commandName } = interaction;
        if (commandName === 'setup') {
            await sendSetupMenu(interaction);
        }
    } else if (interaction.isButton()) {
        const { customId } = interaction;
        if (customId.startsWith('paginate_roles_')) {
            await interaction.deferUpdate({ ephemeral: true });
            await handlePagination(interaction);
        } else if (customId.startsWith('paginate_channels_prev_')) {
            const page = parseInt(customId.replace('paginate_channels_prev_', ''));
            await interaction.deferUpdate({ ephemeral: true });
            await handleSetChannels(interaction, page);
        } else if (customId.startsWith('paginate_channels_next_')) {
            const page = parseInt(customId.replace('paginate_channels_next_', ''));
            await interaction.deferUpdate({ ephemeral: true });
            await handleSetChannels(interaction, page);
        } else if (customId === 'set_language_en' || customId === 'set_language_zh-TW') {
            await interaction.deferUpdate({ ephemeral: true });
            await handleSetLanguage(interaction);
            // 語言切換後，重新發送設定菜單以更新介面語言
            await sendSetupMenu(interaction);
        } else {
            console.log(`[DEBUG] Button customId received: ${interaction.customId}`);
            switch (customId) {
                case 'setup_emoji':
                    console.log('[DEBUG] Calling handleSetupEmoji...');
                    await handleSetEmoji(interaction);
                    console.log('[DEBUG] handleSetupEmoji finished.');
                    break;
                case 'setup_language_role':
                    await interaction.deferUpdate({ ephemeral: true });
                    await handleSetRoles(interaction);
                    break;
                case 'setup_monitored_channel':
                    await interaction.deferUpdate({ ephemeral: true });
                    await handleSetChannels(interaction);
                    break;
                case 'delete_language_role':
                    await interaction.deferUpdate({ ephemeral: true });
                    await handleDeleteLanguageRole(interaction);
                    break;
                default:
                    console.log(`${i18n.getTranslation('unknown_button_custom_id', i18n.getCurrentLanguage())} ${customId}`);
                    await interaction.editReply({ content: i18n.getTranslation('unknown_setup_button', i18n.getCurrentLanguage()), components: [], flags: [MessageFlags.Ephemeral] });
                    break;
            }
        }
    } else if (interaction.isStringSelectMenu()) {
        await interaction.deferUpdate({ ephemeral: true });
        const { customId } = interaction;
        if (customId === 'select_language_for_role') {
            await handleLanguageSelect(interaction);
        } else if (customId.startsWith('select_role_for_language_')) {
            await handleRoleSelect(interaction);
        } else if (customId === 'select_language_to_delete') {
            await handleLanguageDeleteSelect(interaction);
        } else if (customId.startsWith('select_monitored_channels_')) {
            // 多下拉選單合併
            const guildId = interaction.guild.id;
            const config = await loadGuildConfig(guildId); // 確保重新載入最新配置
            // 收集所有下拉選單的值
            const allSelected = [];
            for (const [id, comp] of interaction.message.components.entries()) {
                const menu = comp.components[0];
                if (menu.data.custom_id.startsWith('select_monitored_channels_')) {
                    if (menu.data.custom_id === customId) {
                        allSelected.push(...interaction.values);
                    } else if (menu.data.value) {
                        allSelected.push(...menu.data.value);
                    }
                }
            }
            config.monitoredChannels = [...new Set(allSelected)];
            await saveGuildConfig(guildId, config);
            await interaction.editReply({ content: i18n.getTranslation('monitored_channels_set_successfully', i18n.getCurrentLanguage()), components: [], flags: [MessageFlags.Ephemeral] });
            sendSetupMenu(interaction); // 重新發送設定菜單以更新介面
        } else if (customId === 'select_language') {
            const language = interaction.values[0];
            await setGuildLanguage(guildId, language);
            i18n.setLanguage(language); // 設定當前語言
            await interaction.editReply({ content: i18n.getTranslation('language_switched_to', language), components: [], flags: [MessageFlags.Ephemeral] });
            sendSetupMenu(interaction); // 重新發送設定菜單以更新介面
        } else {
            console.log(`${i18n.getTranslation('unknown_select_menu_custom_id', i18n.getCurrentLanguage())} ${customId}`);
            await interaction.editReply({ content: i18n.getTranslation('unknown_setup_option', i18n.getCurrentLanguage()), components: [], flags: [MessageFlags.Ephemeral] });
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'emoji_modal') {
            await handleEmojiModalSubmit(interaction);
        } else {
            console.log(`${i18n.getTranslation('unknown_modal_custom_id', i18n.getCurrentLanguage())} ${interaction.customId}`);
            await interaction.reply({ content: i18n.getTranslation('unknown_setup_modal', i18n.getCurrentLanguage()), flags: [MessageFlags.Ephemeral] });
        }
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(i18n.getTranslation('uncaught_promise_rejection', i18n.getCurrentLanguage()), reason);
});
process.on('uncaughtException', (err) => {
    console.error(i18n.getTranslation('uncaught_exception', i18n.getCurrentLanguage()), err);
});
 
 try {
     console.log(i18n.getTranslation('starting_discord_login_attempt', i18n.getCurrentLanguage()));
     client.login(process.env.DISCORD_TOKEN);
     console.log(i18n.getTranslation('client_login_called', i18n.getCurrentLanguage()));
 } catch (err) {
     console.error(i18n.getTranslation('discord_login_failed', i18n.getCurrentLanguage()), err);
 }
