const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { loadGuildConfig, saveGuildConfig, setGuildLanguage, getGuildLanguage } = require('./configManager');
const i18n = require('./i18n');

const ITEMS_PER_PAGE = 25; // Discord Select Menu 的最大選項數

// 預定義的語言列表
const LANGUAGES = [
    { label: 'English', value: 'en', translationKey: 'language_code_EN' },
    { label: '繁體中文', value: 'zh-TW', translationKey: 'language_code_zh-TW' },
    { label: '简体中文', value: 'zh-CN', translationKey: 'language_code_zh-CN' },
    { label: '日本語', value: 'ja', translationKey: 'language_code_ja' },
    { label: '한국어', value: 'ko', translationKey: 'language_code_ko' },
    { label: 'Français', value: 'fr', translationKey: 'language_code_fr' },
    { label: 'Deutsch', value: 'de', translationKey: 'language_code_de' },
    { label: 'Español', value: 'es', translationKey: 'language_code_es' },
    { label: 'Português', value: 'pt', translationKey: 'language_code_pt' },
    { label: 'Русский', value: 'ru', translationKey: 'language_code_ru' },
    { label: 'العربية', value: 'ar', translationKey: 'language_code_ar' },
    { label: 'Italiano', value: 'it', translationKey: 'language_code_it' },
    { label: 'Polski', value: 'pl', translationKey: 'language_code_pl' },
    { label: 'Nederlands', value: 'nl', translationKey: 'language_code_nl' },
    { label: 'Svenska', value: 'sv', translationKey: 'language_code_sv' },
    { label: 'Dansk', value: 'da', translationKey: 'language_code_da' },
    { label: 'Norsk', value: 'no', translationKey: 'language_code_no' },
    { label: 'Suomi', value: 'fi', translationKey: 'language_code_fi' },
    { label: 'Türkçe', value: 'tr', translationKey: 'language_code_tr' },
    { label: 'Bahasa Indonesia', value: 'id', translationKey: 'language_code_id' },
    { label: 'Tiếng Việt', value: 'vi', translationKey: 'language_code_vi' },
    { label: 'ไทย', value: 'th', translationKey: 'language_code_th' },
    { label: 'Filipino', value: 'fil', translationKey: 'language_code_fil' },
    { label: 'Українська', value: 'uk', translationKey: 'language_code_uk' },
    { label: 'Čeština', value: 'cs', translationKey: 'language_code_cs' },
];

function getDashboardText(config) {
    const currentLanguage = i18n.getCurrentLanguage();
    const emojis = config.emojis && config.emojis.length ? config.emojis.join(' ') : i18n.getTranslation('not_set', currentLanguage);
    const languageRoles = config.languageRoles || {};
    const monitoredChannels = config.monitoredChannels || [];
    let langStr = i18n.getTranslation('not_set', currentLanguage);
    if (Object.keys(languageRoles).length) {
        langStr = Object.entries(languageRoles).map(([lang, roleIds]) => {
            const languageLabel = LANGUAGES.find(l => l.value === lang)?.label || lang;
            const rolesDisplay = Array.isArray(roleIds) ? roleIds.map(roleId => `<@&${roleId}>`).join(', ') : `<@&${roleIds}>`;
            return `• ${languageLabel} → ${rolesDisplay}`;
        }).join('\n');
    }
    let channelStr = i18n.getTranslation('not_set', currentLanguage);
    if (monitoredChannels.length) {
        channelStr = monitoredChannels.map(id => `<#${id}>`).join(' ');
    }
    return `**${i18n.getTranslation('current_settings_dashboard', currentLanguage)}**\n\n**${i18n.getTranslation('emoji', currentLanguage)}**: ${emojis}\n**${i18n.getTranslation('language_mappings', currentLanguage)}**:\n${langStr}\n**${i18n.getTranslation('monitored_channels', currentLanguage)}**: ${channelStr}`;
}

