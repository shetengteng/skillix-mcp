# Skill-Creator 实现原理分析

> 最后更新：2026-01-09

## 1. 项目概述

**Skill-Creator** 是 Anthropic 官方提供的技能创建指南技能，位于 `skills/skills/skill-creator/` 目录下。它是一个"元技能"——教你如何创建其他技能的技能。

### 1.1 核心定位

```yaml
name: skill-creator
description: Guide for creating effective skills. This skill should be used when 
users want to create a new skill (or update an existing skill) that extends 
Claude's capabilities with specialized knowledge, workflows, or tool integrations.
```

### 1.2 目录结构

```
skill-creator/
├── SKILL.md                    # 主技能文件 (~357 行)
├── LICENSE.txt                 # 许可证 (Apache 2.0 类)
├── references/
│   ├── workflows.md            # 工作流模式指南 (28 行)
│   └── output-patterns.md      # 输出模式指南 (83 行)
└── scripts/
    ├── init_skill.py           # 初始化技能脚本 (303 行)
    ├── package_skill.py        # 打包技能脚本 (110 行)
    └── quick_validate.py       # 快速验证脚本 (95 行)
```

---

## 2. 核心原理

### 2.1 技能的本质

技能是**模块化、自包含的扩展包**，通过以下方式扩展 Claude 的能力：

| 类型 | 说明 | 示例 |
|------|------|------|
| **专业工作流** | 特定领域的多步骤程序 | PDF 表单填写流程 |
| **工具集成** | 与特定文件格式或 API 交互的指令 | Excel 操作指南 |
| **领域专业知识** | 公司特定知识、模式、业务逻辑 | BigQuery 表结构 |
| **捆绑资源** | 用于复杂和重复任务的脚本、参考和资产 | Python 脚本库 |

### 2.2 设计原则

#### 原则 1: 简洁是关键

```
上下文窗口是公共资源。技能与其他所有内容共享上下文窗口：
系统提示、对话历史、其他技能元数据、用户请求。

默认假设：Claude 已经非常智能。
只添加 Claude 还不知道的上下文。

挑战每条信息：
- "Claude 真的需要这个解释吗？"
- "这段话值得消耗的 token 吗？"
```

#### 原则 2: 设置适当的自由度

匹配任务脆弱性和变化性来确定具体程度：

| 自由度 | 适用场景 | 形式 |
|--------|----------|------|
| **高** | 多种方法有效、决策依赖上下文 | 文本指令 |
| **中** | 存在首选模式、某些变化可接受 | 伪代码或带参数的脚本 |
| **低** | 操作脆弱易错、一致性关键 | 具体脚本，少量参数 |

> 比喻：想象 Claude 在探索路径。有悬崖的窄桥需要具体护栏（低自由度），开阔田野允许多条路线（高自由度）。

#### 原则 3: 渐进式披露

三级加载系统高效管理上下文：

```
Level 1: 元数据 (name + description)
         → 始终在上下文中 (~100 词)

Level 2: SKILL.md 正文
         → 技能触发时加载 (<5k 词)

Level 3: 捆绑资源 (scripts/references/assets)
         → Claude 按需加载 (无限制，脚本可不读入上下文直接执行)
```

---

## 3. 技能结构规范

### 3.1 必需结构

```
skill-name/
├── SKILL.md (必需)
│   ├── YAML frontmatter (必需)
│   │   ├── name: (必需)
│   │   └── description: (必需)
│   └── Markdown 指令 (必需)
└── 捆绑资源 (可选)
    ├── scripts/      - 可执行代码
    ├── references/   - 按需加载的文档
    └── assets/       - 输出中使用的文件
```

### 3.2 YAML Frontmatter 规范

**允许的属性**:

| 属性 | 必需 | 说明 |
|------|------|------|
| `name` | ✅ 是 | 技能名称，hyphen-case，最大 64 字符 |
| `description` | ✅ 是 | 技能描述，最大 1024 字符，不含 `<>` |
| `license` | ❌ 否 | 许可证信息 |
| `allowed-tools` | ❌ 否 | 允许使用的工具 |
| `metadata` | ❌ 否 | 自定义元数据 |

**验证规则**:
- `name`: 只允许小写字母、数字、连字符
- `name`: 不能以连字符开头/结尾，不能有连续连字符
- `description`: 不能包含尖括号 `<` 或 `>`

### 3.3 捆绑资源说明

#### scripts/ - 可执行脚本

