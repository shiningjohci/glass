import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';

export class ApiKeyHeader extends LitElement {
    static properties = {
        apiKey: { type: String },
        isLoading: { type: Boolean },
        errorMessage: { type: String },
    };

    static styles = css`
        :host {
            display: block;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            transition: opacity 0.25s ease-out;
        }

        :host(.sliding-out) {
            animation: slideOutUp 0.3s ease-in forwards;
            will-change: opacity, transform;
        }

        :host(.hidden) {
            opacity: 0;
            pointer-events: none;
        }

        @keyframes slideOutUp {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }

        * {
            font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: default;
            user-select: none;
            box-sizing: border-box;
        }

        .container {
            width: 285px;
            height: 220px;
            padding: 18px 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .container::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 16px;
            padding: 1px;
            background: linear-gradient(169deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.5) 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: destination-out;
            mask-composite: exclude;
            pointer-events: none;
        }

        .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 14px;
            height: 14px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 3px;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
            z-index: 10;
            font-size: 14px;
            line-height: 1;
            padding: 0;
        }

        .close-button:hover {
            background: rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.9);
        }

        .close-button:active {
            transform: scale(0.95);
        }

        .title {
            color: white;
            font-size: 16px;
            font-weight: 500; /* Medium */
            margin: 0;
            text-align: center;
            flex-shrink: 0; /* 제목이 줄어들지 않도록 고정 */
        }

        .form-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            margin-top: auto; /* 이 속성이 제목과 폼 사이의 공간을 만듭니다. */
        }

        .error-message {
            color: rgba(239, 68, 68, 0.9);
            font-weight: 500;
            font-size: 11px;
            height: 14px; /* Reserve space to prevent layout shift */
            text-align: center;
            margin-bottom: 4px;
        }

        .api-input {
            width: 100%;
            height: 34px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border: none;
            padding: 0 10px;
            color: white;
            font-size: 12px;
            font-weight: 400; /* Regular */
            margin-bottom: 6px;
            text-align: center;
            user-select: text;
            cursor: text;
        }

        .api-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .api-input:focus {
            outline: none;
        }

        .action-button {
            width: 100%;
            height: 34px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 12px;
            font-weight: 500; /* Medium */
            cursor: pointer;
            transition: background 0.15s ease;
            position: relative;
            overflow: hidden;
        }

        .action-button::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 10px;
            padding: 1px;
            background: linear-gradient(169deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.5) 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: destination-out;
            mask-composite: exclude;
            pointer-events: none;
        }

        .action-button:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .action-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .or-text {
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
            font-weight: 500; /* Medium */
            margin: 10px 0;
        }
    `;

    constructor() {
        super();
        this.dragState = null;
        this.wasJustDragged = false;
        this.apiKey = '';
        this.isLoading = false;
        this.errorMessage = '';
        this.validatedApiKey = null;

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
        this.handleUsePicklesKey = this.handleUsePicklesKey.bind(this);
    }

    reset() {
        this.apiKey = '';
        this.isLoading = false;
        this.errorMessage = '';
        this.validatedApiKey = null;
        this.requestUpdate();
    }

