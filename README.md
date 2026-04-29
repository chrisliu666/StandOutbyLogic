# 独数一帜

这是一个浏览器端数独网页小游戏项目。

英文名：`Stand Out by Logic`
网页展示署名：`Stand Out by Logic——BY LIUXUANBO`

## 当前状态

项目目前已经完成第一版静态网页实现，可通过本地 HTTP 服务运行。

## 当前实现文件

- `index.html`：页面结构、棋盘、控制区、看板娘、对局记录。
- `styles.css`：清新古典风格、萌化二次元视觉、棋盘和按钮样式。
- `app.js`：数独题目加载、种子码、鼠标交互、确认、提示、失败、记录等核心逻辑。
- `assets/mascot-reference.svg`：基于用户提供图片风格制作的 Ada 头像资源。
- `dev-server.js`：本地静态开发服务器，默认端口 `5188`。
- `start-dev-server.cmd`：Windows 启动脚本，支持可选端口参数。
- `start-public-server.cmd`：Windows 公网/局域网转发启动脚本，监听 `0.0.0.0`，用于配合端口映射或隧道服务。
- `start-public-server.ps1`：PowerShell 公网/局域网转发启动脚本。
- `start-share-server.cmd`：分享给朋友时使用的启动脚本，默认端口 `5189`。
- `stop-share-server.cmd`：分享服务关闭脚本，默认关闭 `5189`。
- `stop-dev-server.cmd`：Windows 关闭脚本，按端口结束本地服务。
- `start-dev-server.ps1`：PowerShell 启动脚本。

## 产品目标

构建一个轻量、流畅、适合鼠标操作的数独网页小游戏。整体体验以交互为重点，视觉风格要求清新、古典、耐看。

题库使用项目内置的本地确定性数独生成逻辑，不依赖任何外部 API 或联网数据源。正式实现时，需要在文档中记录本地题库生成方式、授权信息和更新方式。

## 已确认构想

- 题库方式：本地内置确定性题库，不使用任何 API。
- 难度设置：需要分级。
- 二次元表现：需要看板娘。
- 数据保存：对局记录保存在当前浏览器本地。
- 设备优先级：以电脑端鼠标操作为主，移动端不是第一优先级。

## UI 方向

- 风格清新、古典。
- 棋盘布局安静、清晰、易读。
- 使用标准 `9x9` 数独棋盘。
- 每个 `3x3` 宫需要有更明显的视觉分隔。
- 棋盘周围避免过度装饰，重点突出填数字和高亮交互。
- 使用克制的颜色、细腻的边框和有质感的字体。
- 在清新古典的基础上加入适度萌化和二次元氛围，但不能影响数独棋盘的可读性和操作效率。
- 看板娘名字为 `Ada`，头像使用用户提供图片风格的图片资源，用于反馈、陪伴和氛围营造，但不能抢占棋盘主体。
- 网页版右侧控制面板承载操作说明、难度、数字状态、种子码、操作按钮和对局记录；右侧不再展示图例，左右两侧面板底边需要保持对齐。

## UI 控件

界面需要提供以下按钮：

- 新题目：切换到一道新的数独题。
- 确认：提交当前选中格子的临时数字，并和该格子的正确答案对比。
- 提示：系统直接填入并显示当前格子或指定格子的正确数字。
- 一键完成：直接填入所有正确答案，并按成功通关结算。
- 再来一局：在失败后出现，用于快速开始一局新游戏。
- 数字状态：显示 `1` 到 `9` 每个数字是否已经填满。

按钮需要易识别、易点击，并和整体清新古典、萌化二次元风格保持一致。

## 页面操作说明

- 页面需要提供清晰、简洁的操作说明区域。
- 操作说明应覆盖左键单击、滚轮、长按、右键长按、确认、提示等核心玩法。
- 操作说明应放在不干扰棋盘的位置，优先作为右侧控制面板中的紧凑说明卡。
- 操作说明文案要短，便于玩家快速扫读。

