# Skillix MCP Server

> Skill + Mix = Skillix — Mix skills, empower AI

Skillix is an MCP (Model Context Protocol) based skill management system that provides AI coding agents (like Cursor) with the ability to create, manage, load, and evolve skills.

## 🚀 Quick Install for Cursor

### One-Click Install

Click the button below to automatically add Skillix to your Cursor MCP configuration:

[![Install in Cursor](https://img.shields.io/badge/Install%20in-Cursor-blue?style=for-the-badge&logo=cursor)](cursor://anysphere.cursor-deeplink/mcp/install?name=skillix&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJza2lsbGl4LW1jcCJdfQ==)

### Manual Install

Copy the following JSON configuration and add it to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "skillix": {
      "command": "npx",
      "args": ["skillix-mcp"]
    }
  }
}
```

**Configuration file location:** `~/.cursor/mcp.json`

## Features

- 🎯 **Skill Management** - Create, read, update, delete local skills with version control
- 🔍 **Smart Triage** - Intelligent task analysis and skill recommendation
- 🛒 **Skill Market** - Search, install, and uninstall skills from remote sources
- ⚙️ **Configuration Management** - Global and project-level configuration support
- 📦 **Local-First Strategy** - Project skills take precedence over global skills
- 🔧 **MCP Integration** - Seamlessly integrates with AI coding assistants
- 🔄 **Version Rollback** - Built-in backup and version history support

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Using npx (Recommended)

No installation required! Just add the configuration to your MCP settings:

```json
{
  "mcpServers": {
    "skillix": {
      "command": "npx",
      "args": ["skillix-mcp"]
    }
  }
}
```

### Install from npm

```bash
npm install -g skillix-mcp
```

Then configure:

```json
{
  "mcpServers": {
    "skillix": {
      "command": "skillix-mcp"
    }
  }
}
```

### Install from Source

```bash
# Clone the repository
git clone https://github.com/shetengteng/skillix-mcp.git
cd skillix-mcp

# Install dependencies
npm install