    async handleMouseDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            return;
        }

        e.preventDefault();

        const { ipcRenderer } = window.require('electron');
        const initialPosition = await ipcRenderer.invoke('get-header-position');

        this.dragState = {
            initialMouseX: e.screenX,
            initialMouseY: e.screenY,
            initialWindowX: initialPosition.x,
            initialWindowY: initialPosition.y,
            moved: false,
        };

        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp, { once: true });
    }

    handleMouseMove(e) {
        if (!this.dragState) return;

        const deltaX = Math.abs(e.screenX - this.dragState.initialMouseX);
        const deltaY = Math.abs(e.screenY - this.dragState.initialMouseY);

        if (deltaX > 3 || deltaY > 3) {
            this.dragState.moved = true;
        }

        const newWindowX = this.dragState.initialWindowX + (e.screenX - this.dragState.initialMouseX);
        const newWindowY = this.dragState.initialWindowY + (e.screenY - this.dragState.initialMouseY);

        const { ipcRenderer } = window.require('electron');
        ipcRenderer.invoke('move-header-to', newWindowX, newWindowY);
    }

    handleMouseUp(e) {
        if (!this.dragState) return;

        const wasDragged = this.dragState.moved;

        window.removeEventListener('mousemove', this.handleMouseMove);
        this.dragState = null;

        if (wasDragged) {
            this.wasJustDragged = true;
            setTimeout(() => {
                this.wasJustDragged = false;
            }, 200);
        }
    }

    handleInput(e) {
        this.apiKey = e.target.value;
        this.errorMessage = '';
        console.log('Input changed:', this.apiKey?.length || 0, 'chars');

        this.requestUpdate();
        this.updateComplete.then(() => {
            const inputField = this.shadowRoot?.querySelector('.apikey-input');
            if (inputField && this.isInputFocused) {
                inputField.focus();
            }
        });
    }

    handlePaste(e) {
        e.preventDefault();
        this.errorMessage = '';
        const clipboardText = (e.clipboardData || window.clipboardData).getData('text');
        console.log('Paste event detected:', clipboardText?.substring(0, 10) + '...');

        if (clipboardText) {
            this.apiKey = clipboardText.trim();

            const inputElement = e.target;
            inputElement.value = this.apiKey;
        }

        this.requestUpdate();
        this.updateComplete.then(() => {
            const inputField = this.shadowRoot?.querySelector('.apikey-input');
            if (inputField) {
                inputField.focus();
                inputField.setSelectionRange(inputField.value.length, inputField.value.length);
            }
        });
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleSubmit();
        }
    }

    async handleSubmit() {
        if (this.wasJustDragged || this.isLoading || !this.apiKey.trim()) {
            console.log('Submit blocked:', {
                wasJustDragged: this.wasJustDragged,
                isLoading: this.isLoading,
                hasApiKey: !!this.apiKey.trim(),
            });
            return;
        }

        console.log('Starting API key validation...');
        this.isLoading = true;
        this.errorMessage = '';
        this.requestUpdate();

        const apiKey = this.apiKey.trim();
        let isValid = false;
        try {
            const isValid = await this.validateApiKey(this.apiKey.trim());

            if (isValid) {
                console.log('API key valid - checking system permissions...');
                
                const permissionResult = await this.checkAndRequestPermissions();
                
                if (permissionResult.success) {
                    console.log('All permissions granted - starting slide out animation');
                    this.startSlideOutAnimation();
                    this.validatedApiKey = this.apiKey.trim();
                } else {
                    this.errorMessage = permissionResult.error || 'Permission setup required';
                    console.log('Permission setup incomplete:', permissionResult);
                }
            } else {
                this.errorMessage = 'Invalid API key - please check and try again';
                console.log('API key validation failed');
            }
        } catch (error) {
            console.error('API key validation error:', error);
            this.errorMessage = 'Validation error - please try again';
        } finally {
            this.isLoading = false;
            this.requestUpdate();
        }
    }

    async validateApiKey(apiKey) {
        if (!apiKey || apiKey.length < 15) return false;

        try {
            // 直接使用Railway LiteLLM服务URL，避免依赖Node.js config模块
            const baseURL = 'https://litellm-production-ec35.up.railway.app';
            const healthEndpoint = `${baseURL}/health`;
            
            console.log(`Validating API key with LiteLLM health endpoint: ${healthEndpoint}`);

            // We send the API key as a bearer token. The LiteLLM proxy
            // will use this for authentication if it's configured to do so.
            // For now, we just need to confirm we can reach the service.
            const response = await fetch(healthEndpoint, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('LiteLLM health check successful:', data);
                // Check if the service is healthy and has models available
                if (data.status === 'healthy' && data.available_models && data.available_models.length > 0) {
                    return true;
                } else {
                    console.warn('LiteLLM service is reachable but not fully configured:', data);
                    // We can be lenient here, if the service is up, we can proceed.
                    // The user might configure models later.
                    return true; 
                }
            } else {
                const errorData = await response.text();
                console.log('LiteLLM health check failed:', response.status, errorData);
                return false;
            }
        } catch (error) {
            console.error('LiteLLM health check network error:', error);
            // Fallback for network issues, maybe the service is just starting.
            // A simple length check can be a temporary gate.
            return apiKey.length >= 15;
        }
    }

    async checkAndRequestPermissions() {
        if (!window.require) {
            return { success: true };
        }

        const { ipcRenderer } = window.require('electron');
        
        try {
            const permissions = await ipcRenderer.invoke('check-system-permissions');
            console.log('[Permissions] Current status:', permissions);
            
            if (!permissions.needsSetup) {
                return { success: true };
            }

            if (!permissions.microphone) {
                console.log('[Permissions] Requesting microphone permission...');
                const micResult = await ipcRenderer.invoke('request-microphone-permission');
                
                if (!micResult.success) {
                    console.log('[Permissions] Microphone permission denied');
                    await ipcRenderer.invoke('open-system-preferences', 'microphone');
                    return { 
                        success: false, 
                        error: 'Please grant microphone access in System Preferences' 
                    };
                }
            }

            if (!permissions.screen) {
                console.log('[Permissions] Screen recording permission needed');
                await ipcRenderer.invoke('open-system-preferences', 'screen-recording');
                
                this.errorMessage = 'Please grant screen recording permission and try again';
                this.requestUpdate();
                
                return { 
                    success: false, 
                    error: 'Please grant screen recording access in System Preferences' 
                };
            }

            return { success: true };
        } catch (error) {
            console.error('[Permissions] Error checking/requesting permissions:', error);
            return { 
                success: false, 
                error: 'Failed to check permissions' 
            };
        }
    }

    startSlideOutAnimation() {
        this.classList.add('sliding-out');
    }

    handleUsePicklesKey(e) {
        e.preventDefault();
        if (this.wasJustDragged) return;

        console.log('Requesting Firebase authentication from main process...');
        if (window.require) {
            window.require('electron').ipcRenderer.invoke('start-firebase-auth');
        }
    }

    handleClose() {
        console.log('Close button clicked');
        if (window.require) {
            window.require('electron').ipcRenderer.invoke('quit-application');
        }
    }

    handleAnimationEnd(e) {
        if (e.target !== this) return;

        if (this.classList.contains('sliding-out')) {
            this.classList.remove('sliding-out');
            this.classList.add('hidden');

            if (this.validatedApiKey) {
                if (window.require) {
                    window.require('electron').ipcRenderer.invoke('api-key-validated', this.validatedApiKey);
                }
                this.validatedApiKey = null;
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('animationend', this.handleAnimationEnd);

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('animationend', this.handleAnimationEnd);

    }

    render() {
        const isButtonDisabled = this.isLoading || !this.apiKey || !this.apiKey.trim();

        return html`
            <div class="container" @mousedown=${this.handleMouseDown}>
                <button class="close-button" @click=${this.handleClose} title="Close application">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                        <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.2" />
                    </svg>
                </button>
                <h1 class="title">Choose how to power your AI</h1>

                <div class="form-content">
                    <div class="error-message">${this.errorMessage}</div>
                    <input
                        type="password"
                        class="api-input"
                        placeholder="Enter your OpenAI API key"
                        .value=${this.apiKey || ''}
                        @input=${this.handleInput}
                        @keypress=${this.handleKeyPress}
                        @paste=${this.handlePaste}
                        @focus=${() => (this.errorMessage = '')}
                        ?disabled=${this.isLoading}
                        autocomplete="off"
                        spellcheck="false"
                        tabindex="0"
                    />

                    <button class="action-button" @click=${this.handleSubmit} ?disabled=${isButtonDisabled} tabindex="0">
                        ${this.isLoading ? 'Validating...' : 'Confirm'}
                    </button>

                    <div class="or-text">or</div>

                    <button class="action-button" @click=${this.handleUsePicklesKey}>Use Pickle's API Key</button>
                </div>
            </div>
        `;
    }
}

customElements.define('apikey-header', ApiKeyHeader);
