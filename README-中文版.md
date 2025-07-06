# Glass by Pickle (中文版)

Glass 是一款由 AI 驱动的桌面助手，旨在将您屏幕上的内容和您听到的对话，无缝转化为可操作的见解。

**当前版本采用智能LiteLLM路由架构，支持多个AI提供商，实现了功能与成本的最佳平衡。**

![演示](https://media.pickle.ai/glass-v2-banner.gif)

---

## ✨ 核心功能

*   **智能问答 (Ask)**: 随时通过快捷键`Ctrl+Shift+Y`提问。Glass能理解您屏幕上的内容，并结合上下文提供精准回答。无论是总结网页、解释代码，还是翻译文本，它都能胜任。
*   **实时会议助手 (Listen)**: 自动进行语音转录，并实时生成会议摘要、提取行动要点、总结关键决策。让您专注于沟通，不再分心于记笔记。
*   **隐私优先**: 应用在设计上完全不可见，不会出现在屏幕录制或截图中，充分保障您的隐私。
*   **智能路由**: 根据任务复杂度自动选择最合适的AI模型，简单任务使用经济模型，复杂任务使用高性能模型。

---

## 🚀 快速安装与配置

### 第 1 步：下载与安装

从 [Releases 页面](https://github.com/your-repo/releases) 下载适用于您操作系统的最新版本并安装。

### 第 2 步：AI服务配置

**Glass使用智能LiteLLM路由架构，支持自动模型选择：**

Glass集成了Railway部署的LiteLLM服务，可以：
- 📝 **文本任务**自动使用DeepSeek（高性价比）
- 🖼️ **图像分析**自动使用OpenAI（视觉能力）
- 🔄 **智能路由**根据任务复杂度选择最合适的模型

**配置选项：**

1. **简单配置**（推荐）：
   - 只需配置OpenAI API密钥即可使用所有功能
   - 访问 [OpenAI官网](https://platform.openai.com/) 创建API密钥

2. **高级配置**（可选）：
   - 如需更便宜的文本处理，可额外配置DeepSeek API
   - 访问 [DeepSeek官网](https://platform.deepseek.com/) 注册（成本约为OpenAI的1/10）

### 第 3 步：启动配置

首次启动应用会显示"Choose how to power your AI"界面：
- 输入您的OpenAI API密钥
- 应用会自动处理智能路由和模型选择

---

## 📖 使用指南

### 1. 提问 (Ask)
*   **触发方式**: 使用快捷键 `Ctrl+Shift+Y` (Windows) 或 `Cmd+Shift+Y` (Mac) 来打开提问窗口。
*   **如何使用**:
    *   **常规提问**: 直接输入您的问题，如"帮我写一封邮件"。
    *   **基于屏幕内容提问**: 在提问时，Glass会自动捕获您当前的屏幕截图。您可以问："总结一下这个页面的内容"或"这段代码有什么问题？"

### 2. 实时转录 (Listen)
*   **触发方式**: 点击系统托盘/菜单栏中的Glass图标，选择 "Start Session"。
*   **如何使用**: 会议开始时启动会话即可。Glass会在后台自动记录和分析，会话结束后您可以在历史记录中查看摘要和转录文本。

---

## 🛠️ 开发人员：从源码运行

如果您想从源代码运行或进行二次开发：

### 第 1 步：克隆仓库
```bash
git clone https://github.com/jason-michael/glass.git
cd glass
```

### 第 2 步：安装依赖
```bash
npm install
```

### 第 3 步：构建前端应用
```bash
cd pickleglass_web
npm install
npm run build
cd ..
```

### 第 4 步：运行应用
```bash
npm start
```

---

## 🔧 故障排除

### 常见启动问题

#### 问题1：字符编码乱码
**现象**：PowerShell中看到乱码如"馃殏 Railway閰嶇疆"
**解决方案**：
```powershell
chcp 65001
npm start
```

#### 问题2：数据库Schema错误
**现象**：错误信息"table users has no column named display_name"
**解决方案**：删除旧数据库文件重新创建
```powershell
Remove-Item -Path "$env:APPDATA\Glass\pickleglass.db*" -Force -ErrorAction SilentlyContinue
npm start
```

#### 问题3：前端构建缺失
**现象**：错误信息"Frontend build directory not found"
**解决方案**：
```bash
cd pickleglass_web
npm install
npm run build
cd ..
npm start
```

#### 问题4：端口被占用
**现象**：应用启动失败，提示端口冲突
**解决方案**：应用会自动寻找可用端口，如仍有问题请重启系统

---

## ❓ 常见问题 (FAQ)

*   **问：我需要一台性能强大的电脑吗？**
    *   答：完全不需要。所有AI计算都通过云端API完成，对您的本地电脑配置没有要求。

*   **问：我的数据安全吗？**
    *   答：您的API密钥仅安全地存储在本地。当您使用服务时，相关数据（如截图和问题文本）会被发送到对应的AI提供商进行处理。我们建议您查阅并遵守其隐私政策。

*   **问：使用这个服务会很贵吗？**
    *   答：Glass采用智能LiteLLM路由架构，会根据任务类型自动选择最经济的模型：
        - 简单文本任务自动路由到DeepSeek（成本极低）
        - 图像分析任务使用OpenAI（按需计费）
        - 总体成本比直接使用顶级模型节省80%以上

*   **问：我需要配置多个API密钥吗？**
    *   答：不需要！只需配置一个OpenAI API密钥即可：
        - Glass会通过Railway LiteLLM服务自动处理智能路由
        - 文本任务会自动使用经济模型（如果服务端已配置）
        - 图像任务会使用您的OpenAI密钥

*   **问：应用启动后我在哪里找到功能入口？**
    *   答：
        - **Ask功能**：使用快捷键`Ctrl+Shift+Y`随时提问
        - **Listen功能**：点击系统托盘图标选择"Start Session"
        - **历史记录**：通过Web界面查看（启动时显示地址）

---

如果您有任何问题或建议，欢迎随时提出！