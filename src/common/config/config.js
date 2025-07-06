// Configuration management for environment-based settings
const os = require('os');
const path = require('path');
const fs = require('fs');

class Config {
    constructor() {
        this.env = process.env.NODE_ENV || 'development';
        this.defaults = {
            apiUrl: process.env.pickleglass_API_URL || 'http://localhost:9001',
            apiTimeout: 10000,
            
            webUrl: process.env.pickleglass_WEB_URL || 'http://localhost:3000',
            
            enableJWT: false,
            fallbackToHeaderAuth: false,
            
            cacheTimeout: 5 * 60 * 1000,
            enableCaching: true,
            
            syncInterval: 0,
            healthCheckInterval: 30 * 1000,
            
            defaultWindowWidth: 400,
            defaultWindowHeight: 60,
            
            enableOfflineMode: true,
            enableFileBasedCommunication: false,
            enableSQLiteStorage: true,
            
            logLevel: 'info',
            enableDebugLogging: false,
            
            // AI提供商配置
            ai: {
                name: 'LiteLLM Railway',
                baseURL: process.env.LITELLM_BASE_URL || 'https://litellm-production-ec35.up.railway.app', // Railway 部署地址
                endpoints: {
                    chat: '/chat/completions',
                    health: '/health'
                },
                // 智能路由配置 (在Railway上配置)
                routing: {
                    lowComplexity: 'deepseek/deepseek-chat',
                    mediumComplexity: 'deepseek/deepseek-chat', 
                    highComplexity: 'gpt-4o',
                    vision: 'gpt-4o',
                    transcription: 'whisper-1'
                }
            },
            
            // 控制是否启动本地Python服务器
            disableLocalPythonServer: process.env.DISABLE_LOCAL_PYTHON_SERVER === 'true' || true // 默认禁用本地服务器
        };
        
        this.config = { ...this.defaults };
        this.loadEnvironmentConfig();
        this.loadUserConfig();
    }
    
    loadEnvironmentConfig() {
        if (process.env.pickleglass_API_URL) {
            this.config.apiUrl = process.env.pickleglass_API_URL;
            console.log(`[Config] API URL from env: ${this.config.apiUrl}`);
        }
        
        if (process.env.pickleglass_WEB_URL) {
            this.config.webUrl = process.env.pickleglass_WEB_URL;
            console.log(`[Config] Web URL from env: ${this.config.webUrl}`);
        }
        
        // Railway LiteLLM配置
        if (process.env.LITELLM_BASE_URL) {
            this.config.ai.baseURL = process.env.LITELLM_BASE_URL;
            console.log(`[Config] LiteLLM URL from env: ${this.config.ai.baseURL}`);
        }
        
        if (process.env.DISABLE_LOCAL_PYTHON_SERVER) {
            this.config.disableLocalPythonServer = process.env.DISABLE_LOCAL_PYTHON_SERVER === 'true';
        }
        
        if (process.env.pickleglass_API_TIMEOUT) {
            this.config.apiTimeout = parseInt(process.env.pickleglass_API_TIMEOUT);
        }
        
        if (process.env.pickleglass_ENABLE_JWT) {
            this.config.enableJWT = process.env.pickleglass_ENABLE_JWT === 'true';
        }
        
        if (process.env.pickleglass_CACHE_TIMEOUT) {
            this.config.cacheTimeout = parseInt(process.env.pickleglass_CACHE_TIMEOUT);
        }
        
        if (process.env.pickleglass_LOG_LEVEL) {
            this.config.logLevel = process.env.pickleglass_LOG_LEVEL;
        }
        
        if (process.env.pickleglass_DEBUG) {
            this.config.enableDebugLogging = process.env.pickleglass_DEBUG === 'true';
        }
        
        if (this.env === 'production') {
            this.config.enableDebugLogging = false;
            this.config.logLevel = 'warn';
        } else if (this.env === 'development') {
            this.config.enableDebugLogging = true;
            this.config.logLevel = 'debug';
        }
    }
    
    loadUserConfig() {
        try {
            const userConfigPath = this.getUserConfigPath();
            if (fs.existsSync(userConfigPath)) {
                const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));
                this.config = { ...this.config, ...userConfig };
                console.log('[Config] User config loaded from:', userConfigPath);
            }
        } catch (error) {
            console.warn('[Config] Failed to load user config:', error.message);
        }
    }
    
    getUserConfigPath() {
        const configDir = path.join(os.homedir(), '.pickleglass');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        return path.join(configDir, 'config.json');
    }
    
    get(key) {
        return this.config[key];
    }
    
    set(key, value) {
        this.config[key] = value;
    }

    /**
     * 设置LiteLLM服务器URL (Railway或本地)
     */
    setLiteLLMURL(url) {
        this.config.ai.baseURL = url;
        console.log(`[Config] LiteLLM server URL updated to: ${this.config.ai.baseURL}`);
    }

    /**
     * 检查是否应该启动本地Python服务器
     */
    shouldStartLocalPythonServer() {
        return !this.config.disableLocalPythonServer;
    }
    
    getAll() {
        return { ...this.config };
    }
    
    saveUserConfig() {
        try {
            const userConfigPath = this.getUserConfigPath();
            const userConfig = { ...this.config };
            
            Object.keys(this.defaults).forEach(key => {
                if (userConfig[key] === this.defaults[key]) {
                    delete userConfig[key];
                }
            });
            
            fs.writeFileSync(userConfigPath, JSON.stringify(userConfig, null, 2));
            console.log('[Config] User config saved to:', userConfigPath);
        } catch (error) {
            console.error('[Config] Failed to save user config:', error);
        }
    }
    
    reset() {
        this.config = { ...this.defaults };
        this.loadEnvironmentConfig();
    }
    
    isDevelopment() {
        return this.env === 'development';
    }
    
    isProduction() {
        return this.env === 'production';
    }
    
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.config.logLevel);
        const requestedLevelIndex = levels.indexOf(level);
        return requestedLevelIndex >= currentLevelIndex;
    }
}

const config = new Config();

module.exports = config;