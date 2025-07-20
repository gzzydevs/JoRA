# JoRA 🎯

> **J**ust **o**ne **R**eally **A**wesome task manager - Because you don't need to pay for Jira

A simple, offline task management tool that works locally in any project without databases, servers, or subscriptions.

## 🚀 Quick Start

### Method 1: One-line install (coming soon)
```bash
curl -sSL https://raw.githubusercontent.com/your-user/JoRA/main/install.sh | bash
```

### Method 2: Manual download
1. Download the binary for your platform from [Releases](https://github.com/your-user/JoRA/releases)
   - `jora-linux` for Linux
   - `jora-mac` for macOS  
   - `jora-win.exe` for Windows
2. Put it in your project: `mkdir tools && mv jora-* tools/jora`
3. Initialize and run:

```bash
# Initialize JoRA in your project
./tools/jora init

# Start the web interface (opens at http://localhost:3333)
./tools/jora
```

### Method 3: Run from source
```bash
git clone https://github.com/your-user/JoRA.git
cd JoRA
npm install
npm start
```

## 📁 What JoRA creates in your project

```
your-project/
├── cl-todo/
│   ├── config.json         # Project config
│   ├── authors.json        # Team members
│   ├── tags.json          # Available tags
│   ├── epics/             # Epic definitions
│   │   └── frontend.json
│   ├── tasks/             # Individual tasks
│   │   └── task-abc123.json
│   ├── releases/          # Released versions
│   │   └── v1.0.0.json
│   └── current.json       # Current state index
```

## 🎯 Features

- **📋 Kanban Board**: Simple todo → in_progress → ready_to_release workflow
- **📦 Offline**: No internet, no database, no server required
- **🔄 Version Control Friendly**: All data in JSON files that git can track
- **🏷️ Organization**: Tags, epics, subtasks, priorities
- **🚀 Release Management**: Generate releases and clean up completed tasks
- **💻 Multiplataform**: Single binary for Windows, Linux, macOS
- **🌐 Web UI**: Clean interface accessible in your browser

## 📋 Task States

- `todo` - New tasks
- `in_progress` - Currently being worked on  
- `ready_to_release` - Completed and ready for next release

## 🎪 Commands

```bash
jora init          # Initialize JoRA in current directory
jora              # Start web interface (default: http://localhost:3333)
jora --port 8080  # Start on custom port
jora version      # Show version
jora help         # Show help
```

## 🔧 Building from source

```bash
npm install
npm run build     # Builds for all platforms
```

Binaries will be in `dist/` folder.

## 📝 Why JoRA?

- **No vendor lock-in**: Your data is yours, in simple JSON files
- **No subscriptions**: Download once, use forever
- **No complexity**: Just tasks, states, and releases
- **Git-friendly**: Everything can be version controlled
- **Universal**: Works with any programming language or project type

## 🤝 Contributing

PRs welcome! This is meant to be simple and focused.

## 📄 License

MIT - Do whatever you want with it

---

*Made with ❤️ for developers who just want to track tasks without the enterprise bloat*
