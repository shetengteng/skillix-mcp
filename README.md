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
- 🔍 **Smart Dispatch** - Intelligent task analysis and skill recommendation
- 🛒 **Skill Market** - Search, install, and uninstall skills from remote sources
- ⚙️ **Configuration Management** - Global and project-level configuration support
- 📦 **Local-First Strategy** - Project skills take precedence over global skills
- 🔧 **MCP Integration** - Seamlessly integrates with AI coding assistants
- 🔄 **Version Rollback** - Built-in backup and version history support

## Quick Start

### Step 1: Install MCP Server

**Option A: One-Click Install (Recommended)**

Click the button below to automatically add Skillix to your Cursor:

[![Install in Cursor](https://img.shields.io/badge/Install%20in-Cursor-blue?style=for-the-badge&logo=cursor)](cursor://anysphere.cursor-deeplink/mcp/install?name=skillix&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJza2lsbGl4LW1jcCJdfQ==)

**Option B: Manual Install**

Add Skillix to your Cursor MCP configuration (`~/.cursor/mcp.json`):

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

### Step 2: Initialize Project

Ask Cursor AI to initialize Skillix for your project:

> "Please initialize Skillix for this project"

Or run the command directly:

```bash
sx-config action=init projectRoot="/path/to/your/project"
```

This will create:
- `.skillix/` directory (project configuration and skills storage)
- `.cursor/rules/skillix.mdc` (Cursor Rule for automatic dispatch)

### Step 3: Start Using

The installed Cursor Rule will automatically guide AI to use `sx-dispatch` for task analysis. Just start a conversation with your task!

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

### sx-dispatch

Smart dispatch tool for task analysis and skill recommendation.

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
sx-dispatch task="Convert PDF to images"
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
| `init` | Initialize project configuration and install Cursor Rule |
| `sources` | Manage skill sources (list/add/remove) |
| `refresh` | Refresh Cursor Rule to the latest version |

**Examples:**

```bash
# Get configuration
sx-config action=get scope=global

# Initialize project (creates .skillix/ and .cursor/rules/skillix.mdc)
sx-config action=init projectRoot=/path/to/project

# Refresh Cursor Rule to latest version
sx-config action=refresh projectRoot=/path/to/project

# Add a skill source
sx-config action=sources sourceAction=add source={"name":"my-source","url":"https://github.com/user/skills"}

# List skill sources
sx-config action=sources sourceAction=list

# Remove a skill source
sx-config action=sources sourceAction=remove sourceName=my-source
```

**Note:** The `init` action automatically installs a Cursor Rule (`.cursor/rules/skillix.mdc`) that guides AI to use `sx-dispatch` for task analysis. Use `refresh` to update the Cursor Rule to the latest version.

### sx-feedback

Skill feedback management tool for recording and analyzing skill usage.

| Action | Description |
|--------|-------------|
| `record` | Record skill execution feedback |
| `list` | List feedback records |
| `analyze` | Analyze feedback and suggest updates |
| `clear` | Clear feedback records |

**Examples:**

```bash
# Record success feedback
sx-feedback action=record skillName=my-skill result=success task="Completed task"

# Record failure feedback
sx-feedback action=record skillName=my-skill result=failure notes="Error message"

# List feedback for a skill
sx-feedback action=list skillName=my-skill days=7

# Analyze skill feedback
sx-feedback action=analyze skillName=my-skill

# Clear feedback
sx-feedback action=clear skillName=my-skill
```

### sx-help

Help information tool.

| Topic | Description |
|-------|-------------|
| `overview` | General overview of Skillix |
| `skill` | sx-skill tool help |
| `config` | sx-config tool help |
| `market` | sx-market tool help |
| `dispatch` | sx-dispatch tool help |
| `feedback` | sx-feedback tool help |
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
├── .skillix/
│   ├── config.json   # Project configuration
│   ├── skills/       # Project-level skills
│   └── logs/         # Project logs
└── .cursor/
    └── rules/
        └── skillix.mdc  # Cursor Rule (auto-installed by sx-config init)
```

## Local-First Strategy

1. **Skill Lookup Order**: Project skills → Global skills → Remote market
2. **Configuration Priority**: Project config → Global config → Default config
3. **Same-Name Skills**: Project-level skills override global skills

## Workflow Examples

### Smart Dispatch Workflow

```
User: Help me convert PDF to images
  ↓
AI → sx-dispatch: Analyze task
  ↓
Dispatch: USE_EXISTING, skill=pdf-converter
  ↓
AI → sx-skill read: Get skill content
  ↓
AI: Execute task following skill instructions
```

### Install from Market

```
User: I need to process Excel files
  ↓
AI → sx-dispatch: Analyze task
  ↓
Dispatch: INSTALL, skill=excel-handler
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
│   │   └── dispatch/        # Smart dispatch
│   ├── tools/             # MCP tool implementations
│   │   ├── skills/        # sx-skill tool
│   │   ├── configs/       # sx-config tool
│   │   ├── markets/       # sx-market tool
│   │   ├── dispatchs/       # sx-dispatch tool
│   │   └── helps/         # sx-help tool
│   └── utils/             # Utility functions
├── tests/                 # Test files
└── docs/                  # Design documents
```

## Troubleshooting

### npx skillix-mcp: command not found

If you encounter this error when running `npx skillix-mcp`:

```
sh: skillix-mcp: command not found
```

Or see multiple `TAR_ENTRY_ERROR` warnings like:

```
npm warn tar TAR_ENTRY_ERROR ENOENT: no such file or directory...
```

**Cause:** The npx cache is corrupted.

**Solution:**

```bash
# Clean npm cache
npm cache clean --force

# Remove corrupted npx cache (optional, if the above doesn't work)
rm -rf ~/.npm/_npx/*

# Try again
npx skillix-mcp
```

### MCP Server not connecting

If Cursor cannot connect to the Skillix MCP Server:

1. **Check configuration file location:**
   - macOS/Linux: `~/.cursor/mcp.json`
   - Windows: `%USERPROFILE%\.cursor\mcp.json`

2. **Verify JSON syntax:**
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

3. **Restart Cursor** after modifying the configuration.

4. **Check Node.js version:**
   ```bash
   node --version  # Should be >= 18.0.0
   ```

### Permission denied errors

If you encounter permission errors:

```bash
# On macOS/Linux, ensure npm global directory is writable
sudo chown -R $(whoami) ~/.npm
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

shetengteng