# Build
npm run build
```

Then configure:

```json
{
  "mcpServers": {
    "skillix": {
      "command": "node",
      "args": ["/path/to/skillix-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

### sx-triage

Smart triage tool for task analysis and skill recommendation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| task | string | ✅ | Task description |
| context | string | ❌ | Context information |
| hints | string[] | ❌ | Hint keywords |
| projectRoot | string | ❌ | Project root directory |

**Action Types:**
- `USE_EXISTING` - Use an existing skill
- `IMPROVE_EXISTING` - Improve an existing skill
- `CREATE_NEW` - Create a new skill
- `INSTALL` - Install from market
- `COMPOSE` - Combine multiple skills
- `NO_SKILL_NEEDED` - No skill required

**Example:**

```bash
# Analyze a task
sx-triage task="Convert PDF to images"
```

### sx-skill

Local skill management tool.

| Action | Description |
|--------|-------------|
| `list` | List all global and project skills |
| `read` | Read skill details including metadata and content |
| `create` | Create a new skill with directory structure |
| `update` | Update existing skill metadata or content (with auto backup) |
| `delete` | Delete a skill and all its files |

**Examples:**

```bash
# List all skills
sx-skill action=list

# Read a skill
sx-skill action=read name=my-skill

# Create a new skill
sx-skill action=create name=my-skill metadata={"name":"my-skill","description":"My first skill"} body="# My Skill\n\nSkill content here..."

# Update a skill (supports partial update)
sx-skill action=update name=my-skill metadata={"version":"1.1.0"}

# Update skill content
sx-skill action=update name=my-skill body="# Updated Content"

# Delete a skill
sx-skill action=delete name=my-skill
```

### sx-market

Skill market tool for searching, installing, and managing remote skills.

| Action | Description |
|--------|-------------|
| `search` | Search skills in the market |
| `install` | Install a skill from market |
| `uninstall` | Uninstall an installed skill |
| `sync` | Sync skill source cache |
| `status` | View source status |

**Examples:**

```bash
# Search for skills
sx-market action=search query=pdf

# Install a skill
sx-market action=install name=pdf-converter scope=global

# Install with force overwrite
sx-market action=install name=pdf-converter force=true

# Uninstall a skill
sx-market action=uninstall name=pdf-converter

# Sync all sources
sx-market action=sync

# View source status
sx-market action=status
```

### sx-config

Configuration management tool.

| Action | Description |
|--------|-------------|
| `get` | Get global or project configuration |
| `set` | Set configuration value |
| `init` | Initialize project configuration |
| `sources` | Manage skill sources (list/add/remove) |

**Examples:**

```bash
# Get configuration
sx-config action=get scope=global

# Initialize project
sx-config action=init projectRoot=/path/to/project

# Add a skill source
sx-config action=sources sourceAction=add source={"name":"my-source","url":"https://github.com/user/skills"}

# List skill sources
sx-config action=sources sourceAction=list

# Remove a skill source
sx-config action=sources sourceAction=remove sourceName=my-source
```

### sx-help

Help information tool.

| Topic | Description |
|-------|-------------|
| `overview` | General overview of Skillix |
| `skill` | sx-skill tool help |
| `config` | sx-config tool help |
| `market` | sx-market tool help |
| `triage` | sx-triage tool help |
| `all` | All help topics |

**Examples:**

```bash
# Get overview help
sx-help topic=overview

# Get skill tool help
sx-help topic=skill
```

## Skill Format

Skills are defined using Markdown files with YAML frontmatter:

```markdown
---
name: my-skill
description: A description of what this skill does
version: 1.0.0
author: your-name
tags: [tag1, tag2]
---

# My Skill

Skill content and instructions here...
```

### Skill Directory Structure

```
my-skill/
├── SKILL.md          # Required: Skill definition file
├── scripts/          # Optional: Executable scripts
├── references/       # Optional: Reference documents
├── assets/           # Optional: Resource files
├── logs/             # Optional: Execution logs
│   ├── execution.log # Execution history
│   └── evolution.log # Evolution history
└── .backup/          # Auto-generated: Version backups
```

### Naming Rules

- Format: hyphen-case (lowercase letters, numbers, hyphens)
- Must start with a lowercase letter
- Length: 2-64 characters
- Example: ✅ `pdf-converter` ❌ `PDF_Converter`

## Storage Locations

### Global Directory (`~/.skillix/`)

```
~/.skillix/
├── config.json       # Global configuration
├── skills/           # Global skills directory
├── installed.json    # Installation records
├── logs/             # System logs
├── cache/            # Cache directory
│   ├── repos/        # Git repository cache
│   └── indexes/      # Source indexes
└── data/             # Data directory
```

### Project Directory (`.skillix/`)

```
project/
└── .skillix/
    ├── config.json   # Project configuration
    ├── skills/       # Project-level skills
    └── logs/         # Project logs
```

## Local-First Strategy

1. **Skill Lookup Order**: Project skills → Global skills → Remote market
2. **Configuration Priority**: Project config → Global config → Default config
3. **Same-Name Skills**: Project-level skills override global skills

## Workflow Examples

### Smart Triage Workflow

```
User: Help me convert PDF to images
  ↓
AI → sx-triage: Analyze task
  ↓
Triage: USE_EXISTING, skill=pdf-converter
  ↓
AI → sx-skill read: Get skill content
  ↓
AI: Execute task following skill instructions
```

### Install from Market

```
User: I need to process Excel files
  ↓
AI → sx-triage: Analyze task
  ↓
Triage: INSTALL, skill=excel-handler
  ↓
AI → sx-market install: Install skill
  ↓
AI → sx-skill read: Get skill content
  ↓
AI: Execute task
```

## Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Start server
npm start
```

## Architecture

```
skillix-mcp/
├── src/
│   ├── index.ts           # MCP Server entry
│   ├── services/          # Business logic layer
│   │   ├── skill/         # Skill management
│   │   ├── config/        # Configuration management
│   │   ├── market/        # Market operations
│   │   └── triage/        # Smart triage
│   ├── tools/             # MCP tool implementations
│   │   ├── skills/        # sx-skill tool
│   │   ├── configs/       # sx-config tool
│   │   ├── markets/       # sx-market tool
│   │   ├── triages/       # sx-triage tool
│   │   └── helps/         # sx-help tool
│   └── utils/             # Utility functions
├── tests/                 # Test files
└── docs/                  # Design documents
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

shetengteng
