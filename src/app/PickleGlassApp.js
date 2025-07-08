import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import CustomizeView from '../features/customize/CustomizeView.js';
import { AssistantView } from '../features/listen/AssistantView.js';
import { OnboardingView } from '../features/onboarding/OnboardingView.js';
import { AskView } from '../features/ask/AskView.js';

import '../features/listen/renderer.js';

export class PickleGlassApp extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            color: var(--text-color);
            background: transparent;
            border-radius: 7px;
        }

        assistant-view {
            display: block;
            width: 100%;
        }

        ask-view, customize-view, history-view, help-view, onboarding-view, setup-view {
            display: block;
            width: 100%;
        }

        /* 状态指示器样式已移至设置页面 */

    `;

    static properties = {
        currentView: { type: String },
        statusText: { type: String },
        startTime: { type: Number },
        currentResponseIndex: { type: Number },
        isMainViewVisible: { type: Boolean },
        selectedProfile: { type: String },
        selectedLanguage: { type: String },
        selectedScreenshotInterval: { type: String },
        selectedImageQuality: { type: String },
        isClickThrough: { type: Boolean, state: true },
        layoutMode: { type: String },
        _viewInstances: { type: Object, state: true },
        _isClickThrough: { state: true },
        structuredData: { type: Object }, 
        // litellmStatus: { type: String }, // 已移至设置页面
        litellmLastCheck: { type: Number },
    };

    constructor() {
        super();
        const urlParams = new URLSearchParams(window.location.search);
        this.currentView = urlParams.get('view') || 'listen';
        this.currentResponseIndex = -1;
        this.selectedProfile = localStorage.getItem('selectedProfile') || 'interview';
        this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
        this.selectedScreenshotInterval = localStorage.getItem('selectedScreenshotInterval') || '5';
        this.selectedImageQuality = localStorage.getItem('selectedImageQuality') || 'medium';
        this._isClickThrough = false;
        this.outlines = [];
        this.analysisRequests = [];
        
        // LiteLLM状态监控已移至设置页面
        // this.litellmStatus = 'checking';

        window.pickleGlass.setStructuredData = data => {
            this.updateStructuredData(data);
        };
        
        // LiteLLM状态监控已移至设置页面
        // this.startLiteLLMStatusMonitoring();
    }

    connectedCallback() {
        super.connectedCallback();
        
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            
            ipcRenderer.on('update-status', (_, status) => this.setStatus(status));
            ipcRenderer.on('click-through-toggled', (_, isEnabled) => {
                this._isClickThrough = isEnabled;
            });
            ipcRenderer.on('show-view', (_, view) => {
                this.currentView = view;
                this.isMainViewVisible = true;
            });
            ipcRenderer.on('start-listening-session', () => {
                console.log('Received start-listening-session command, calling handleListenClick.');
                this.handleListenClick();
            });
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.removeAllListeners('update-status');
            ipcRenderer.removeAllListeners('click-through-toggled');
            ipcRenderer.removeAllListeners('show-view');
            ipcRenderer.removeAllListeners('start-listening-session');
        }
        
        // LiteLLM状态监控已移至设置页面
        // if (this.litellmStatusInterval) { clearInterval(this.litellmStatusInterval); }
    }

    updated(changedProperties) {
        if (changedProperties.has('isMainViewVisible') || changedProperties.has('currentView')) {
            this.requestWindowResize();
        }

        if (changedProperties.has('currentView') && window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('view-changed', this.currentView);

            const viewContainer = this.shadowRoot?.querySelector('.view-container');
            if (viewContainer) {
                viewContainer.classList.add('entering');
                requestAnimationFrame(() => {
                    viewContainer.classList.remove('entering');
                });
            }
        }

        // Only update localStorage when these specific properties change
        if (changedProperties.has('selectedProfile')) {
            localStorage.setItem('selectedProfile', this.selectedProfile);
        }
        if (changedProperties.has('selectedLanguage')) {
            localStorage.setItem('selectedLanguage', this.selectedLanguage);
        }
        if (changedProperties.has('selectedScreenshotInterval')) {
            localStorage.setItem('selectedScreenshotInterval', this.selectedScreenshotInterval);
        }
        if (changedProperties.has('selectedImageQuality')) {
            localStorage.setItem('selectedImageQuality', this.selectedImageQuality);
        }
        if (changedProperties.has('layoutMode')) {
            this.updateLayoutMode();
        }
    }

    requestWindowResize() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('resize-window', {
                isMainViewVisible: this.isMainViewVisible,
                view: this.currentView,
            });
        }
    }

    setStatus(text) {
        this.statusText = text;
    }

    async handleListenClick() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            const isActive = await ipcRenderer.invoke('is-session-active');
            if (isActive) {
                console.log('Session is already active. No action needed.');
                return;
            }
        }

        if (window.pickleGlass) {
            await window.pickleGlass.initializeopenai(this.selectedProfile, this.selectedLanguage);
            window.pickleGlass.startCapture(this.selectedScreenshotInterval, this.selectedImageQuality);
        }

        // 🔄 Clear previous summary/analysis when a new listening session begins
        this.structuredData = {
            summary: [],
            topic: { header: '', bullets: [] },
            actions: [],
            followUps: [],
        };

        this.currentResponseIndex = -1;
        this.startTime = Date.now();
        this.currentView = 'listen';
        this.isMainViewVisible = true;
    }

    handleShowHideClick() {
        this.isMainViewVisible = !this.isMainViewVisible;
    }

    handleCustomizeClick() {
        this.currentView = 'customize';
        this.isMainViewVisible = true;
    }

    handleHelpClick() {
        this.currentView = 'help';
        this.isMainViewVisible = true;
    }

    handleHistoryClick() {
        this.currentView = 'history';
        this.isMainViewVisible = true;
    }

    async handleClose() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('quit-application');
        }
    }

    handleBackClick() {
        this.currentView = 'listen';
    }

    async handleSendText(message) {
        if (window.pickleGlass) {
            const result = await window.pickleGlass.sendTextMessage(message);

            if (!result.success) {
                console.error('Failed to send message:', result.error);
                this.setStatus('Error sending message: ' + result.error);
            } else {
                this.setStatus('Message sent...');
            }
        }
    }

    // updateOutline(outline) {
    //     console.log('📝 PickleGlassApp updateOutline:', outline);
    //     this.outlines = [...outline];
    //     this.requestUpdate();
    // }

    // updateAnalysisRequests(requests) {
    //     console.log('📝 PickleGlassApp updateAnalysisRequests:', requests);
    //     this.analysisRequests = [...requests];
    //     this.requestUpdate();
    // }

    updateStructuredData(data) {
        console.log('📝 PickleGlassApp updateStructuredData:', data);
        this.structuredData = data;
        this.requestUpdate();
        
        const assistantView = this.shadowRoot?.querySelector('assistant-view');
        if (assistantView) {
            assistantView.structuredData = data;
            console.log('✅ Structured data passed to AssistantView');
        }
    }

    handleResponseIndexChanged(e) {
        this.currentResponseIndex = e.detail.index;
    }

    handleOnboardingComplete() {
        this.currentView = 'main';
    }

    render() {
        // 状态指示器已移至设置页面，这里不再显示

        let viewContent;
        switch (this.currentView) {
            case 'listen':
                viewContent = html`<assistant-view
                    .currentResponseIndex=${this.currentResponseIndex}
                    .selectedProfile=${this.selectedProfile}
                    .structuredData=${this.structuredData}
                    .onSendText=${message => this.handleSendText(message)}
                    @response-index-changed=${e => (this.currentResponseIndex = e.detail.index)}
                ></assistant-view>`;
                break;
            case 'ask':
                viewContent = html`<ask-view></ask-view>`;
                break;
            case 'customize':
                viewContent = html`<customize-view
                    .selectedProfile=${this.selectedProfile}
                    .selectedLanguage=${this.selectedLanguage}
                    .onProfileChange=${profile => (this.selectedProfile = profile)}
                    .onLanguageChange=${lang => (this.selectedLanguage = lang)}
                ></customize-view>`;
                break;
            case 'history':
                viewContent = html`<history-view></history-view>`;
                break;
            case 'help':
                viewContent = html`<help-view></help-view>`;
                break;
            case 'onboarding':
                viewContent = html`<onboarding-view></onboarding-view>`;
                break;
            case 'setup':
                viewContent = html`<setup-view></setup-view>`;
                break;
            default:
                viewContent = html`<div>Unknown view: ${this.currentView}</div>`;
        }

        return html`
            ${viewContent}
        `;
    }

    // LiteLLM状态监控方法已移至设置页面
    // startLiteLLMStatusMonitoring() { ... }
    // async checkLiteLLMStatus() { ... }
}

customElements.define('pickle-glass-app', PickleGlassApp);
