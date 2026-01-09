# SkillForge 项目分析文档

> 最后更新：2026-01-09

## 1. 项目概述

### 1.1 项目定位

**SkillForge** 是一个 AI 技能创建的元方法论框架，它将技能创建从"艺术"转变为"工程学科"。该项目的核心理念是**"质量是内建的，而非事后附加的"**。

- **仓库地址**: https://github.com/tripleyak/SkillForge
- **当前版本**: v4.0.0
- **许可证**: MIT
- **目标模型**: Claude Opus 4.5

### 1.2 核心问题

AI 开发的核心挑战不在于缺乏创意，而在于将创意转化为可靠技能的过程不一致。当前方法往往是临时性的、脆弱的，难以规模化。

### 1.3 解决方案

SkillForge 通过在创建过程的每个步骤中集成严格性来解决这个问题——从最初的构思到最终验证。这是从被动测试到主动工程的根本性转变。

---

## 2. 架构设计

### 2.1 4 阶段架构

SkillForge 实现了严格的自主 4 阶段架构：

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 0: SKILL TRIAGE (v4.0 新增)                          │
│ • 分类输入类型 (create/improve/question/task)              │
│ • 扫描 250+ 技能生态系统                                    │
│ • 与现有技能匹配并计算置信度                                │
│ • 路由至: USE | IMPROVE | CREATE | COMPOSE                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: DEEP ANALYSIS (深度分析)                          │
│ • 扩展需求 (显式、隐式、未知)                               │
│ • 应用 11 种思维模型 + 自动化视角                           │
│ • 迭代提问直到无新洞察 (3 轮空白终止)                       │
│ • 识别自动化/脚本机会                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: SPECIFICATION (规格说明)                          │
│ • 生成包含所有决策 + 原因的 XML 规格                        │
│ • 包含脚本部分 (如适用)                                     │
│ • 验证时效性分数 ≥ 7                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: GENERATION (生成)                                 │
│ • 以新鲜上下文编写 SKILL.md                                 │
│ • 生成 references/, assets/, 和 scripts/                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: SYNTHESIS PANEL (多代理综合)                      │
│ • 3-4 个 Opus 代理独立评审                                  │
│ • 当存在脚本时添加 Script Agent                             │
│ • 所有代理必须批准 (一致通过)                               │
│ • 如被拒绝 → 带反馈回到 Phase 1                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 11 种思维透镜框架

Phase 1 使用 11 种思维模型进行系统性分析：

| 透镜 | 核心问题 | 应用场景 |
|------|----------|----------|
| **第一性原理** | 什么是根本需要的？ | 剥离惯例，找到核心 |
| **逆向思维** | 什么会导致失败？ | 构建反模式 |
| **二阶效应** | 显而易见之后会发生什么？ | 映射下游影响 |
| **事前验尸** | 为什么会失败？ | 主动风险缓解 |
| **系统思维** | 各部分如何交互？ | 集成映射 |
| **魔鬼代言人** | 最强的反驳论点是什么？ | 挑战每个决策 |
| **约束分析** | 什么是真正固定的？ | 区分真实与假设约束 |
| **帕累托分析** | 哪 20% 带来 80% 价值？ | 聚焦高价值特性 |
| **根因分析** | 为什么需要这个？(5 Whys) | 解决原因而非症状 |
| **比较分析** | 选项如何比较？ | 加权决策矩阵 |
| **机会成本** | 我们放弃了什么？ | 明确权衡 |

### 2.3 多代理综合面板

Phase 4 使用多个专业代理进行独立评审：

| 代理 | 关注点 | 关键标准 | 激活条件 |
|------|--------|----------|----------|
| **设计/架构代理** | 结构、模式、正确性 | 模式适当、阶段合理、无循环依赖 | 始终 |
| **受众/可用性代理** | 清晰度、可发现性、完整性 | 触发器自然、步骤明确、无假设知识 | 始终 |
| **演进/时效性代理** | 未来验证、扩展、生态系统 | 分数 ≥7、扩展点清晰、生态系统适配 | 始终 |
| **脚本/自动化代理** | 代理能力、验证、质量 | 脚本遵循模式、自验证、有文档 | 存在脚本时 |

**要求**: 必须一致通过 (3/3 或 4/4)

---

## 3. 目录结构