function getSetupMenuComponents(currentLanguage) {
    const setupRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('setup_emoji')
                .setLabel(i18n.getTranslation('set_bot_emoji', currentLanguage))
                .setStyle('Primary'),
            new ButtonBuilder()
                .setCustomId('setup_language_role')
                .setLabel(i18n.getTranslation('set_language_role_mapping', currentLanguage))
                .setStyle('Primary'),
            new ButtonBuilder()
                .setCustomId('setup_monitored_channel')
                .setLabel(i18n.getTranslation('set_monitored_channels', currentLanguage))
                .setStyle('Primary'),
        );

    const languageRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('set_language_en')
                .setLabel('EN')
                .setStyle('Secondary'),
            new ButtonBuilder()
                .setCustomId('set_language_zh-TW')
                .setLabel('繁體中文')
                .setStyle('Secondary'),
        );
    return [setupRow, languageRow];
}

function getLanguageSelectionComponents(currentLanguage) {
    const languageSelectRow = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_language')
                .setPlaceholder(i18n.getTranslation('select_a_language', currentLanguage))
                .addOptions(
                    LANGUAGES.map(lang =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(i18n.getTranslation(lang.translationKey, currentLanguage))
                            .setValue(lang.value)
                            .setDefault(lang.value === currentLanguage)
                    )
                )
        );
    return [languageSelectRow];
}

async function sendSetupMenu(interaction) {
    const guildId = interaction.guild.id;
    const config = await loadGuildConfig(guildId);
    const currentLanguage = await getGuildLanguage(guildId);
    i18n.setLanguage(currentLanguage); // 設定當前語言
    const content = i18n.getTranslation('setup_menu_description', currentLanguage) + '\n\n' + getDashboardText(config);
    const components = getSetupMenuComponents(currentLanguage);

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
            content: content,
            flags: [MessageFlags.Ephemeral],
            components: components,
        });
    } else {
        await interaction.reply({
            content: content,
            flags: [MessageFlags.Ephemeral],
            components: components,
        });
    }
}

async function handleSetEmoji(interaction) {
    console.log('[DEBUG] handleSetEmoji function entered.');
    const currentLanguage = await getGuildLanguage(interaction.guild.id);
    const modal = new ModalBuilder()
        .setCustomId('emoji_modal')
        .setTitle(i18n.getTranslation('set_bot_emoji', currentLanguage));

    const emojiInput = new TextInputBuilder()
        .setCustomId('emojiInput')
        .setLabel(i18n.getTranslation('enter_emoji_prompt', currentLanguage))
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(i18n.getTranslation('emoji_example_prompt', currentLanguage))
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(emojiInput);
    modal.addComponents(firstActionRow);
    console.log('[DEBUG] Modal object structure:', JSON.stringify(modal, null, 2));
    try {
        await interaction.showModal(modal);
    } catch (error) {
        console.error('[ERROR] Failed to show modal in handleSetupEmoji:', error);
        await interaction.reply({ content: `${i18n.getTranslation('error_showing_modal', 'zh-TW')}\n${i18n.getTranslation('error_showing_modal', 'en')}`, ephemeral: true });
    }
}

async function handleEmojiModalSubmit(interaction) {
    const emojiInput = interaction.fields.getTextInputValue('emojiInput');
    const emojis = emojiInput.split(/\s+/).filter(e => e.length > 0); // 以空格分割並過濾空字串
    const currentLanguage = await getGuildLanguage(interaction.guild.id);
    if (emojis.length === 0) {
        await interaction.reply({ content: `${i18n.getTranslation('enter_at_least_one_valid_emoji', 'zh-TW')}\n${i18n.getTranslation('enter_at_least_one_valid_emoji', 'en')}`, flags: [MessageFlags.Ephemeral] });
        return;
    }
    const config = await loadGuildConfig(interaction.guild.id);
    config.emojis = emojis; // 儲存多個表情符號
    await saveGuildConfig(interaction.guild.id, config);
    await interaction.update({ content: `${i18n.getTranslation('emoji_set_to', currentLanguage)}${emojis.join(' ')}`, components: [], flags: [MessageFlags.Ephemeral] });
    await sendSetupMenu(interaction);
}

