const axios = require('axios');
const config = require('../config/config');

/**
 * AI客户端 - 与本地Python LiteLLM Agent通信
 */
class AIClient {
    constructor() {
        this.aiConfig = config.get('ai');
        this.baseURL = this.aiConfig.baseURL;
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: config.get('apiTimeout'),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('[AIClient] Request failed:', error.message);
                if (error.response) {
                    console.error('[AIClient] Response status:', error.response.status);
                    console.error('[AIClient] Response data:', error.response.data);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * 检查AI服务器健康状态
     */
    async checkHealth() {
        try {
            const response = await this.client.get(this.aiConfig.endpoints.health);
            return response.status === 200;
        } catch (error) {
            console.error('[AIClient] Health check failed:', error);
            return false;
        }
    }

    /**
     * 发送聊天请求到AI代理
     */
    async chatCompletion(options = {}) {
        try {
            const {
                messages,
                temperature = 0.7,
                max_tokens = 2048,
                model = null, // 如果不指定，让Python代理自动选择
                stream = false,
                ...otherOptions
            } = options;

            const payload = {
                messages,
                temperature,
                max_tokens,
                stream,
                ...otherOptions
            };

            // 如果指定了模型，添加到payload中
            if (model) {
                payload.model = model;
            }

            console.log('[AIClient] Sending chat completion request:', {
                messagesCount: messages?.length,
                model: model || 'auto-selected',
                temperature,
                max_tokens
            });

            const response = await this.client.post(this.aiConfig.endpoints.chat, payload);
            
            return response.data;
        } catch (error) {
            console.error('[AIClient] Chat completion failed:', error);
            throw new Error(`AI请求失败: ${error.message}`);
        }
    }

    /**
     * 处理文本对话
     */
    async generateText(prompt, systemPrompt = null, options = {}) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.push({ role: 'user', content: prompt });

        return await this.chatCompletion({
            messages,
            ...options
        });
    }

    /**
     * 处理带图片的对话
     */
    async generateTextWithImage(prompt, imageData, systemPrompt = null, options = {}) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }

        const userContent = [
            { type: 'text', text: prompt }
        ];

        // 支持base64图片数据
        if (imageData) {
            if (typeof imageData === 'string') {
                // 如果是base64字符串
                userContent.push({
                    type: 'image_url',
                    image_url: { 
                        url: imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`
                    }
                });
            } else if (imageData.inlineData) {
                // 兼容Google格式
                userContent.push({
                    type: 'image_url',
                    image_url: { 
                        url: `data:${imageData.inlineData.mimeType};base64,${imageData.inlineData.data}`
                    }
                });
            }
        }

        messages.push({ role: 'user', content: userContent });

        return await this.chatCompletion({
            messages,
            model: this.aiConfig.routing.vision, // 强制使用视觉模型
            ...options
        });
    }

    /**
     * 语音转录
     */
    async transcribeAudio(audioData, options = {}) {
        try {
            // 这里可以根据需要实现音频转录
            // 暂时返回一个占位符响应
            console.log('[AIClient] Audio transcription requested');
            
            // 可以调用whisper API或其他转录服务
            return {
                text: '音频转录功能正在开发中...'
            };
        } catch (error) {
            console.error('[AIClient] Audio transcription failed:', error);
            throw new Error(`音频转录失败: ${error.message}`);
        }
    }

    /**
     * 创建兼容OpenAI格式的客户端包装器
     */
    createOpenAICompatibleClient() {
        return {
            chat: {
                completions: {
                    create: async (options) => {
                        const response = await this.chatCompletion(options);
                        
                        // 转换为OpenAI格式的响应
                        return {
                            choices: [{
                                message: {
                                    content: response.choices?.[0]?.message?.content || response.content
                                }
                            }]
                        };
                    }
                }
            }
        };
    }

    /**
     * 创建兼容Google Generative AI格式的模型包装器
     */
    createGenerativeModel() {
        return {
            generateContent: async (parts) => {
                let prompt = '';
                let systemPrompt = '';
                let imageData = null;

                // 解析parts参数
                for (const part of parts) {
                    if (typeof part === 'string') {
                        if (part.includes('You are') && systemPrompt === '') {
                            systemPrompt = part;
                        } else {
                            prompt += part + ' ';
                        }
                    } else if (part.inlineData) {
                        imageData = part;
                    }
                }

                let response;
                if (imageData) {
                    response = await this.generateTextWithImage(prompt.trim(), imageData, systemPrompt);
                } else {
                    response = await this.generateText(prompt.trim(), systemPrompt);
                }

                // 返回兼容Google格式的响应
                return {
                    response: {
                        text: () => response.choices?.[0]?.message?.content || response.content
                    }
                };
            }
        };
    }
}

// 单例实例
let aiClientInstance = null;

/**
 * 获取AI客户端单例
 */
function getAIClient() {
    if (!aiClientInstance) {
        aiClientInstance = new AIClient();
    }
    return aiClientInstance;
}

/**
 * 创建兼容OpenAI的客户端
 */
function createOpenAICompatibleClient() {
    return getAIClient().createOpenAICompatibleClient();
}

/**
 * 创建兼容Google的生成模型
 */
function createGenerativeModel() {
    return getAIClient().createGenerativeModel();
}

module.exports = {
    AIClient,
    getAIClient,
    createOpenAICompatibleClient,
    createGenerativeModel
}; 