```
SkillForge/
├── SKILL.md                    # 主技能定义 (核心入口)
├── README.md                   # 项目说明文档
├── LICENSE                     # MIT 许可证
├── SESSION_HANDOFF.md          # 会话交接文档
│
├── references/                 # 系统"大脑" - 核心参考文档
│   ├── regression-questions.md     # 回归问题库 (7 类别)
│   ├── multi-lens-framework.md     # 11 种思维模型指南
│   ├── specification-template.md   # XML 规格模板
│   ├── evolution-scoring.md        # 时效性评估
│   ├── synthesis-protocol.md       # 多代理面板详情
│   ├── script-integration-framework.md  # 脚本集成框架
│   └── script-patterns-catalog.md  # 标准 Python 模式
│
├── assets/
│   ├── images/                 # 文档图片 (13 张 PNG)
│   │   ├── 01-title.png
│   │   ├── 02-quality-gap.png
│   │   └── ... (可视化架构图)
│   └── templates/              # 可复用蓝图
│       ├── skill-spec-template.xml   # XML 规格模板
│       ├── skill-md-template.md      # SKILL.md 模板
│       └── script-template.py        # Python 脚本模板
│
└── scripts/                    # 自动化质量门
    ├── triage_skill_request.py     # 智能输入分类和技能匹配
    ├── discover_skills.py          # 扫描技能源并构建索引
    ├── quick_validate.py           # 快速验证
    ├── validate-skill.py           # 完整结构验证
    └── package_skill.py            # 打包分发
```

---

## 4. 核心功能详解

### 4.1 Phase 0: 技能分流 (v4.0 新增)

智能分析任意用户输入并确定最佳行动：

```python
# 决策矩阵
匹配度 ≥80% + 显式创建请求 → CLARIFY (重复警告)
匹配度 ≥80% + 其他输入     → USE_EXISTING (推荐技能)
匹配度 50-79%             → IMPROVE_EXISTING (增强匹配)
匹配度 <50% + 显式创建    → CREATE_NEW (继续到 Phase 1)
检测到多领域              → COMPOSE (建议技能链)
输入模糊                  → CLARIFY (请求更多信息)
```

**支持的输入类型**:
- `explicit_create`: "create a skill for X"
- `explicit_improve`: "improve the X skill"
- `skill_question`: "do I have a skill for...?"
- `task_request`: "help me with X"
- `error_message`: 堆栈跟踪、错误
- `code_snippet`: 粘贴的代码
- `url_content`: URL
- `general`: 不明确

### 4.2 通用领域匹配

基于**概念**而非硬编码技能名称进行匹配：

```python
DOMAIN_SYNONYMS = {
    "spreadsheet": ["excel", "xlsx", "csv", "workbook", "tabular"],
    "debugging": ["debug", "error", "exception", "stack trace", "crash"],
    "testing": ["test", "unit test", "e2e", "coverage", "jest", "pytest"],
    "security": ["security", "vulnerability", "owasp", "audit", "xss"],
    "database": ["database", "schema", "migration", "sql", "mongodb"],
    # ... 20+ 领域类别
}
```

### 4.3 演进与时效性评估

每个技能都需要通过时效性评估，**分数必须 ≥7/10**：

| 分数 | 描述 | 判定 |
|------|------|------|
| 1-3 | 短暂的，几个月内过时 | 拒绝 |
| 4-6 | 中等，依赖当前工具 | 修订 |
| **7-8** | **稳固，基于原则，可扩展** | **批准** |
| 9-10 | 永恒，解决根本问题 | 典范 |

**评估维度**:
- 6 个月: 使用模式如何演变？
- 1 年: 生态系统可能有什么变化？
- 2 年: 什么新能力可能使其过时？
- 5 年: 核心问题是否仍然相关？

### 4.4 脚本集成框架

技能可以包含自验证的 Python 脚本以实现代理式操作：

| 类别 | 目的 | 何时包含 |
|------|------|----------|
| **验证** | 验证输出符合标准 | 技能产生工件 |
| **生成** | 从模板创建工件 | 可重复的工件创建 |
| **状态管理** | 跨会话跟踪进度 | 长时间运行的操作 |
| **转换** | 转换/处理数据 | 数据处理任务 |
| **计算** | 计算指标/分数 | 评分或分析 |

**脚本要求**:
- Python 3.x + 标准库 (额外依赖优雅降级)
- `Result` 数据类模式用于结构化返回
- 退出码: 0=成功, 1=失败, 10=验证失败, 11=自检失败
- 适用时进行自验证
- 在 SKILL.md 中有使用示例文档

