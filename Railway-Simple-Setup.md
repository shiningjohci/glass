# Railway LiteLLM 简化配置指南

## 🚀 推荐方法：使用环境变量配置（无需config.yaml）

### 第1步：登录Railway控制台
1. 打开浏览器，访问：https://railway.app/dashboard
2. 登录您的Railway账户

### 第2步：找到您的LiteLLM项目
1. 在Dashboard中找到您的LiteLLM项目
2. 点击进入项目详情页面

### 第3步：配置环境变量
1. 在项目页面，点击 **Variables** 标签页
2. 点击 **+ New Variable** 按钮
3. 逐个添加以下环境变量：

#### 必需的环境变量：

**DeepSeek API密钥**：
```
变量名: DEEPSEEK_API_KEY
变量值: sk-xxxxxxxxxxxxxxxxx（您的DeepSeek API密钥）
```

**OpenAI API密钥**：
```
变量名: OPENAI_API_KEY  
变量值: sk-xxxxxxxxxxxxxxxxx（您的OpenAI API密钥）
```

**模型配置**：
```
变量名: LITELLM_MODEL_LIST
变量值: [{"model_name": "deepseek-chat", "litellm_params": {"model": "deepseek/deepseek-chat", "api_key": "os.environ/DEEPSEEK_API_KEY"}}, {"model_name": "gpt-4o-mini", "litellm_params": {"model": "openai/gpt-4o-mini", "api_key": "os.environ/OPENAI_API_KEY"}}]
```

### 第4步：保存并重新部署
1. 添加完所有环境变量后，点击 **Save** 
2. Railway会自动重新部署您的服务
3. 等待部署完成（通常需要1-2分钟）

### 第5步：验证配置
部署完成后，测试服务是否正常：

```bash
# 检查模型列表（应该能看到deepseek-chat和gpt-4o-mini）
curl https://litellm-production-ec35.up.railway.app/v1/models
```

## 🔑 如何获取API密钥

### DeepSeek API密钥
1. 访问：https://platform.deepseek.com/
2. 注册/登录账户
3. 点击左侧菜单 **API Keys**
4. 点击 **Create API Key**
5. 复制生成的密钥（格式：sk-xxxxxxxxxx）

### OpenAI API密钥
1. 访问：https://platform.openai.com/api-keys
2. 登录您的OpenAI账户
3. 点击 **Create new secret key**
4. 输入密钥名称（如：Glass-App）
5. 复制生成的密钥（格式：sk-xxxxxxxxxx）

## 📱 Railway操作截图指南

### 在Variables页面添加环境变量：
1. 点击项目名称进入项目详情
2. 点击顶部的 **Variables** 标签
3. 点击 **+ New Variable** 按钮
4. 在弹出的对话框中：
   - **Name**: 输入变量名（如：DEEPSEEK_API_KEY）
   - **Value**: 输入变量值（您的API密钥）
   - 点击 **Add** 按钮

### 重复添加所有必需变量：
- DEEPSEEK_API_KEY
- OPENAI_API_KEY  
- LITELLM_MODEL_LIST

## ⚠️ 重要提醒

1. **API密钥安全**：
   - 不要在代码中硬编码API密钥
   - 不要分享您的API密钥
   - 定期轮换API密钥

2. **成本控制**：
   - 在API提供商控制台设置用量限制
   - 监控API使用情况

3. **测试验证**：
   - 配置完成后务必测试服务是否正常
   - 检查Glass应用的连接状态

## 🆘 故障排除

如果配置后仍然无法连接：

1. **检查Railway日志**：
   - 在项目页面点击 **Logs** 标签
   - 查看是否有错误信息

2. **验证API密钥**：
   - 确保API密钥格式正确
   - 确保API密钥有效且有余额

3. **重新部署**：
   - 在项目页面点击 **Deploy** 按钮
   - 强制重新部署服务 