import { LitElement, html, css } from '../../assets/lit-core-2.7.4.min.js';

class CustomizeView extends LitElement {
    static properties = {
        connectionStatus: { type: String, state: true },
        testResult: { type: String, state: true },
    };

    constructor() {
        super();
        this.connectionStatus = 'checking';
        this.testResult = '';

        if (window.require) {
            this.checkLiteLLMStatus();
        } else {
            console.warn('ipcRenderer not available. Running in browser mode?');
        }
    }

    async checkLiteLLMStatus() {
        try {
            const response = await fetch('https://litellm-production-ec35.up.railway.app/health', {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                this.connectionStatus = 'connected';
                this.updateStatusIndicator('🟢 连接正常', '#28a745');
            } else {
                this.connectionStatus = 'error';
                this.updateStatusIndicator('🔴 连接失败', '#dc3545');
            }
        } catch (error) {
            this.connectionStatus = 'error';
            this.updateStatusIndicator('🔴 连接失败', '#dc3545');
            console.error('LiteLLM health check failed:', error);
        }
    }

    updateStatusIndicator(text, color) {
        const indicator = this.shadowRoot?.querySelector('#litellm-status');
        if (indicator) {
            indicator.textContent = text;
            indicator.style.color = color;
            indicator.style.fontWeight = 'bold';
        }
    }

    async testConnection() {
        const button = this.shadowRoot?.querySelector('.test-button');
        const result = this.shadowRoot?.querySelector('#test-result');
        
        if (button) button.textContent = '测试中...';
        if (result) result.textContent = '';

        try {
            const response = await fetch('https://litellm-production-ec35.up.railway.app/health', {
                method: 'GET',
                signal: AbortSignal.timeout(10000)
            });
            
            if (response.ok) {
                const data = await response.json();
                if (result) {
                    result.innerHTML = '<div class="test-success">✅ LiteLLM服务连接成功！</div>';
                }
                this.updateStatusIndicator('🟢 连接正常', '#28a745');
            } else {
                if (result) {
                    result.innerHTML = `<div class="test-error">❌ 连接失败：HTTP ${response.status}</div>`;
                }
                this.updateStatusIndicator('🔴 连接失败', '#dc3545');
            }
        } catch (error) {
            if (result) {
                result.innerHTML = `<div class="test-error">❌ 连接失败：${error.message}</div>`;
            }
            this.updateStatusIndicator('🔴 连接失败', '#dc3545');
        } finally {
            if (button) button.textContent = '测试LiteLLM连接';
        }
    }

    closeSettings() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('hide-window', 'settings');
        }
    }

    render() {
        return html`
            <div class="container">
                <div class="header">
                    <button class="close-button" @click=${this.closeSettings}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <h2>LiteLLM Configuration</h2>
                    <p>Glass使用LiteLLM智能路由服务。当前状态：<span class="status-indicator" id="litellm-status">检查中...</span></p>
                </div>

                <div class="service-info">
                    <h3>🔄 智能路由架构</h3>
                    <p>Glass采用Railway部署的LiteLLM服务，自动为您选择最合适的AI模型：</p>
                    <ul>
                        <li><strong>文本任务</strong>：自动使用DeepSeek（高性价比）</li>
                        <li><strong>图像分析</strong>：自动使用OpenAI（视觉能力）</li>
                        <li><strong>智能路由</strong>：根据任务复杂度选择最佳模型</li>
                    </ul>
                </div>

                <div class="connection-test">
                    <h3>🔗 连接测试</h3>
                    <button class="test-button" @click=${this.testConnection}>测试LiteLLM连接</button>
                    <div class="test-result" id="test-result"></div>
                </div>

                <div class="instructions">
                    <h3>📋 使用说明</h3>
                    <ol>
                        <li><strong>零配置启动</strong>：无需输入任何API密钥，应用即可直接使用</li>
                        <li><strong>智能路由</strong>：系统自动根据任务类型选择最合适的AI模型</li>
                        <li><strong>成本优化</strong>：简单任务使用经济模型，复杂任务使用高性能模型</li>
                        <li><strong>状态监控</strong>：右上角状态灯实时显示LiteLLM服务连接状态</li>
                        <li><strong>快捷操作</strong>：使用Ctrl+Enter（Ask）和Ctrl+L（Listen）快速访问功能</li>
                    </ol>
                    
                    <div class="troubleshooting">
                        <h4>🔧 故障排除</h4>
                        <p><strong>如果连接失败</strong>：</p>
                        <ul>
                            <li>检查网络连接是否正常</li>
                            <li>确认防火墙没有阻止应用访问网络</li>
                            <li>稍等片刻，Railway服务可能正在启动中</li>
                            <li>重启应用尝试重新连接</li>
                        </ul>
                    </div>
                </div>

                <div class="shortcuts">
                    <h3>⌨️ 快捷键大全</h3>
                    <div class="shortcuts-grid">
                        <div class="shortcut-category">
                            <h4>核心功能</h4>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+Enter</span>
                                <span class="shortcut-desc">切换Ask窗口，有内容时发送问题</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+L</span>
                                <span class="shortcut-desc">切换Listen窗口显示/隐藏</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+Shift+S</span>
                                <span class="shortcut-desc">手动截图用于分析</span>
                            </div>
                        </div>
                        <div class="shortcut-category">
                            <h4>界面控制</h4>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+\\</span>
                                <span class="shortcut-desc">显示/隐藏所有Glass窗口</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+M</span>
                                <span class="shortcut-desc">切换点击穿透模式</span>
                            </div>
                        </div>
                        <div class="shortcut-category">
                            <h4>窗口移动</h4>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+方向键</span>
                                <span class="shortcut-desc">精确移动窗口位置</span>
                </div>
                        <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+Shift+方向键</span>
                                <span class="shortcut-desc">快速移动到屏幕边缘</span>
                            </div>
                        </div>
                        <div class="shortcut-category">
                            <h4>响应导航</h4>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+[</span>
                                <span class="shortcut-desc">查看上一个AI响应</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl+]</span>
                                <span class="shortcut-desc">查看下一个AI响应</span>
                </div>
                    </div>
                    </div>
                    <p class="shortcuts-note"><strong>提示</strong>：Mac用户请将Ctrl替换为Cmd</p>
                </div>
            </div>
        `;
    }

    static styles = css`
        :host {
            display: block;
            height: 100vh;
            overflow-y: auto;
            background-color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .container {
            padding: 25px;
            color: #444;
            max-width: 600px;
            margin: 0 auto;
            min-height: 100%;
            box-sizing: border-box;
        }
        .header {
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 15px;
            margin-bottom: 25px;
            position: relative;
        }
        .close-button {
            position: absolute;
            top: 0;
            right: 0;
            background: none;
            border: none;
            padding: 8px;
            cursor: pointer;
            color: #666;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .close-button:hover {
            background-color: #f0f0f0;
            color: #333;
        }
        h2 {
            color: #000;
            margin-top: 0;
            font-size: 24px;
        }
        p, li {
            font-size: 14px;
            line-height: 1.6;
            color: #555;
        }
        a {
            color: #007bff;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
        .status-indicator {
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 4px;
            background-color: #f8f9fa;
        }
        .service-info {
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .service-info h3 {
            margin-top: 0;
            color: #1976d2;
        }
        .service-info ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .service-info li {
            margin: 8px 0;
        }
        .connection-test {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .connection-test h3 {
            margin-top: 0;
            color: #495057;
        }
        .test-button {
            padding: 10px 20px;
            border: none;
            background-color: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            border-radius: 5px;
            transition: background-color 0.2s;
        }
        .test-button:hover {
            background-color: #0056b3;
        }
        .test-result {
            margin-top: 15px;
            min-height: 20px;
        }
        .test-success {
            color: #28a745;
            font-weight: 500;
            padding: 10px;
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 4px;
        }
        .test-error {
            color: #dc3545;
            font-weight: 500;
            padding: 10px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
        }
        .instructions {
            margin-top: 30px;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .instructions h3 {
            margin-top: 0;
            color: #333;
        }
        ol {
            padding-left: 20px;
        }
        .troubleshooting {
            margin-top: 20px;
            padding: 15px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
        }
        .troubleshooting h4 {
            margin-top: 0;
            color: #856404;
        }
        .troubleshooting ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .shortcuts {
            margin-top: 30px;
            background-color: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #b3d9ff;
        }
        .shortcuts h3 {
            margin-top: 0;
            color: #0066cc;
        }
        .shortcuts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 15px 0;
        }
        .shortcut-category {
            background-color: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e6f2ff;
        }
        .shortcut-category h4 {
            margin: 0 0 12px 0;
            color: #003d80;
            font-size: 14px;
            font-weight: 600;
        }
        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 8px 0;
            padding: 6px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .shortcut-item:last-child {
            border-bottom: none;
        }
        .shortcut-key {
            font-family: 'Courier New', monospace;
            background-color: #f8f9fa;
            padding: 3px 8px;
            border-radius: 4px;
            border: 1px solid #dee2e6;
            font-size: 12px;
            font-weight: bold;
            color: #495057;
            white-space: nowrap;
        }
        .shortcut-desc {
            font-size: 13px;
            color: #666;
            flex: 1;
            margin-left: 10px;
            text-align: left;
        }
        .shortcuts-note {
            margin-top: 15px;
            font-size: 13px;
            color: #666;
            font-style: italic;
            text-align: center;
        }
    `;
}

customElements.define('customize-view', CustomizeView);

// Export the class for ES6 module imports
export default CustomizeView;