---

## 5. 关键文件说明

### 5.1 SKILL.md (主入口)

YAML frontmatter 定义技能元数据：

```yaml
---
name: skillforge
description: "Intelligent skill router and creator..."
license: MIT
metadata:
  version: 4.0.0
  model: claude-opus-4-5-20251101
  subagent_model: claude-opus-4-5-20251101
  domains: [meta-skill, automation, skill-creation, orchestration]
  type: orchestrator
  inputs: [any-input, user-goal, domain-hints]
  outputs: [SKILL.md, references/, scripts/, recommendations]
---
```

### 5.2 triage_skill_request.py

核心分流脚本，约 800 行 Python 代码：

```python
# 核心数据结构
@dataclass
class Result:
    success: bool
    message: str
    data: dict
    errors: List[str]
    warnings: List[str]

# 操作类型
class Action:
    USE_EXISTING = "USE_EXISTING"
    IMPROVE_EXISTING = "IMPROVE_EXISTING"
    CREATE_NEW = "CREATE_NEW"
    COMPOSE = "COMPOSE"
    CLARIFY = "CLARIFY"

# 核心流程
def triage_request(query: str) -> Result:
    # 1. 分类输入
    category, signals = classify_input(query)
    # 2. 加载技能索引
    index = load_skill_index()
    # 3. 查找匹配技能
    matches = find_matching_skills(query, skills, signals=signals)
    # 4. 做出决策
    action, details = make_triage_decision(category, signals, matches, query)
    return Result(...)
```

### 5.3 multi-lens-framework.md

详细的 11 种思维模型指南，每个透镜包含：
- 核心问题
- 应用协议
- 模板和示例
- 输出格式

---

## 6. 使用方式

### 6.1 安装

```bash
cp -r skillforge ~/.claude/skills/
```

### 6.2 触发器

**创建触发器**:
- `SkillForge: {goal}` - 完整自主技能创建
- `create skill` - 自然语言激活
- `design skill for {purpose}` - 目的优先创建

**路由触发器 (v4.0)**:
- `{any input}` - 自动分析和路由
- `do I have a skill for` - 搜索现有技能
- `which skill` / `what skill` - 推荐匹配技能
- `improve {skill-name} skill` - 进入改进模式

### 6.3 命令

| 命令 | 动作 |
|------|------|
| `SkillForge: {goal}` | 完整自主执行 |
| `SkillForge --plan-only {goal}` | 仅生成规格 |
| `SkillForge --quick {goal}` | 降低深度 (不推荐) |
| `SkillForge --triage {input}` | 仅运行 Phase 0 分流 |
| `SkillForge --improve {skill}` | 进入改进模式 |

---

## 7. 技术要求

- Claude Code CLI
- Claude Opus 4.5 模型访问权限
- Python 3.8+ (用于验证脚本)

---

## 8. 三大核心原则

| 原则 | 实现方式 |
|------|----------|
| **为代理工程化** | 标准化目录结构、XML 模板、自动化验证 |
| **系统化严格性** | 4 阶段架构、回归提问、11 种思维透镜、多代理综合 |
| **为演进设计** | 专用演进代理、强制 ≥7/10 时效性分数、必需扩展点 |

---

## 9. 快速阅读指南

| 优先级 | 文件 | 阅读目的 |
|--------|------|----------|
| 🔴 高 | `SKILL.md` | 理解完整流程和命令 |
| 🔴 高 | `scripts/triage_skill_request.py` | 理解分流逻辑实现 |
| 🟡 中 | `references/multi-lens-framework.md` | 理解分析方法论 |
| 🟡 中 | `references/synthesis-protocol.md` | 理解多代理评审机制 |
| 🟢 低 | `references/script-integration-framework.md` | 理解脚本编写规范 |
| 🟢 低 | `assets/templates/` | 了解模板结构 |

---

## 10. 版本历史

| 版本 | 主要变更 |
|------|----------|
| v4.0.0 (当前) | 重命名为 SkillForge，添加 Phase 0 分流，通用领域匹配 |
| v3.2.0 | 添加脚本集成框架，条件性 Script Agent |
| v3.1.0 | 渐进式披露结构，前置元数据修复 |
| v3.0.0 | 完全重设计为终极元技能，添加回归提问和多代理综合 |
