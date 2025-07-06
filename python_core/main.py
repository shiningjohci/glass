import os
import sys
from flask import Flask, request, Response
from flask_cors import CORS
from dotenv import load_dotenv
import litellm
import json
import logging

# --- Initialization ---
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- LiteLLM Configuration ---
# Uncomment the line below to enable debugging
# litellm.set_verbose=True

# --- Smart Router Logic ---
def check_api_keys():
    """检查是否有可用的API密钥"""
    openai_key = os.environ.get('OPENAI_API_KEY')
    deepseek_key = os.environ.get('DEEPSEEK_API_KEY')
    anthropic_key = os.environ.get('ANTHROPIC_API_KEY')
    ollama_url = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')
    
    available_models = []
    warnings = []
    
    if openai_key and openai_key != 'your_openai_api_key_here':
        available_models.extend(['gpt-4o', 'gpt-3.5-turbo'])
        logging.info("✅ OpenAI API密钥已配置")
    else:
        warnings.append("⚠️  OpenAI API密钥未配置 - 高复杂度任务和视觉分析将不可用")
    
    if deepseek_key and deepseek_key != 'your_deepseek_api_key_here':
        available_models.append('deepseek/deepseek-chat')
        logging.info("✅ DeepSeek API密钥已配置")
    else:
        warnings.append("⚠️  DeepSeek API密钥未配置 - 中等复杂度任务将不可用")
    
    if anthropic_key and anthropic_key != 'your_anthropic_api_key_here':
        available_models.extend(['claude-3-haiku', 'claude-3-sonnet'])
        logging.info("✅ Anthropic API密钥已配置")
    else:
        warnings.append("⚠️  Anthropic API密钥未配置 - Claude模型将不可用")
    
    # 检查Ollama是否可用
    try:
        import requests
        response = requests.get(f"{ollama_url}/api/tags", timeout=2)
        if response.status_code == 200:
            available_models.append('ollama/llama3')
            logging.info("✅ Ollama本地服务器可用")
        else:
            warnings.append("⚠️  Ollama本地服务器不可用 - 本地免费模型将不可用")
    except:
        warnings.append("⚠️  Ollama本地服务器不可用 - 本地免费模型将不可用")
    
    if warnings:
        for warning in warnings:
            logging.warning(warning)
    
    if not available_models:
        logging.error("❌ 没有可用的AI模型！请配置至少一个API密钥。")
        logging.info("📖 请查看 python_core/config_example.env 了解如何配置")
    
    return available_models, warnings

def route_model(content, has_image=False):
    """根据内容复杂度和类型选择最合适的模型"""
    available_models, _ = check_api_keys()
    
    if not available_models:
        return None, "没有可用的AI模型，请配置API密钥"
    
    # 如果有图像，优先使用支持视觉的模型
    if has_image:
        if 'gpt-4o' in available_models:
            return 'gpt-4o', None
        else:
            return None, "图像分析需要OpenAI API密钥"
    
    # 文本任务根据复杂度选择
    text_length = len(str(content))
    
    if text_length < 100:  # 简单任务 - 优先使用便宜或免费的模型
        if 'ollama/llama3' in available_models:
            return 'ollama/llama3', None
        elif 'claude-3-haiku' in available_models:
            return 'claude-3-haiku', None
        elif 'deepseek/deepseek-chat' in available_models:
            return 'deepseek/deepseek-chat', None
        elif 'gpt-3.5-turbo' in available_models:
            return 'gpt-3.5-turbo', None
    elif text_length < 500:  # 中等任务 - 平衡性能和成本
        if 'deepseek/deepseek-chat' in available_models:
            return 'deepseek/deepseek-chat', None
        elif 'claude-3-sonnet' in available_models:
            return 'claude-3-sonnet', None
        elif 'gpt-3.5-turbo' in available_models:
            return 'gpt-3.5-turbo', None
        elif 'ollama/llama3' in available_models:
            return 'ollama/llama3', None
    else:  # 复杂任务 - 使用最强模型
        if 'gpt-4o' in available_models:
            return 'gpt-4o', None
        elif 'claude-3-sonnet' in available_models:
            return 'claude-3-sonnet', None
        elif 'deepseek/deepseek-chat' in available_models:
            return 'deepseek/deepseek-chat', None
        elif 'gpt-3.5-turbo' in available_models:
            return 'gpt-3.5-turbo', None
    
    # fallback到任何可用模型
    if available_models:
        return available_models[0], None
    
    return None, "没有可用的模型"