## 萌化与二次元交互特效

- 数字变化、高亮相同数字、新题目切换时，可以加入轻量动效。
- 动效应偏萌化、二次元，例如柔和弹跳、星光、小贴纸感装饰、轻微闪光或角色化反馈。
- 特效必须克制，不能遮挡棋盘数字，不能干扰玩家连续操作。
- 特效需要保持性能稳定，避免长时间动画或大量粒子导致页面卡顿。
- 如后续加入角色或看板娘元素，应服务于反馈和氛围，不应抢占棋盘主体。

## 核心交互

每个数独格子以鼠标操作为主：

- 鼠标左键单击：选中当前格子；如果格子已有数字，则高亮所有相同数字。
- 鼠标滚轮上滚：当前格子数字 `+1`。
- 鼠标滚轮下滚：当前格子数字 `-1`。
- 鼠标长按：清除当前格子。
- 鼠标右键长按：确认当前格子的临时数字。
- 鼠标单击某个格子：高亮显示所有相同数字。

当前已移除双击填入 `1` 和右键单击减一交互；双击格子不再改数，右键短按仅用于阻止浏览器默认菜单，右键长按仍用于确认当前临时数字。

数字范围使用 `0` 到 `9`。其中 `0` 表示空格，普通游戏界面中应显示为空白。

玩家通过鼠标调整出的数字默认为临时数字，只有点击“确认”按钮或对该格子执行鼠标右键长按后，才进入答案校验流程。

## 确认与失败机制

- 玩家填写的数字默认是临时数字。
- 点击“确认”按钮时，校验当前选中格子的临时数字。
- 对格子执行鼠标右键长按时，也校验该格子的临时数字。
- 校验时，将玩家临时数字和该格子的正确答案进行对比。
- 如果数字正确，该格通过并固定为已确认状态。
- 已确认正确的格子固定后，颜色应改为和题面给定数字一致。
- 如果数字错误，错误次数 `-1`。
- 每局共有 `3` 次错误机会。
- 错误次数扣完后，本局游戏失败。
- 游戏失败后，需要显示“再来一局”按钮。
- 已确认正确的格子应和临时数字有明确视觉区分。
- 题目给定数字不消耗确认次数，也不应参与玩家错误判定。

## 结算与对局记录

- 游戏需要记录每局结果。
- 成功通关时，记录成功状态、通关用时和种子码。
- 失败时，记录失败状态、失败用时和种子码。
- 点击“新题目”中断当前未结束对局时，记录中断状态、当前难度、当前用时和种子码。
- 对局记录需要显示成功、失败、中断三类状态，并同时显示难度、用时和种子码。
- 对局记录需要在界面中可查看。
- 对局记录保存在当前浏览器本地。
- 对局记录中的种子码应方便玩家复制或重新输入，以便复现该局。
- 用时从本局开始后计时，到成功通关或失败时停止。
- 使用“再来一局”开始新游戏时，应生成并记录新的对局。

## 提示机制

- 每局提供 `3` 次提示机会。
- 使用提示时，系统直接填入并显示目标格子的正确数字。
- 被提示填入的格子应标记为系统提示数字，并区别于题目给定数字和玩家确认数字。
- 系统提示数字的颜色需要清晰、正确，不能和临时数字或高亮状态混淆。
- 提示次数用完后，应禁用或明确标识“提示”不可用。
- 页面弹出的文字提示需要显示在屏幕正中央，显示约 `1` 秒，并使用稍微放大的反馈效果。

## 种子码机制

- 每局随机生成一个种子码。
- 种子码需要在界面中展示，方便玩家记录或分享。
- 用户可以手动输入种子码，重复进入同一局游戏。
- 同一种子码应稳定复现相同题目、初始盘面和答案。
- 新题目按钮默认生成新的随机种子码；如果用户输入种子码，则按输入种子码加载对应题目。

## 题库与难度

