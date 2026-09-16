# Glimpse UI Design System

从一张图片出发，通过两个大幅 HTML 预览、对话多选和反馈，逐步确认设计规范，交付完整的 shadcn/ui 组件库与 DESIGN.md。

Skill 入口：[.agents/skills/glimpse-design-system/SKILL.md](.agents/skills/glimpse-design-system/SKILL.md)。仓库同时提供 .claude/skills/glimpse-design-system 链接。复制整个 skill 目录到其他项目即可使用。

调用示例：

> 使用 $glimpse-design-system，以这张图片为灵感，逐步确认 PC Web 和 Mobile Web 的设计系统。

流程：图片解读 → 两个方案 → 颜色、文字和图标 → 按钮、输入框等 → 电脑和手机预览 → 修改或确认 → 完整交付。改进回到基础样式环节，重复到确认。默认只做一种明暗模式。

需要 Python 3.10+、Node 20.19+、npm；首次获取 shadcn 和字体依赖需要网络。预览页在本机运行，选择结果保存在 session.json。每轮先给出可打开的预览链接，再调用 AskUserQuestion 多选。可以选一个，也可以两个都选；两个都选时先出合并版本。工具不可用时，在对话里回复 A、B 或 A+B，也可以直接说明想改哪里。网页只展示方案，没有选择框、反馈输入框或提交按钮。AI 负责生成下一轮；若 agent 已结束当前轮，回复选择即可继续。

实例与完整验证记录位于 examples/habit-play/run。用户原始图片保存在 examples/habit-play/input/inspiration.png。通用验证记录位于 docs/verification。

已融合 Anthropic frontend-design 的设计意图、构图与组件细节检查方法，见 [frontend-craft.md](.agents/skills/glimpse-design-system/references/frontend-craft.md)。组件与综合预览需要实际截图、逐项观察及修复记录；构建通过不能代替视觉检查。原图的细化候选及验证记录见 [refinement/VALIDATION.md](examples/habit-play/refinement/VALIDATION.md)，候选尚未获得用户设计确认。

完整库定义为所记录官方 registry 中全部 registry:ui 项，加上图片特有组件；不包含全部官方页面 block。产物包括源码、可运行展示工程、主题参数、shadcn 安装 registry、依赖锁文件、来源快照、设计标准与验证证据。

所有说明和 HTML 内容跟随用户的主语言，使用简短、容易理解的话。每轮只放两个方案，上下排列；每个方案左边是 16:9 的电脑预览，右边是 9:16 的手机预览（均为宽:高）。预览自动适应可用空间，保留手势缩放、滚动和单独打开，不显示缩放按钮、滑条或百分比。