# --- API Endpoint ---
@app.route('/chat/completions', methods=['POST'])
def chat_completions():
    """聊天完成端点 - 兼容OpenAI API格式"""
    try:
        data = request.json
        if not data:
            return Response(json.dumps({"error": "没有提供请求数据"}), 
                          status=400, mimetype='application/json; charset=utf-8')
        
        messages = data.get('messages', [])
        if not messages:
            return Response(json.dumps({"error": "没有提供消息"}), 
                          status=400, mimetype='application/json; charset=utf-8')
        
        # 检查是否有图像
        has_image = any(
            isinstance(msg.get('content'), list) and 
            any(item.get('type') == 'image_url' for item in msg['content'])
            for msg in messages
        )
        
        # 选择模型
        model, error = route_model(messages, has_image)
        if error:
            return Response(json.dumps({"error": error}), 
                          status=503, mimetype='application/json; charset=utf-8')
        
        logging.info(f"🧠 使用模型: {model} (图像: {has_image})")
        
        # 调用LiteLLM
        try:
            response = litellm.completion(
                model=model,
                messages=messages,
                stream=data.get('stream', False),
                max_tokens=data.get('max_tokens', 4096),
                temperature=data.get('temperature', 0.7),
            )
            
            if data.get('stream', False):
                # 流式响应
                def generate():
                    for chunk in response:
                        yield f"data: {json.dumps(chunk.dict())}\n\n"
                    yield "data: [DONE]\n\n"
                
                return Response(generate(), mimetype='text/plain')
            else:
                # 非流式响应
                return Response(json.dumps(response.dict(), ensure_ascii=False), 
                              mimetype='application/json; charset=utf-8')
                
        except Exception as api_error:
            logging.error(f"API调用失败: {api_error}")
            return Response(json.dumps({"error": f"AI模型调用失败: {str(api_error)}"}), 
                          status=500, mimetype='application/json; charset=utf-8')
            
    except Exception as e:
        logging.error(f"请求处理失败: {e}")
        return Response(json.dumps({"error": f"服务器错误: {str(e)}"}), 
                      status=500, mimetype='application/json; charset=utf-8')

# --- Health Check Endpoint ---
@app.route('/health', methods=['GET'])
def health():
    """健康检查端点"""
    available_models, warnings = check_api_keys()
    
    status = {
        "status": "healthy" if available_models else "warning", 
        "message": "LiteLLM Agent 正在运行",
        "available_models": available_models,
        "warnings": warnings
    }
    
    return Response(json.dumps(status, ensure_ascii=False), 
                   mimetype='application/json; charset=utf-8')

# --- Main Execution ---
if __name__ == '__main__':
    try:
        port = int(os.environ.get('FLASK_PORT', os.environ.get('PORT', 5001)))
        host = os.environ.get('FLASK_HOST', '127.0.0.1')
        
        logging.info("🔥 LiteLLM 智能路由代理正在启动...")
        
        # 检查配置
        available_models, warnings = check_api_keys()
        
        if not available_models:
            logging.warning("🚨 警告：没有可用的AI模型！")
            logging.warning("📖 请查看 python_core/config_example.env 了解如何配置API密钥")
            logging.warning("🔧 服务器仍会启动，但AI功能将不可用")
        
        logging.info(f"🌐 服务器启动于 http://{host}:{port}")
        logging.info("📊 Flask服务器运行中...")
        
        app.run(host=host, port=port, debug=False)
        
    except KeyboardInterrupt:
        logging.info("🛑 服务器被用户中断")
        sys.exit(0)
    except Exception as e:
        logging.error(f"服务器启动失败: {e}")
        sys.exit(1) 