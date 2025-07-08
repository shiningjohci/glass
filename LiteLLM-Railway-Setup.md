# LiteLLM Railway 配置指南

## 问题诊断

您的LiteLLM服务已成功部署到Railway，但缺少API密钥配置。

**当前状态**：
- ✅ 服务运行正常（https://litellm-production-ec35.up.railway.app）
- ❌ 模型列表为空（需要配置API密钥）

## 修复步骤

### 1. 登录Railway控制台
访问：https://railway.app/dashboard

### 2. 选择您的LiteLLM项目
找到并点击您的LiteLLM服务项目

### 3. 配置环境变量
在项目页面，点击 **Variables** 标签页，添加以下环境变量：

#### DeepSeek配置（用于文本任务）
```
变量名: DEEPSEEK_API_KEY
变量值: 您的DeepSeek API密钥
```

#### OpenAI配置（用于图像分析）
```
变量名: OPENAI_API_KEY  
变量值: 您的OpenAI API密钥
```

### 4. 创建配置文件
在您的LiteLLM项目根目录创建 `config.yaml` 文件：

```yaml
model_list:
  # DeepSeek模型（高性价比文本处理）
  - model_name: deepseek-chat
    litellm_params:
      model: deepseek/deepseek-chat
      api_key: os.environ/DEEPSEEK_API_KEY
      base_url: https://api.deepseek.com
  
  # OpenAI模型（图像分析）
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

# 路由配置
router_settings:
  routing_strategy: simple-shuffle
  model_group_alias:
    text-model: deepseek-chat
    vision-model: gpt-4o-mini

# 服务配置
general_settings:
  master_key: your-master-key-here  # 可选，用于API访问控制
  database_url: postgresql://...    # 可选，用于日志记录
```

### 5. 设置启动命令
在Railway项目设置中，确保启动命令为：
```bash
litellm --config config.yaml --port $PORT
```

### 6. 重新部署
保存配置后，Railway会自动重新部署您的服务。

## 获取API密钥

### DeepSeek API密钥
1. 访问：https://platform.deepseek.com/
2. 注册/登录账户
3. 进入API密钥管理页面
4. 创建新的API密钥
5. 复制密钥值

### OpenAI API密钥
1. 访问：https://platform.openai.com/api-keys
2. 登录您的OpenAI账户
3. 点击"Create new secret key"
4. 复制生成的密钥

## 验证配置

配置完成后，使用以下命令验证：

```bash
# 检查模型列表
curl https://litellm-production-ec35.up.railway.app/v1/models

# 测试文本生成
curl -X POST https://litellm-production-ec35.up.railway.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## 故障排除

### 常见错误

1. **"Model list not initialized"**
   - 原因：缺少API密钥配置
   - 解决：按上述步骤配置环境变量

2. **"Invalid API key"**
   - 原因：API密钥错误或过期
   - 解决：检查并更新API密钥

3. **"Service unavailable"**
   - 原因：Railway服务未启动
   - 解决：检查Railway控制台中的服务状态

### 日志检查
在Railway控制台的**Logs**标签页查看详细错误信息。

## 成本优化建议

1. **DeepSeek**：主要用于文本任务，成本极低
2. **OpenAI GPT-4o-mini**：仅用于图像分析，按需计费
3. **设置用量限制**：在API提供商控制台设置月度用量限制

## 联系支持

如果遇到问题，请：
1. 检查Railway服务日志
2. 验证API密钥有效性
3. 确认config.yaml语法正确
4. 查看LiteLLM官方文档：https://docs.litellm.ai/ 