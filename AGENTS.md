# FC27 三脚本项目

这是 EA SPORTS FC Ultimate Team Web App 的油猴脚本项目，不是独立网站。只维护以下三份安装文件，全部由 `npm run build` 生成到 `dist/`：

| 安装文件 | 职责 | 维护源码 |
| --- | --- | --- |
| `dist/Fodder.user.js` | 原收藏馆、最新三批卡、按数量购买与五分钟重试 | `src/fodder.user.js` |
| `dist/FSU-smart-sbc.user.js` | FSU27.1 原功能与迁移的智能 SBC | `upstream/FSU27.1.user.js` + `src/sbc-*.js`、`src/dialog-compat.js`、`build.cjs` |
| `dist/OAO.user.js` | EA / FUTBIN / FUT.GG / EASYSBC 翻译 | `src/oao.user.js` |

版本配置以 `release.json` 为准。FSU 原版完整保留且校验 SHA-256；只在构建适配层打补丁，不直接修改原版或 `dist/`。Fodder 源码保留基线版本标记，构建从配置注入发布版本；OAO 原样复制。不要再维护旧的 26.09 安装包、独立市场模式或第四份长期启用脚本。

## 修改与验证

先检查 Git 状态、相关源码和 `使用说明.md`，保全用户已有改动。修改后重新构建，交付三个准确的 `dist/` 文件链接。

```powershell
npm ci
npm run build
npm test
node --check dist/FSU-smart-sbc.user.js
node --check dist/Fodder.user.js
node --check dist/OAO.user.js
node --test test/build-distribution.test.cjs
npm run test:browser
```

浏览器回归使用 Playwright 和模拟 EA 服务，安装 Chromium：`npx playwright install chromium`；也可用环境变量 `FC27_CHROMIUM_PATH` 指向现有 Chromium。不能把模拟检查描述为真实账号成功。

## 保持的行为

- Fodder 保留 v0.5.4 的收藏馆、新卡准确版本、普通／签名卡区分、每卡 1–20 张、合计最多 100 张、数量补齐、五分钟间隔、价格设置、原风险确认和停止规则；不借整理改变交易策略。其原生核心仍从 `fodder.gg` 加载，适配失败不能猜测新接口。
- 智能 SBC 复用原约束求解器和复杂规则求解器，保留已放入球员、锁卡／主力／进化／租借保护、俱乐部／仓库、整组规划、缺卡补购及低评分替换优化。保存前通过 EA 条件校验，单关填充和整组保存不提交兑换。
- 缺卡补购只针对完整且通过校验的方案：准确卡版本和数量、每次 EA 请求至少间隔五秒；单张超过 1,000 金币要在界面确认该笔报价。结果不明保留记录并停止，不盲目重买；保持账号／平台隔离、余额核对和浏览器实例锁。
- Fodder 与智能 SBC 互斥；保留上游自动 SBC 等流程的冲突检查。加载／刷新不能自动启动个性化购买任务。
- 真实购买、竞拍、SBC 兑换或出售球员需当前任务授权；历史测试预算不适用。

## 上游更新与清理

用户手动提供新版后，先用 Git 保存当前源码和交付，再比较原版变化与适配交集，最小修改；注入位置缺失、重复或结构变化必须失败。保留适用回归，并验证实际三脚本初始化、按钮及受影响流程，未验证的真实账号行为明确说明。

只用 Git 保留旧代码回退，不在工作目录堆版本备份。`.reference/` 仅留本机真实账号记录／库存快照，不参与构建、不上传。清理仅限当前项目和用户明确提供的相关材料目录，保留用户数据，不触及 `D:/study/ai/volcab-app` 等无关项目。递归操作前验证目标绝对路径在授权范围内。