async function handleSetRoles(interaction) {
    const currentLanguage = await getGuildLanguage(interaction.guild.id);
    const languageSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_language_for_role')
        .setPlaceholder(i18n.getTranslation('select_a_language', currentLanguage))
        .addOptions(
            LANGUAGES.map(lang =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(lang.label)
                    .setValue(lang.value)
            )
        );

    const row = new ActionRowBuilder().addComponents(languageSelectMenu);
    const deleteRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('delete_language_role')
            .setLabel(i18n.getTranslation('delete_language_mapping', currentLanguage))
            .setStyle('Danger')
    );
 
     await interaction.editReply({
         content: i18n.getTranslation('select_language_to_set_role', currentLanguage),
         components: [row, deleteRow],
         flags: [MessageFlags.Ephemeral]
     });
}

async function handleDeleteLanguageRole(interaction) {
    const guildId = interaction.guild.id;
    const config = await loadGuildConfig(guildId);
    const languageRoles = config.languageRoles || {};
    const options = Object.keys(languageRoles).map(langCode => {
        const lang = LANGUAGES.find(l => l.value === langCode);
        return {
            label: lang ? lang.label : langCode,
            value: langCode
        };
    });
    const currentLanguage = await getGuildLanguage(interaction.guild.id);
    if (options.length === 0) {
        await interaction.editReply({
            content: i18n.getTranslation('no_language_mappings_set', currentLanguage),
            components: [],
            flags: [MessageFlags.Ephemeral]
        });
        await sendSetupMenu(interaction);
        return;
    }
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_language_to_delete')
        .setPlaceholder(i18n.getTranslation('select_language_to_delete_mapping', currentLanguage))
        .addOptions(options);
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.editReply({
        content: i18n.getTranslation('select_language_to_delete_mapping', currentLanguage),
        components: [row],
        flags: [MessageFlags.Ephemeral]
    });
}

async function handleLanguageDeleteSelect(interaction) {
    const langCode = interaction.values[0];
    const guildId = interaction.guild.id;
    const config = await loadGuildConfig(guildId);
    if (config.languageRoles && config.languageRoles[langCode]) {
        delete config.languageRoles[langCode];
        await saveGuildConfig(guildId, config);
        await interaction.editReply({
            content: `${i18n.getTranslation('language_mapping_deleted', 'zh-TW', { lang: LANGUAGES.find(l => l.value === langCode)?.label || langCode })}\n${i18n.getTranslation('language_mapping_deleted', 'en', { lang: LANGUAGES.find(l => l.value === langCode)?.label || langCode })}`,
            components: [],
            flags: [MessageFlags.Ephemeral]
        });
    } else {
        await interaction.editReply({
            content: i18n.getTranslation('language_mapping_does_not_exist', currentLanguage),
            components: [],
            flags: [MessageFlags.Ephemeral]
        });
    }
    await sendSetupMenu(interaction);
}

async function createRoleSelectMenus(interaction, langCode) {
    const guildId = interaction.guild.id;
    const roles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => ({ label: role.name, value: role.id }));

    const ITEMS_PER_MENU = 25;
    const selectMenus = [];
    for (let i = 0; i < roles.length; i += ITEMS_PER_MENU) {
        const paginatedRoles = roles.slice(i, i + ITEMS_PER_MENU);
        selectMenus.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`select_role_for_language_${langCode}_${i / ITEMS_PER_MENU}`)
                    .setPlaceholder(`選擇身分組 (${i + 1}~${i + paginatedRoles.length})`)
                    .setMinValues(1) // 確保至少選擇一個身分組
                    .setMaxValues(paginatedRoles.length > 0 ? paginatedRoles.length : 1)
                    .addOptions(
                        paginatedRoles.map(role =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(role.label)
                                .setValue(role.value)
                        )
                    )
            )
        );
    }
    await interaction.editReply({
        content: `請選擇一個身分組來對應語言 **${LANGUAGES.find(l => l.value === langCode)?.label || langCode}**：`,
        components: selectMenus,
        flags: [MessageFlags.Ephemeral]
    });
}

async function handleLanguageSelect(interaction) {
    const langCode = interaction.values[0];
    await createRoleSelectMenus(interaction, langCode);
}

