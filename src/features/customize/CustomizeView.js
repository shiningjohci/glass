import { LitElement, html, css } from '../../assets/lit-core-2.7.4.min.js';

class CustomizeView extends LitElement {
    static properties = {
        apiKey: { type: String, state: true },
        isKeySaved: { type: Boolean, state: true },
        showSuccessMessage: { type: Boolean, state:true },
    };

    constructor() {
        super();
        this.apiKey = '';
        this.isKeySaved = false;
        this.showSuccessMessage = false;

        if (window.ipcRenderer) {
            this.loadApiKey();
        } else {
            console.warn('ipcRenderer not available. Running in browser mode?');
        }
    }

    async loadApiKey() {
        try {
            const storedKey = await window.ipcRenderer.invoke('get-stored-api-key');
            if (storedKey) {
                this.apiKey = storedKey;
                this.isKeySaved = true;
            } else {
                this.apiKey = '';
                this.isKeySaved = false;
            }
        } catch (error) {
            console.error('Failed to load API key:', error);
        }
    }

    handleInputChange(event) {
        this.apiKey = event.target.value;
        this.isKeySaved = !!this.apiKey.trim();
    }
    
    handleClearKey() {
        this.apiKey = '';
        this.isKeySaved = false;
        window.ipcRenderer.invoke('clear-api-key');
        console.log('Clarifai PAT cleared.');
    }

    async saveApiKey() {
        if (!this.apiKey.trim()) {
            console.log('API key is empty, clearing...');
            await this.handleClearKey();
            return;
        }

        try {
            await window.ipcRenderer.invoke('set-api-key', this.apiKey.trim());
            this.isKeySaved = true;
            this.showSuccessMessage = true;
            setTimeout(() => { this.showSuccessMessage = false; }, 2000);
            console.log('Clarifai PAT saved successfully.');
            } catch (error) {
            console.error('Failed to save API key:', error);
        }
    }

    render() {
        return html`
            <div class="container">
                <div class="header">
                    <h2>API Settings</h2>
                    <p>Enter your Clarifai Personal Access Token (PAT) below. This single key will be used for all AI features.</p>
                </div>

                <div class="api-key-input-container">
                    <input 
                        type="password" 
                        .value=${this.apiKey} 
                        @input=${this.handleInputChange}
                        placeholder="Enter your Clarifai PAT here" 
                    />
                    <button @click=${this.saveApiKey} ?disabled=${!this.apiKey.trim()}>
                        ${this.isKeySaved ? 'Update Key' : 'Save Key'}
                    </button>
                    <button class="clear-btn" @click=${this.handleClearKey} ?disabled=${!this.apiKey.trim()}>Clear</button>
                </div>
                ${this.showSuccessMessage ? html`<div class="success-message">API Key saved!</div>` : ''}

                <div class="instructions">
                    <h3>How to get your PAT:</h3>
                    <ol>
                        <li>Go to the <a href="https://clarifai.com/settings/security" target="_blank">Clarifai Security Settings</a> page.</li>
                        <li>Click "Create Personal Access Token".</li>
                        <li>Give it a description (e.g., "Glass App").</li>
                        <li>Select **all scopes** to ensure full functionality.</li>
                        <li>Copy the token and paste it above.</li>
                    </ol>
                </div>
            </div>
        `;
    }

    static styles = css`
        :host {
            display: block;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .container {
            padding: 25px;
            color: #444;
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 15px;
            margin-bottom: 25px;
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
        .api-key-input-container {
            display: flex;
            margin: 20px 0;
        }
        input[type="password"] {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px 0 0 5px;
            font-size: 14px;
            outline: none;
        }
        input[type="password"]:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        button {
            padding: 10px 18px;
            border: none;
            background-color: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #a0a0a0;
            cursor: not-allowed;
        }
        button.clear-btn {
            background-color: #6c757d;
            border-radius: 0 5px 5px 0;
        }
        button.clear-btn:hover {
            background-color: #5a6268;
        }
        .success-message {
            color: #28a745;
            font-size: 13px;
            margin-top: -15px;
            margin-bottom: 15px;
            font-weight: 500;
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
    `;
}

customElements.define('customize-view', CustomizeView);

// Export the class for ES6 module imports
export default CustomizeView;
