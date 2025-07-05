# Glass by Pickle (中文版)

Glass 是一款由 AI 驱动的桌面助手，旨在将您屏幕上的内容和您听到的对话，无缝转化为可操作的见解。

**当前版本已全面升级，采用 [Clarifai](https://clarifai.com/) 作为统一AI网关，实现了功能与成本的最佳平衡。**

![演示](https://media.pickle.ai/glass-v2-banner.gif)

---

## ✨ 核心优势

*   **统一API，简化配置**：告别管理多个API密钥的烦恼。现在，您只需一个 Clarifai 的访问令牌（PAT），即可驱动所有AI功能。
*   **智能模型路由，兼顾成本与性能**：
    *   **文本处理**：默认使用性价比极高的 **DeepSeek** 模型，保证流畅的文本对话体验。
    *   **视觉与语音**：在需要理解屏幕截图或进行语音转录时，自动切换到功能强大的 **OpenAI GPT-4o** 和 **Whisper** 模型。
*   **无缝集成**：无论您是在观看在线课程、参加视频会议，还是处理日常工作，Glass 都能在后台静默运行，在您需要时提供即时帮助。
*   **隐私优先**：您的API密钥安全地存储在本地设备上，我们绝不上传或记录。

## 🚀 快速开始

### 1. 获取 Clarifai 访问令牌 (PAT)

这是唯一的必需步骤。此令牌将作为您调用所有AI模型的统一凭证。

1.  **访问** [**Clarifai 安全设置页面**](https://clarifai.com/settings/security)。
2.  点击 **"Create Personal Access Token"**（创建个人访问令牌）。
3.  **描述**：为令牌命名，例如 "Glass App"。
4.  **权限范围 (Scopes)**：**务必勾选 "Select all scopes"**，以确保所有功能（文本、视觉、语音）都能正常工作。
5.  **复制** 生成的令牌。

![Clarifai PAT](https://media.pickle.ai/clarifai-pat-creation-guide.png)

### 2. 安装与配置

您只需要下载最新的发行版并运行即可。

1.  **下载**：从 [Releases 页面](https://github.com/your-repo/releases) 下载适用于您操作系统的最新版本。
2.  **安装**：安装应用程序。
3.  **配置**：
    *   首次启动时，应用会提示您输入API密钥。
    *   点击界面上的"设置"图标。
    *   将您在第一步中复制的 **Clarifai PAT** 粘贴到输入框中，并点击"保存"。

### 3. 开始使用

配置完成后，Glass 将自动开始工作。通过快捷键（默认为 `Cmd/Ctrl+Shift+Y`）或点击托盘图标来与它交互。

## 🛠️ (可选) 开发人员：从源码运行

如果您想从源代码运行或进行二次开发：

1.  **克隆仓库**
    ```bash
    git clone https://github.com/jason-michael/glass.git
    cd glass
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **设置环境变量** (可选，如果不想在UI中设置)
    在项目根目录创建一个 `.env` 文件，并添加您的密钥：
    ```
    CLARIFAI_PAT=您的Clarifai个人访问令牌
    ```

4.  **运行应用**
    ```bash
    npm start
    ```

---

如果您有任何问题或建议，欢迎随时提出！

## 🚀 核心理念

Glass是一个运行在您电脑上的轻量级AI助理。它能看到您的屏幕，听到您的声音，并根据上下文为您提供实时帮助，将您的日常操作和对话转化为结构化的知识。

-   **💬 会议助手**：实时生成会议摘要、提取行动项、即时回答问题。
-   **✍️ 智能问答**：基于您的屏幕内容和操作历史，提供精准解答。
-   **🫥 隐私优先**：Glass在设计上完全不可见，不会出现在屏幕录制、截图或任务栏中，保障您的隐私。

---

## ✨ **快速上手（API模式）**

本指南将带您使用**纯API模式**运行Glass，**无需本地部署模型，对电脑配置无要求**。

### **第一步：获取API密钥**

为了让Glass能够"思考"，您需要从以下两个服务商获取API密钥。我们采用了**混合模型策略**，以实现最佳的性价比和功能完整性。

1.  **DeepSeek API Key**（处理文本，**价格便宜**）
    *   访问 [DeepSeek官网](https://platform.deepseek.com/api_keys)
    *   注册并创建一个API密钥。
    *   **用途**：处理所有纯文本的问答，成本极低。

2.  **OpenAI API Key**（处理图像和语音，**功能强大**）
    *   访问 [OpenAI官网](https://platform.openai.com/api-keys)
    *   注册并创建一个API密钥。
    *   **用途**：处理需要"看"屏幕内容（图像理解）和"听"声音（实时语音转录）的复杂任务。

> **提示**：您可以先只配置一个，但某些功能会受限。建议两个都配置以体验完整功能。

### **第二步：配置您的密钥**

1.  在项目的根目录下，创建一个名为 `.env` 的文件。
2.  将您的API密钥按以下格式粘贴到文件中：

    ```env
    # 将 "your-key-here" 替换为您自己的密钥
    OPENAI_API_KEY=your-openai-key-here
    DEEPSEEK_API_KEY=your-deepseek-key-here
    ```

> **注意**：您也可以不创建此文件，直接在应用启动后的设置界面中输入密钥。

### **第三步：安装和运行**

确保您的电脑已经安装了 [Node.js](https://nodejs.org/en/download) (版本 20.x.x) 和 [Python](https://www.python.org/downloads/)。

然后，在项目根目录下打开终端，运行以下命令：

```bash
# 一键安装所有依赖并启动应用
npm run setup
```

这个命令会自动完成所有安装、构建和启动步骤。稍等片刻，您就可以看到Glass的界面了。

---

## 🔧 **核心功能与使用**

### **1. Ask（智能问答）**

-   **快捷键**：`Ctrl/Cmd + Enter`
-   **功能**：随时向AI提问。
    -   **无图模式 (DeepSeek)**：如果您只是提一个普通问题，Glass会使用更便宜的DeepSeek API为您解答。
    -   **识图模式 (OpenAI)**：在提问时，Glass会自动截取您当前的屏幕内容并发送给AI。AI会根据屏幕上的上下文来回答您的问题，例如"总结一下这个页面的内容"或"帮我把这段代码转换成Python"。

### **2. Listen（实时会议助手）**

-   **如何启动**：点击系统托盘/菜单栏的Glass图标，选择"Start Session"。
-   **功能 (OpenAI)**：
    -   **实时语音转文字**：将会议中的对话实时转换成文字。
    -   **会议摘要**：自动生成会议的核心要点和摘要。
    -   **行动项提取**：识别并列出会议中提到的待办事项。

### **3. 自定义设置**

您可以在设置界面中：
-   管理您的API密钥。
-   自定义快捷键。
-   调整界面外观（如透明度）。
-   管理您的对话历史和数据。

---

## ⌨️ **常用快捷键**

| 快捷键             | 功能                         |
| ------------------ | ---------------------------- |
| `Ctrl/Cmd + \`      | 显示/隐藏主窗口              |
| `Ctrl/Cmd + Enter` | 提问（Ask功能）              |
| `Ctrl/Cmd + 方向键` | 移动主窗口位置               |

---

## ❓ **常见问题 (FAQ)**

**Q: 我的电脑配置一般，真的可以运行吗？**  
A: 当然！我们已经转向了纯API模式，所有计算都在云端完成，对您的电脑配置**没有任何要求**。

**Q: 我的数据安全吗？**  
A: 当您使用API时，相关数据（例如提问的文本和屏幕截图）会被发送给对应的服务商（DeepSeek或OpenAI）进行处理。请遵守他们的隐私政策。Glass应用本身不会在本地存储您的敏感数据，除非您主动保存。

**Q: 使用API会花很多钱吗？**  
A: 我们设计的混合模型就是为了省钱。大部分纯文本请求都由非常便宜的DeepSeek处理。只有在需要图像和语音识别时才会使用OpenAI。对于普通用户来说，每月成本通常很低。您可以随时在服务商的后台查看用量。

**Q: 我可以只用一个API密钥吗？**  
A: 可以。
-   **只配置DeepSeek**：您将只能使用纯文本问答功能。
-   **只配置OpenAI**：您可以使用所有功能，但成本会比混合模式高。

---

<p align="center">
  <strong>现在就开始您的AI助理之旅吧！</strong>
</p>

## 🚀 快速启动

### 💻 直接下载（推荐）
⚡️ 跳过设置步骤——直接运行我们的macOS应用。 [[点击下载]](https://www.dropbox.com/scl/fi/znid09apxiwtwvxer6oc9/Glass_latest.dmg?rlkey=gwvvyb3bizkl25frhs4k1zwds&st=37q31b4w&dl=1)

### 🛠️ 本地构建

#### 系统要求

首先下载并安装 [Python](https://www.python.org/downloads/) 和 [Node.js](https://nodejs.org/en/download)。

**Windows用户**：还需要安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)

**重要**：确保使用Node.js 20.x.x版本，避免原生依赖的构建错误。

```bash
# 检查Node.js版本
node --version

# 如果需要安装Node.js 20.x.x，推荐使用nvm：
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# nvm install 20
# nvm use 20
```

#### 安装步骤

```bash
# 一键安装和运行
npm run setup
```

这个命令会：
1. 安装所有依赖
2. 构建Web应用
3. 启动Electron应用

## ✨ 核心功能

### 🔍 Ask功能：智能问答助手

<img width="100%" alt="ask-feature" src="./public/assets/00.gif">

**功能特点**：
- 📸 自动截取当前屏幕内容
- 📝 分析所有历史屏幕操作和音频记录
- 🤖 多模态AI理解（文本+图像）
- ⚡ 实时流式回答
- 🎨 代码语法高亮
- 📋 一键复制功能

### 🎧 Listen功能：实时会议助手

<img width="100%" alt="listen-feature" src="./public/assets/01.gif">

**功能特点**：
- 🎙️ 双向音频捕获（您的声音+对方声音）
- 📝 实时语音转文本
- 📊 自动生成会议摘要和洞察
- 🌐 支持多种语言
- ❓ 智能建议后续问题
- 💾 会话记录持久化

### 🔧 Customize功能：个性化设置

**功能特点**：
- ⌨️ 自定义快捷键
- 🎨 调整界面透明度和字体大小
- 🔒 内容保护开关
- 🌍 语言和配置文件选择
- 🔑 API密钥管理
- 📱 Firebase云同步（可选）

### 🔑 API密钥管理

<img width="100%" alt="api-key" src="./public/assets/02.gif">

**两种使用方式**：
1. **使用您自己的OpenAI API密钥** - 访问 [OpenAI API Keys](https://platform.openai.com/api-keys) 获取
2. **使用我们的免费服务** - 注册账户即可使用

### 🌊 未来功能：液体玻璃设计

<img width="100%" alt="liquid-glass" src="./public/assets/03.gif">

*即将推出的未来界面设计*

## 🏗️ 技术架构

### 🖥️ 桌面应用层
- **Electron** - 跨平台桌面应用框架
- **LitElement** - 轻量级Web组件
- **SQLite** - 本地数据存储

### 🌐 Web应用层
- **Next.js** - React框架
- **Tailwind CSS** - 样式框架
- **TypeScript** - 类型安全

### ☁️ 后端服务层
- **Node.js + Express** - API服务器
- **Firebase** - 云端认证和存储
- **WebSocket** - 实时通信

### 🤖 AI集成层
- **OpenAI API** - 语言模型和语音识别
- **实时语音转文本** - 会议转录
- **多模态理解** - 文本+图像分析

## 🔒 隐私和安全

### 🫥 真正的隐身模式
- ❌ 不会出现在屏幕录制中
- ❌ 不会出现在截图中
- ❌ 不会显示在Dock中
- ❌ 无需持续后台捕获
- ✅ 完全隐藏运行

### 🔐 数据保护
- 🏠 本地优先的数据存储
- 🔒 可选的内容保护功能
- 🌐 可选的云端同步
- 🔑 用户控制的API密钥

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 🐛 报告问题
- 使用GitHub Issues报告bug
- 提供详细的复现步骤
- 包含系统信息和错误日志

### 💡 功能建议
- 在Issues中提出新功能想法
- 参与Discord讨论
- 贡献代码实现

### 🔧 开发指南
```bash
# 克隆仓库
git clone https://github.com/pickle-com/glass.git

# 安装依赖
npm run setup

# 开发模式
npm run start

# 构建应用
npm run build
```

## 📚 详细文档

观看我们的详细教程视频：[YouTube教程](https://www.youtube.com/watch?v=qHg3_4bU1Dw)

*我们不花钱做花哨的视频，我们只专注于编码。*

## 🍃 关于Pickle

**我们的使命是为每个人构建一个活生生的数字分身。** Glass是第一步——一个可信的管道，将您的日常数据转化为可扩展的数字分身。

访问 [pickle.com](https://pickle.com) 了解更多。

## 📈 项目统计

[![Star History Chart](https://api.star-history.com/svg?repos=pickle-com/glass&type=Date)](https://www.star-history.com/#pickle-com/glass&Date)

## 📄 许可证

本项目使用 GPL-3.0 许可证。详见 [LICENSE](LICENSE) 文件。

## 🌟 支持我们

如果这个项目对您有帮助，请给我们一个⭐️！

---

<p align="center">
  <strong>Glass by Pickle - 让AI成为您思维的延伸</strong>
</p> 