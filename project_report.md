# Discord Emoji 翻譯機器人專案報告

## 專案目標
本專案旨在開發一個 Discord 機器人，讓用戶能透過 emoji 點擊快速翻譯訊息，並支援多伺服器獨立設定、互動式儀表板、彈性語言與身分組對應。

---

## 最新現況（2024/06）

### 1. 多伺服器獨立設定
- `config.json` 以 Discord Guild ID 分群組儲存，每個伺服器的 emoji、語言對應、監視頻道皆獨立互不影響。

### 2. 設定體驗全面升級
- **主頁（儀表板）統一**：所有設定流程結束後都會回到帶有儀表板的主頁，與斜線指令一致，顯示所有 emoji、語言對應、監視頻道現況。
- **頻道設定**：支援多下拉選單（每 25 個一組），無分頁，適用於大型伺服器。
- **語言對應身分組設定**：同樣支援多下拉選單（每 25 個一組），無分頁，體驗與頻道設定一致。
- **Emoji 設定**：僅允許設定一個反應表情，支援 Discord 伺服器自有表情（名稱、ID、`<:name:id>` 格式皆可）。
- **語言選項**：已新增「簡體中文（zh-CN）」語言選項。
- **所有互動皆為暫時訊息**，確保設定安全與隱私。
- **多語言支援**：新增英文版本，並提供語言切換按鈕，用戶可自由選擇介面語言。

### 3. 互動與翻譯邏輯
- 用戶點選 emoji，機器人會根據用戶持有的語言身分組自動翻譯訊息，並公開顯示翻譯內容。
- 若用戶持有多個語言身分組，會針對所有語言（排除原文語言）都回覆翻譯。
- 若語言偵測失敗，則全部語言都翻譯，並提示「無法偵測原始語言，已直接以您的語言設定進行翻譯」。
- 翻譯訊息不再標註用戶，僅公開顯示翻譯內容本身。
- 機器人會自動對監視頻道訊息反應設定的 emoji。
- 所有設定流程、錯誤提示、主選單與儀表板顯示皆根據需求優化。

### 4. 部署與運維
- 支援 Zeabur CLI 及 Zeabur 後台部署，建議遇到 CLI 互動式選單錯誤時改用後台手動部署。
- 所有敏感資訊（如 API 金鑰）皆透過 `.env` 檔案管理，並於 Zeabur 後台設定。

---

## 歷史開發紀錄與修正

### 1. 專案初始化與依賴安裝
- 初始化 Node.js 專案，安裝 `discord.js`、`dotenv`、`axios`。
- 建立 `src` 資料夾，主程式入口為 `src/index.js`。

### 2. 斜線指令與互動設定
- `/setup` 斜線指令啟動設定，後續設定皆用互動式選單與暫時訊息。
- 設定選單包含 emoji、語言對應身分組、監視頻道三大項。

### 3. 設定儲存與多伺服器支援
- `config.json` 由單一設定改為以 guildId 分群組儲存，所有設定皆獨立。
- `src/configManager.js` 實作 loadGuildConfig、saveGuildConfig。

### 4. UI/UX 與互動優化
- Emoji 設定改用 Modal 輸入，僅允許一個 emoji。
- 頻道與語言對應身分組設定皆支援多下拉選單，無分頁。
- 所有設定流程結束後自動回到主頁，主頁內容統一且帶有儀表板。
- 儀表板顯示所有 emoji、語言對應、監視頻道現況。

### 5. 翻譯服務與備援
- 整合 DeepL 為主要翻譯服務，Google 相關程式碼已移除。
- 支援 PRIMARY_TRANSLATION_SERVICE、DEEPL_API_KEY 等環境變數。
- 翻譯服務失敗時有備援機制，並加強錯誤日誌。

### 6. 常見問題與修正
- 修正斜線指令無回應、互動重複回覆、分頁超過 25 選項錯誤、API 金鑰載入問題等。
- 詳細錯誤日誌與提示，協助用戶排查設定與 API 問題。

### 7. 多語言支援與國際化
- **多語言基礎結構**：實作 i18n 國際化框架，支援多語言檔案載入與管理。
- **語言切換功能**：新增語言切換按鈕，允許用戶在繁體中文與英文之間切換介面語言。
- **翻譯內容國際化**：將所有機器人介面文字、提示訊息、錯誤訊息等進行國際化處理，確保不同語言版本的一致性。
- **相關問題診斷與修復**：針對多語言切換過程中可能出現的顯示問題、翻譯遺漏等進行診斷與修復，確保功能穩定。

---

## 目前建議與注意事項
- 建議所有部署敏感資訊皆於 Zeabur 後台設定，不要寫入程式碼。
- 若遇到 Zeabur CLI 部署互動式選單錯誤，請改用 Zeabur 後台手動部署。
- 如需擴充語言、UI、儀表板內容，或有新需求，歡迎隨時提出。