```python
# 适用场景：
# - 相同代码被重复编写
# - 需要确定性可靠性
# - 可以不加载到上下文直接执行

# 示例：
scripts/rotate_pdf.py      # PDF 旋转
scripts/fill_form.py       # 表单填写
scripts/extract_text.py    # 文本提取
```

#### references/ - 参考文档

```markdown
# 适用场景：
# - Claude 工作时需要参考的文档
# - 数据库模式、API 文档、领域知识
# - 详细工作流指南

# 示例：
references/finance.md      # 财务模式
references/api_docs.md     # API 规范
references/policies.md     # 公司政策

# 最佳实践：
# - 大文件 (>10k 词) 在 SKILL.md 中包含 grep 搜索模式
# - 信息只在一处存在，避免重复
```

#### assets/ - 资产文件

```
# 适用场景：
# - 最终输出中使用的文件
# - 不需要加载到上下文

# 示例：
assets/logo.png            # 品牌资产
assets/slides.pptx         # PowerPoint 模板
assets/frontend-template/  # HTML/React 样板
assets/font.ttf            # 字体文件
```

---

## 4. 脚本实现分析

### 4.1 init_skill.py - 初始化脚本

**功能**: 从模板创建新技能目录

**使用方式**:
```bash
scripts/init_skill.py <skill-name> --path <output-directory>

# 示例
scripts/init_skill.py my-new-skill --path skills/public
```

**核心流程**:

```python
def init_skill(skill_name, path):
    """
    1. 创建技能目录
    2. 生成 SKILL.md 模板（带 TODO 占位符）
    3. 创建 scripts/ 目录和示例脚本
    4. 创建 references/ 目录和示例文档
    5. 创建 assets/ 目录和示例文件
    6. 输出下一步指引
    """
```

**生成的模板结构**:
```
my-new-skill/
├── SKILL.md                          # 带 TODO 的模板
├── scripts/
│   └── example.py                    # 示例脚本
├── references/
│   └── api_reference.md              # 示例参考文档
└── assets/
    └── example_asset.txt             # 示例资产占位符
```

**SKILL.md 模板包含**:
- YAML frontmatter 结构
- 结构模式选择指南（4 种模式）
- 资源目录说明
- TODO 占位符

### 4.2 quick_validate.py - 验证脚本

**功能**: 验证技能是否符合规范

**验证规则**:

```python
def validate_skill(skill_path):
    # 1. 检查 SKILL.md 存在
    # 2. 检查 YAML frontmatter 格式
    # 3. 检查只包含允许的属性
    ALLOWED_PROPERTIES = {'name', 'description', 'license', 'allowed-tools', 'metadata'}
    
    # 4. 检查必需字段
    # 5. 验证 name 格式
    #    - hyphen-case (小写字母、数字、连字符)
    #    - 不以连字符开头/结尾
    #    - 无连续连字符
    #    - 最大 64 字符
    
    # 6. 验证 description 格式
    #    - 不含尖括号
    #    - 最大 1024 字符
```

**使用方式**:
```bash
python quick_validate.py <skill_directory>

# 输出
# ✅ Skill is valid!
# 或
# ❌ Missing 'name' in frontmatter
```

### 4.3 package_skill.py - 打包脚本

**功能**: 将技能打包为可分发的 `.skill` 文件

**使用方式**:
```bash
python package_skill.py <path/to/skill-folder> [output-directory]

# 示例
python package_skill.py skills/public/my-skill ./dist
```

**核心流程**:

```python
def package_skill(skill_path, output_dir=None):
    # 1. 验证技能文件夹存在
    # 2. 验证 SKILL.md 存在
    
    # 3. 运行验证（调用 quick_validate）
    valid, message = validate_skill(skill_path)
    if not valid:
        return None  # 验证失败则不打包
    
    # 4. 创建 ZIP 文件（.skill 扩展名）
    with zipfile.ZipFile(skill_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in skill_path.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(skill_path.parent)
                zipf.write(file_path, arcname)
    
    # 5. 输出成功信息
```

**输出**:
- 文件名: `<skill-name>.skill`
- 格式: ZIP 压缩，带 `.skill` 扩展名
- 保持完整目录结构

---

## 5. 工作流模式参考

### 5.1 顺序工作流

用于复杂任务，将操作分解为清晰的顺序步骤：

```markdown
填写 PDF 表单涉及以下步骤：

1. 分析表单 (运行 analyze_form.py)
2. 创建字段映射 (编辑 fields.json)
3. 验证映射 (运行 validate_fields.py)
4. 填写表单 (运行 fill_form.py)
5. 验证输出 (运行 verify_output.py)
```