- 题库采用项目内置的本地确定性数独生成逻辑。
- 题库不使用任何 API，不依赖网络访问。
- 题库需要支持难度分级。
- 界面需要允许玩家选择难度。
- 难度至少需要覆盖基础分级；具体命名可在实现时确定，例如简单、普通、困难、专家。
- 题库来源、授权信息、本地生成方式和更新方式需要在实现后补充到文档。

## 当前题库来源与本地策略

- 当前题库来源：项目内置的确定性数独生成逻辑。
- 当前题库授权：代码随本项目维护；未引入第三方题库数据。
- 当前更新方式：后续如扩充题库或生成算法，应直接更新项目代码并同步记录到 `README.md` 和 `AGENTS.md`。
- 新随机局直接根据随机种子码和难度在本地生成题目。
- 用户手动输入种子码时，使用同一套本地确定性数独生成逻辑生成同一局，保证种子码可复现。
- 当前难度通过挖空数量控制：简单、普通、困难、专家。

## 桌面单机版

- 已规划复制出独立桌面版项目，保留网页版一致的 HTML、CSS、JavaScript UI。
- 桌面版采用本地 exe 启动器运行，不使用外部 API。
- exe 启动器负责在本机启动静态页面服务并打开同一套游戏界面。
- 桌面版启动器源码位于 `desktop/`，使用 Windows 自带 .NET Framework C# 编译器构建。
- 桌面版发布命令：`powershell -ExecutionPolicy Bypass -File desktop/build-exe.ps1`。

## 玩法行为

- 题目给定数字需要和玩家填写数字有明显区分。
- 题目给定数字默认不允许误改，除非后续增加明确的编辑模式。
- 高亮状态应跟随当前点击或当前数字变化即时更新。
- 鼠标单击某个数字后，所有相同数字不仅要背景高亮，数字本身颜色也必须发生明显变化。
- 当前选中格子的同一行、同一列、同一九宫需要使用和主界面明显不同的颜色高亮，避免颜色过浅。
- 右键操作棋盘格时，应阻止浏览器默认右键菜单。
- 鼠标滚轮在棋盘格上调整数字时，应阻止页面滚动。
- 交互优先面向电脑端鼠标操作设计；移动端适配可以后续补充，但不作为当前第一优先级。
- 网页版使用固定宽度的桌面布局，不按浏览器比例强制自适应为一屏展示。
- 网页版页面不在前台运行时，用时自动暂停；页面回到前台后继续计时。

## 文档维护规则

- 后续对项目的每一次优化、需求调整、交互调整或实现约定，都必须同步修改 `README.md` 和 `AGENTS.md`。
- 文档以后优先使用中文。
- 已经写入的旧版本内容不要删除，新增内容应通过新章节、版本记录或补充说明的方式追加。
- 如果实现和文档不一致，应先更新文档，再调整代码。

## 变更记录

### 2026-04-29

