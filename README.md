# Glimpse UI Design System

从一张图片出发，只问少量关键的视觉问题，交付完整的 shadcn/ui 组件库和 DESIGN.md。

Skill 入口：[.agents/skills/glimpse-design-system/SKILL.md](.agents/skills/glimpse-design-system/SKILL.md)。仓库同时提供 .claude/skills/glimpse-design-system 链接。复制整个 skill 目录到其他项目即可使用。

调用示例：

> 使用 $glimpse-design-system，以这张图片为灵感，确认 PC Web 和 Mobile Web 的设计系统。

## 流程

图片解读 → 规划视觉决策树 → 整体风格 → 颜色、文字、间距、形状、图标和动效 → 组件与状态 → 电脑和手机整合预览 → 修改或确认 → 完整交付。

- 先写出完整的决策树，按视觉影响、复用范围和不确定程度排序。默认最多问 3 个问题，证据足够时更少。
- 每个问题只放 A、B 两个方案，上下排列。只展示能看出差别的小样例，比如同一组按钮、输入框或卡片；不需要每次都放完整页面。
- 预览链接先发出，再调用宿主 agent 的单选工具（例如 AskUserQuestion，`multiSelect: false`）。没有可用工具时，在对话里回复 A 或 B。想合并或调整，直接说明要改哪里。
- 不需要提问的环节，由 agent 根据图片和已有选择推导，并记录推导依据，不算作用户的选择。
- 最后只展示一个整合设计：左边 16:9 电脑预览，右边 9:16 手机预览。在对话里确认，或提出修改意见；修改后回到基础样式环节，重复到确认为止。
- 默认只做一种明暗模式。

预览页在本机运行，只用于查看，没有选择框、反馈输入框或提交按钮。样例按设计尺寸显示，只在空间不够时缩小；保留滚动、手势缩放和单独打开。选择结果保存在 session.json；agent 结束当前轮后，回复选择即可继续。

## 输出位置

- 当前目录是 Web 项目：沿用它的框架、样式方案和包管理器，组件写到源码根目录下的 design-system/（或你指定的目录），DESIGN.md 写到应用根目录。
- 不是 Web 项目：在指定目录或 ./design-system 生成一个完整的 React + Vite + Tailwind 4 应用，DESIGN.md 放在应用根目录。

完整库指所记录官方 registry 中的全部 registry:ui 项，加上图片特有组件；不包含官方页面 block。产物包括源码、可运行的展示页、主题参数、shadcn 安装 registry、依赖锁文件、来源快照、DESIGN.md 与验证记录。DESIGN.md 补全并通过 `design_document.py --check` 后，用 `studio.py finish` 记录交付。

## 环境

需要 Python 3.10+；独立应用还需要 Node 20.19+ 和 npm。首次获取 shadcn 源码和字体依赖需要网络。若系统代理拦截 TLS 导致证书校验失败，可用 `no_proxy='*'` 重试。

所有说明和预览内容跟随用户的主语言，使用简短、容易理解的话。已融合 Anthropic frontend-design 的设计意图、构图与组件细节检查方法，见 [frontend-craft.md](.agents/skills/glimpse-design-system/references/frontend-craft.md)。组件与整合预览需要实际截图检查；没有浏览器能力时，如实记录未能执行的检查。构建通过不能代替视觉检查。