### 5.2 条件工作流

用于有分支逻辑的任务：

```markdown
1. 确定修改类型：
   **创建新内容？** → 按照下方"创建工作流"
   **编辑现有内容？** → 按照下方"编辑工作流"

2. 创建工作流: [步骤]
3. 编辑工作流: [步骤]
```

---

## 6. 输出模式参考

### 6.1 模板模式

用于需要一致输出格式的场景：

**严格要求（如 API 响应）**:
```markdown
## 报告结构

始终使用这个精确的模板结构：

# [分析标题]

## 执行摘要
[一段关键发现概述]

## 主要发现
- 发现 1 及支持数据
- 发现 2 及支持数据

## 建议
1. 具体可操作建议
2. 具体可操作建议
```

**灵活指导（需要适应时）**:
```markdown
## 报告结构

这是合理的默认格式，但请根据情况调整：

# [分析标题]

## 执行摘要
[概述]

## 主要发现
[根据发现调整部分]

根据具体分析类型调整章节。
```

### 6.2 示例模式

用于输出质量依赖于示例的场景：

```markdown
## 提交消息格式

按照以下示例生成提交消息：

**示例 1:**
输入: Added user authentication with JWT tokens
输出:
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware

**示例 2:**
输入: Fixed bug where dates displayed incorrectly
输出:
fix(reports): correct date formatting in timezone conversion

遵循此风格: type(scope): 简短描述，然后详细说明。
```

---

## 7. 创建流程总结

### 7.1 六步流程

```
Step 1: 理解技能
        ↓ 通过具体示例理解需求
Step 2: 规划内容
        ↓ 分析示例，确定 scripts/references/assets
Step 3: 初始化技能
        ↓ 运行 init_skill.py
Step 4: 编辑技能
        ↓ 实现资源，编写 SKILL.md
Step 5: 打包技能
        ↓ 运行 package_skill.py
Step 6: 迭代改进
        ↓ 根据实际使用反馈优化
```

### 7.2 决策问题

| 步骤 | 关键问题 |
|------|----------|
| **理解** | "这个技能应该支持什么功能？""什么会触发这个技能？" |
| **规划** | "执行这个需要重写相同代码吗？""需要什么参考文档？" |
| **编辑** | "Claude 真的需要这个信息吗？""这值得消耗的 token 吗？" |

---

## 8. 不应包含的内容

技能应该只包含支持其功能的必要文件。**不要创建**:

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 用户面向的文档
- 创建过程的记录
- 设置和测试程序

> 技能是给 AI 代理使用的，不是给人类阅读的文档。

---

## 9. 渐进式披露模式

### 模式 1: 高级指南 + 参考文档

```markdown
# PDF 处理

## 快速开始
[代码示例]

## 高级功能
- **表单填写**: 见 [FORMS.md](FORMS.md)
- **API 参考**: 见 [REFERENCE.md](REFERENCE.md)
```

Claude 只在需要时加载 FORMS.md 或 REFERENCE.md。

### 模式 2: 领域/变体组织

```
bigquery-skill/
├── SKILL.md (概述和导航)
└── references/
    ├── finance.md (收入、计费指标)
    ├── sales.md (机会、管道)
    └── product.md (API 使用、功能)
```

询问销售指标时，Claude 只读取 sales.md。

### 模式 3: 条件详情

```markdown
# DOCX 处理

## 创建文档
使用 docx-js 创建新文档。见 [DOCX-JS.md](DOCX-JS.md)。

## 编辑文档
简单编辑直接修改 XML。

**跟踪更改**: 见 [REDLINING.md](REDLINING.md)
**OOXML 详情**: 见 [OOXML.md](OOXML.md)
```

---

## 10. 与 SkillForge 的对比

| 方面 | Skill-Creator | SkillForge |
|------|---------------|------------|
| **类型** | 创建指南/手册 | 自动化创建系统 |
| **方法** | 人工遵循步骤 | 4阶段自主执行 |
| **分析** | 用户自行分析 | 11种思维透镜自动分析 |
| **验证** | 基础格式验证 | 多代理综合评审 |
| **输出** | 符合规范的技能 | 高质量、经过评审的技能 |
| **适用** | 简单技能、学习 | 复杂技能、高质量要求 |

**总结**: Skill-Creator 是"教程"，SkillForge 是"自动化工厂"。两者可以结合使用——用 Skill-Creator 的规范理解技能结构，用 SkillForge 的方法论创建高质量技能。