async function handleRoleSelect(interaction) {
    // 收集所有下拉選單的值
    const customIdParts = interaction.customId.split('_');
    const langCode = customIdParts[4]; // 根據 customId 的格式 'select_role_for_language_${langCode}_${index}'
    const guildId = interaction.guild.id;
    const config = await loadGuildConfig(guildId);
    const selectedRoles = interaction.values; // 獲取所有選中的身分組
 
     if (!selectedRoles || selectedRoles.length === 0) {
         await interaction.editReply({ content: `${i18n.getTranslation('select_at_least_one_valid_role', 'zh-TW')}\n${i18n.getTranslation('select_at_least_one_valid_role', 'en')}`, flags: [MessageFlags.Ephemeral], components: [] });
         return;
     }

    const roleNames = selectedRoles.map(roleId => interaction.guild.roles.cache.get(roleId)?.name).filter(Boolean);

    if (!config.languageRoles) config.languageRoles = {};
    config.languageRoles[langCode] = selectedRoles;
    await saveGuildConfig(guildId, config);

    await sendSetupMenu(interaction);
}

async function handleSetChannels(interaction) {
    const currentLanguage = await getGuildLanguage(interaction.guild.id);
    const channels = interaction.guild.channels.cache
        .filter(channel => channel.type === ChannelType.GuildText)
        .sort((a, b) => a.position - b.position)
        .map(channel => ({ label: channel.name, value: channel.id }));

    const ITEMS_PER_MENU = 25;
    const selectMenus = [];
    for (let i = 0; i < channels.length; i += ITEMS_PER_MENU) {
        const paginatedChannels = channels.slice(i, i + ITEMS_PER_MENU);
        selectMenus.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`select_monitored_channels_${i / ITEMS_PER_MENU}`)
                    .setPlaceholder(`${i18n.getTranslation('select_monitored_channels', currentLanguage)} (${i + 1}~${i + paginatedChannels.length})`)
                    .setMinValues(0)
                    .setMaxValues(paginatedChannels.length > 0 ? paginatedChannels.length : 1)
                    .addOptions(
                        paginatedChannels.map(channel =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(channel.label)
                                .setValue(channel.value)
                        )
                    )
            )
        );
    }

    await interaction.editReply({
        content: i18n.getTranslation('select_monitored_channels_prompt', currentLanguage) ,
        components: selectMenus,
        flags: [MessageFlags.Ephemeral]
    });
}

async function handleChannelSelect(interaction) {
    const guildId = interaction.guild.id;
    const config = await loadGuildConfig(guildId);
    config.monitoredChannels = interaction.values;
    await saveGuildConfig(guildId, config);
    await sendSetupMenu(interaction);
}

async function handlePagination(interaction) {
    const [_, type, direction, pageStr] = interaction.customId.split('_');
    const currentPage = parseInt(pageStr);

    if (type === 'roles') {
        await createRoleSelectMenus(interaction, currentPage);
    } else if (type === 'channels') {
        // 監控頻道現在是多選，不再需要分頁
        await interaction.editReply({
            content: i18n.getTranslation('monitored_channels_set_successfully', currentLanguage),
            components: [],
            flags: [MessageFlags.Ephemeral]
        });
    }
}

module.exports = {
    sendSetupMenu,
    getSetupMenuComponents,
    getDashboardText,
    handleSetEmoji,
    handleSetRoles,
    handleSetChannels,
    handleLanguageSelect,
    handleRoleSelect,
    handleDeleteLanguageRole,
    handleLanguageDeleteSelect,
    handleChannelSelect,
    handlePagination,
    handleEmojiModalSubmit,
    handleSetLanguage,
};

async function handleSetLanguage(interaction) {
    const guildId = interaction.guild.id;
    const language = interaction.customId === 'set_language_en' ? 'en' : 'zh-TW';
    await setGuildLanguage(guildId, language);
    i18n.setLanguage(language); // 設定當前語言
    await interaction.editReply({ content: i18n.getTranslation('language_switched_to', language), components: [], flags: [MessageFlags.Ephemeral] });
    await sendSetupMenu(interaction);
}