- 新增分享用启动/关闭脚本：`start-share-server.cmd` 默认监听 `5189`，同一局域网朋友访问 `http://192.168.10.107:5189/`；`stop-share-server.cmd` 用于关闭分享服务。
- 新增公网/局域网转发启动方式：`dev-server.js` 支持指定监听地址，`start-public-server.cmd` 和 `start-public-server.ps1` 会监听 `0.0.0.0`，便于配合端口映射、反向代理或内网穿透生成公网网址。
- 左侧棋盘背景块高度拉长到与右侧控制面板一致，使左右两栏底边对齐。
- 点击“新题目”时，如果当前对局尚未成功或失败，会先记录为“中断”，并保存难度、用时和种子码。
- 页面弹出的文字提示改为屏幕正中央显示，持续约 `1` 秒，并加入轻微放大效果。
- 网页版右侧控制面板删除图例区域，重新压缩为更清爽的单列布局；记录区固定在右侧底部并内部滚动。
- 网页顶部英文名后追加展示署名 `——BY LIUXUANBO`。
- 修正网页版图例颜色：题目和已确认使用与棋盘固定数字一致的米黄色，临时使用蓝色，提示使用黄色。
- 网页版将“数字状态”和“种子码”区域从棋盘下方移动到右侧控制面板，并加宽右栏；右侧内容底边与左侧棋盘底边对齐。
- 重新设计网页版右侧控制面板：采用单列规整分组，数字状态横排显示，种子码独立成行，操作按钮横向排列，记录区固定在底部并内部滚动。
- 网页版移除“撤销、恢复、重置、撤销重置”按钮，保留新题目、确认、提示、一键完成和失败后的再来一局。
- 撤回网页版一屏自适应布局，恢复固定宽度桌面布局和正常页面滚动。
- 网页版增加前后台计时控制：页面隐藏或失焦时自动暂停用时，回到前台后继续计时。
- 题库改为完全本地内置确定性生成，不再使用 Dosuku API 或任何外部 API。
- 后续继续要求每次代码、交互、题库或封装方式调整时同步更新 `README.md` 和 `AGENTS.md`。
- 新增桌面单机版封装方向：备份项目后复制出独立项目，并封装为本地 exe 运行，UI 与网页版保持一致。
- 新增桌面版启动器源码和 `desktop/build-exe.ps1`，exe 启动后在本机启动嵌入式静态服务并打开同一套游戏 UI。
- 移除双击填入 `1` 的棋盘交互，避免误触改数。
- 移除右键单击减一交互，右键短按不再改变数字；保留右键长按确认，并继续阻止棋盘上的浏览器默认右键菜单。
- 新增 `1` 到 `9` 的数字状态标识，显示每个数字是否填满。
- 修改鼠标逻辑：左键单击空白格只选中，左键双击才填入 `1`。
- 修正系统提示数字的 UI 颜色。
- 数字确认正确后，固定格子的颜色改为和题面数字一致。
- 增加“一键完成”按钮，直接填入所有正确答案并按成功通关结算。
- 将同一行、同一列、同一九宫的关联高亮改为更明显的青蓝色。
- 移除 CSS 绘制的看板娘头像，改为使用基于用户提供图片风格制作的本地头像资源。
- 调整页面 UI，在右侧控制面板加入“操作说明”区域。
- 高亮相同数字时，所有相同数字的数字颜色也需要明显变化。
- 看板娘名字改为 `Ada`，并优化为更精致的二次元头像。
- 创建第一版静态网页项目：`index.html`、`styles.css`、`app.js`。
- 实现数独棋盘、鼠标填数、右键短按减一、右键长按确认、长按清除、滚轮改数、双击填入 `1`。
- 实现确认校验、三次错误失败、三次提示、失败后再来一局、撤销、恢复、重置、撤销重置。
- 实现种子码、本地对局记录、联网题库加载和本地确定性兜底题目。
- 将本地开发端口改为 `5188`，避免和其他服务的 `5173` 冲突。
- 增加 `dev-server.js`、`start-dev-server.cmd`、`start-dev-server.ps1`，用于稳定启动本地服务。
- 增加 `stop-dev-server.cmd`，用于按端口关闭本地服务。
- 增加当前开发运行方式、Windows 本地运行方式和语法检查命令。
- 确认题库采用联网加载公开题库，并需要难度分级。
- 确认二次元表现需要看板娘。
- 确认对局记录保存在当前浏览器本地。
- 确认当前优先适配电脑端鼠标操作。
- 增加失败后的“再来一局”按钮。
- 增加对局记录要求：记录成功用时、失败用时和种子码。
- 增加“确认”按钮，玩家鼠标操作填写的数字默认为临时数字，确认后才和正确答案对比。
- 增加鼠标右键长按确认当前格子的交互。
- 增加错误次数机制：每局 `3` 次错误机会，扣完失败。
- 增加每局 `3` 次提示机会，提示会直接填入并显示正确数字。
- 增加种子码机制：每局随机生成种子码，用户可输入种子码复现同一局游戏。
- 更新 UI 要求：增加“新题目、撤销、恢复、重置、撤销重置”按钮。
- 增加萌化和二次元交互特效要求，强调特效不能影响棋盘可读性和操作效率。
- 确定项目中文名为“独数一帜”，英文名为 `Stand Out by Logic`。
- 将当前生效交互规则修正为：鼠标双击格子时填入 `1`，不是 `0`。
- 保留英文初版作为历史原文；如历史原文与中文当前规则冲突，以中文当前规则为准。

