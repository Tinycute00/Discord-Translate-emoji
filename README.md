# Discord Emoji 翻譯機器人 / Discord Emoji Translator Bot

## 簡介 / Introduction
這是一個專為 Discord 設計的表情符號翻譯機器人，旨在解決跨語言交流中表情符號意義理解的障礙。透過自動翻譯表情符號的名稱或描述，機器人幫助用戶更好地理解不同語言背景下表情符號的含義，促進更流暢的溝通。

This is a Discord bot designed to translate emoji meanings, aiming to bridge communication gaps caused by language differences in emoji understanding. By automatically translating emoji names or descriptions, the bot helps users better grasp the meaning of emojis across different linguistic backgrounds, facilitating smoother communication.

## 主要功能 / Key Features

*   **多伺服器獨立設定 / Multi-Server Independent Configuration:**
    *   每個 Discord 伺服器都可以獨立設定機器人的行為，確保靈活性和客製化。
    *   Each Discord server can independently configure the bot's behavior, ensuring flexibility and customization.

*   **多語言支援與語言切換 / Multi-language Support and Language Switching:**
    *   支援多種語言，提供更廣泛的用戶基礎。
    *   內建語言切換按鈕，用戶可輕鬆切換機器人介面語言。
    *   Supports multiple languages, providing a broader user base.
    *   Built-in language switching button, allowing users to easily switch the bot interface language.

*   **優化的設定體驗 / Optimized Configuration Experience:**
    *   提供直觀的儀表板（Dashboard）進行設定。
    *   支援多下拉選單（Multi-select Dropdowns）以便於選擇。
    *   使用暫時訊息（Ephemeral Messages）減少頻道混亂。
    *   Offers an intuitive Dashboard for configuration.
    *   Supports Multi-select Dropdowns for easy selection.
    *   Utilizes Ephemeral Messages to reduce channel clutter.

*   **互動與翻譯邏輯 / Interaction and Translation Logic:**
    *   **Emoji 點擊翻譯 / Emoji Click Translation:** 用戶可以點擊訊息中的表情符號，機器人會自動翻譯其含義。
    *   Users can click on emojis in messages, and the bot will automatically translate their meanings.
    *   **多語言身分組對應 / Multi-language Role Mapping:** 支援將特定語言與 Discord 身分組綁定，實現精準的語言翻譯。
    *   Supports binding specific languages to Discord roles for precise language translation.
    *   **語言偵測失敗處理 / Language Detection Failure Handling:** 當語言偵測失敗時，機器人會提供預設或備用翻譯。
    *   When language detection fails, the bot provides default or fallback translations.
    *   **無需翻譯時靜默 / Silent when No Translation Needed:** 當表情符號無需翻譯時，機器人會保持靜默，避免不必要的訊息。
    *   The bot remains silent when emojis do not require translation, avoiding unnecessary messages.

*   **部署與運維 / Deployment and Operations:**
    *   **`.env` 管理 / `.env` Management:** 透過 `.env` 檔案輕鬆管理環境變數和敏感資訊。
    *   Easily manage environment variables and sensitive information via the `.env` file.
    *   **Zeabur 部署 / Zeabur Deployment:** 支援在 Zeabur 平台上快速部署，簡化了部署流程。
    *   Supports quick deployment on the Zeabur platform, simplifying the deployment process.

## 最新更新/改進 / Latest Updates/Improvements

*   **語言對應顯示修正 / Language Mapping Display Fix:** 修正了語言對應顯示不正確的問題。
*   Fixed incorrect display of language mappings.
*   **身分組選擇問題解決 / Role Selection Issue Resolution:** 解決了在設定過程中身分組選擇的相關問題。
*   Resolved issues related to role selection during the configuration process.
*   **多語言對應身分組支援 / Multi-language Role Mapping Support:** 擴展了對多個語言對應身分組的支援。
*   Extended support for multiple language-to-role mappings.
*   **設定流程返回主儀表板 / Configuration Flow Returns to Main Dashboard:** 優化了設定流程，允許用戶在完成設定後返回主儀表板。
*   Optimized the configuration flow, allowing users to return to the main dashboard after completing settings.
*   **無需翻譯時靜默 / Silent when No Translation Needed:** 機器人現在在無需翻譯時會保持靜默，減少訊息干擾。
*   The bot now remains silent when no translation is needed, reducing message clutter.
*   **多語言基礎結構與語言切換功能 / Multi-language Infrastructure and Language Switching Functionality:**
    *   實現了多語言基礎結構，支援動態加載翻譯內容。
    *   新增語言切換按鈕，允許用戶在繁體中文和英文之間切換機器人介面語言。
    *   Implemented multi-language infrastructure, supporting dynamic loading of translated content.
    *   Added a language switching button, allowing users to switch the bot interface language between Traditional Chinese and English.
*   **翻譯內容國際化與問題診斷 / Translation Content Internationalization and Problem Diagnosis:**
    *   將所有用戶可見的字串提取到 `locales` 資料夾中的 JSON 檔案，實現內容國際化。
    *   診斷並修復了因翻譯鍵缺失導致的顯示問題，確保所有介面元素都能正確顯示翻譯內容。
    *   Extracted all user-visible strings into JSON files in the `locales` folder for content internationalization.
    *   Diagnosed and fixed display issues caused by missing translation keys, ensuring all interface elements display translated content correctly.

## 使用說明（簡要） / Usage Instructions (Brief)

1.  **環境設定 / Environment Setup:**
    *   複製 `.env.example` 為 `.env`。
    *   填寫您的 Discord Bot Token 和其他必要的環境變數。
    *   Copy `.env.example` to `.env`.
    *   Fill in your Discord Bot Token and other necessary environment variables.

2.  **安裝依賴 / Install Dependencies:**
    *   運行 `npm install` 安裝所有必要的套件。
    *   Run `npm install` to install all necessary packages.

3.  **啟動機器人 / Start the Bot:**
    *   運行 `npm start` 或 `node src/index.js` 啟動機器人。
    *   Run `npm start` or `node src/index.js` to start the bot.

4.  **Discord 伺服器設定 / Discord Server Configuration:**
    *   邀請機器人到您的 Discord 伺服器。
    *   使用 `/config` 指令開啟設定儀表板，進行語言和身分組的對應設定。
    *   Invite the bot to your Discord server.
    *   Use the `/config` command to open the configuration dashboard and set up language and role mappings.
