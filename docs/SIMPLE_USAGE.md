# 极简使用方式

## 🎯 像 Playwright MCP 一样简单

### 1. Claude Desktop 配置（推荐）

**只需要这一行配置：**

```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "npx",
      "args": ["-y", "@creatoria/miniapp-mcp"]
    }
  }
}
```

**就这样！** 🎉

### 2. 它会自动做什么？

✅ **自动检测项目路径**
- 当前目录有 `project.config.json` 或 `app.json`？使用当前目录
- 没有？检查 `dist/`, `build/`, `miniprogram/`, `src/` 子目录
- 找到了？自动使用

✅ **自动使用默认配置**
- CLI 路径：`/Applications/wechatwebdevtools.app/Contents/MacOS/cli` (macOS)
- 端口：`9420`
- 功能：全部启用

✅ **环境变量覆盖**（可选）
```bash
export MCP_PROJECT_PATH=/path/to/your/miniprogram
export MCP_PORT=9421
```

✅ **配置文件覆盖**（可选）
项目根目录放 `.mcp.json`：
```json
{
  "projectPath": "./dist",
  "port": 9420
}
```

---

## 📋 三种使用场景

### 场景 1: 零配置（项目根目录有小程序）

```
my-project/
├── project.config.json    ← 自动检测到这个
├── app.json
└── pages/
```

**Claude Desktop 配置：**
```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "npx",
      "args": ["-y", "@creatoria/miniapp-mcp"]
    }
  }
}
```

在 `my-project/` 目录下打开 Claude Desktop，它会自动找到小程序。

---

### 场景 2: 小程序在子目录

```
my-project/
├── dist/
│   ├── project.config.json    ← 自动检测到这个
│   └── app.json
└── src/
```

**Claude Desktop 配置：**
```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "npx",
      "args": ["-y", "@creatoria/miniapp-mcp"]
    }
  }
}
```

在 `my-project/` 目录下打开 Claude Desktop，它会自动找到 `dist/` 目录。

---

### 场景 3: 手动指定路径

```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "npx",
      "args": [
        "-y",
        "@creatoria/miniapp-mcp",
        "--project-path",
        "./custom-path"
      ]
    }
  }
}
```

---

## 🆚 对比

### ❌ 以前（复杂）
```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "miniprogram-mcp",
      "args": [
        "--project-path", "/absolute/long/path/to/project",
        "--cli-path", "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
        "--port", "9420",
        "--capabilities", "core,assert,snapshot"
      ]
    }
  }
}
```

### ✅ 现在（极简）
```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "npx",
      "args": ["-y", "@creatoria/miniapp-mcp"]
    }
  }
}
```

---

## 🧪 本地测试（npm link）

```bash
# 1. 在项目目录执行
npm link

# 2. 使用相同的简洁配置
{
  "mcpServers": {
    "miniprogram": {
      "command": "miniprogram-mcp"
    }
  }
}
```

---

## 🔍 调试信息

当 MCP 服务器启动时，会在 stderr 输出：

```
Auto-detected project path: /path/to/your/miniprogram
Loaded config from: /path/to/.mcp.json
Loaded config from environment: projectPath, port
```

查看 Claude Desktop 日志：
- macOS: `~/Library/Logs/Claude/`
- 找到最新的 mcp-server-miniprogram.log

---

## ✨ 发布后的最终体验

**发布到 npm 后，用户只需：**

1. 在小程序项目根目录创建 Claude Desktop 配置
2. 复制这个配置：
   ```json
   {
     "mcpServers": {
       "miniprogram": {
         "command": "npx",
         "args": ["-y", "@creatoria/miniapp-mcp"]
       }
     }
   }
   ```
3. 重启 Claude Desktop
4. 完成！🎉

**就像 Playwright MCP 一样简单！**