## 开发

当前是无需构建工具的静态网页项目。

推荐本地运行命令：

```bash
node dev-server.js 5188
```

Windows 可双击运行：

```text
start-dev-server.cmd
```

也可以指定端口：

```text
start-dev-server.cmd 5188
```

如需让朋友通过公网网址访问，有两种方式：

1. 推荐长期分享：将本项目作为静态网站部署到 GitHub Pages、Vercel、Netlify、Cloudflare Pages 等平台，上传 `index.html`、`styles.css`、`app.js`、`assets/` 等静态文件即可，游戏不依赖任何外部 API。
2. 临时分享本机运行：运行 `start-public-server.cmd 5188`，让服务监听 `0.0.0.0`，再配合路由器端口映射、云服务器反向代理或内网穿透工具生成公网网址。

公网/局域网转发启动：

```text
start-public-server.cmd 5188
```

等价命令：

```bash
node dev-server.js 5188 0.0.0.0
```

当前这台电脑的局域网访问地址是：

```text
http://192.168.10.107:5189/
```

分享给同一 Wi-Fi / 同一局域网的朋友时，双击运行：

```text
start-share-server.cmd
```

关闭分享服务：

```text
stop-share-server.cmd
```

关闭服务：

```text
stop-dev-server.cmd
```

关闭指定端口服务：

```text
stop-dev-server.cmd 5188
```

然后访问：

```text
http://127.0.0.1:5188/
```

当前检查命令：

```bash
node --check app.js
```

桌面版发布命令：

```bash
powershell -ExecutionPolicy Bypass -File desktop/build-exe.ps1
```

## 历史原文：英文初版

# Sudoku Web Game

This repository is for a browser-based Sudoku mini game.

## Status

The project is currently in the requirements and documentation stage.

## Product Goal

Build a lightweight Sudoku web game with a fresh classical visual style and highly polished mouse interactions.

The puzzle library should be sourced from publicly available online Sudoku puzzle data or generated from an online-compatible dataset format. When implementation begins, document the selected source, license, and update method.

## UI Direction

- Fresh and classical style.
- Calm, readable board layout.
- Clear 9x9 grid with stronger visual separation for each 3x3 box.
- Avoid clutter around the board so the interaction remains the focus.
- Use tasteful colors, subtle borders, and refined typography.

## Core Interaction

Each Sudoku cell supports mouse-first input:

- Double-click: set the selected cell value to `0`.
- Left-click: increase the cell value by `1`.
- Right-click: decrease the cell value by `1`.
- Mouse wheel up: increase the cell value by `1`.
- Mouse wheel down: decrease the cell value by `1`.
- Long press: clear the cell.
- Single click on a cell: highlight all cells with the same number.

Value changes should stay within the supported Sudoku range. The intended cycle is `0` through `9`, where `0` represents an empty cell.

## Expected Gameplay Behavior

- Given puzzle clues should be visually distinct from player-entered values.
- Given puzzle clues should not be accidentally editable unless an explicit edit mode is introduced.
- Highlighting should update immediately when the focused or clicked number changes.
- Empty cells with value `0` should be displayed as blank in the board UI unless a debug mode is added.
- Right-click interaction should prevent the browser context menu on board cells.
- Wheel interaction should prevent accidental page scrolling while the pointer is over the board.

## Development

No development commands are defined yet.

Document common commands here, such as:

- Install dependencies
- Run the development server
- Run tests
- Build or package the game
