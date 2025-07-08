import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithCredential, signInWithCustomToken, signOut } from 'firebase/auth';

import './AppHeader.js';
import './ApiKeyHeader.js';

const firebaseConfig = {
    apiKey: 'AIzaSyAgtJrmsFWG1C7m9S55HyT1laICEzuUS2g',
    authDomain: 'pickle-3651a.firebaseapp.com',
    projectId: 'pickle-3651a',
    storageBucket: 'pickle-3651a.firebasestorage.app',
    messagingSenderId: '904706892885',
    appId: '1:904706892885:web:0e42b3dda796674ead20dc',
    measurementId: 'G-SQ0WM6S28T',
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

class HeaderTransitionManager {
    constructor() {

        this.headerContainer      = document.getElementById('header-container');
        this.currentHeaderType    = null;   // 'apikey' | 'app'
        this.apiKeyHeader         = null;
        this.appHeader            = null;

        /**
         * only one header window is allowed
         * @param {'apikey'|'app'} type
         */
        this.ensureHeader = (type) => {
            if (this.currentHeaderType === type) return;

            if (this.apiKeyHeader) { this.apiKeyHeader.remove(); this.apiKeyHeader = null; }
            if (this.appHeader)    { this.appHeader.remove();    this.appHeader   = null; }

            if (type === 'apikey') {
                this.apiKeyHeader      = document.createElement('apikey-header');
                this.headerContainer.appendChild(this.apiKeyHeader);
            } else {
                this.appHeader         = document.createElement('app-header');
                this.headerContainer.appendChild(this.appHeader);
                this.appHeader.startSlideInAnimation?.();
            }

            this.currentHeaderType = type;
            this.notifyHeaderState(type);
        };

        console.log('[HeaderController] Manager initialized');

        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer
                .invoke('get-current-api-key')
                .then(storedKey => {
                    this.hasApiKey = !!storedKey;
                })
                .catch(() => {});
        }

        if (window.require) {
            const { ipcRenderer } = window.require('electron');

            ipcRenderer.on('login-successful', async (event, payload) => {
                const { customToken, token, error } = payload || {};
                try {
                    if (customToken) {
                        console.log('[HeaderController] Received custom token, signing in with custom token...');
                        await signInWithCustomToken(auth, customToken);
                        return;
                    }

                    if (token) {
                        console.log('[HeaderController] Received ID token, attempting Google credential sign-in...');
                        const credential = GoogleAuthProvider.credential(token);
                        await signInWithCredential(auth, credential);
                        return;
                    }

                    if (error) {
                        console.warn('[HeaderController] Login payload indicates verification failure. Proceeding to AppHeader UI only.');
                        // Check permissions before transitioning
                        const permissionResult = await this.checkPermissions();
                        if (permissionResult.success) {
                            this.transitionToAppHeader();
                        } else {
                            console.log('[HeaderController] Permissions not granted after login error');
                            if (this.apiKeyHeader) {
                                this.apiKeyHeader.errorMessage = permissionResult.error || 'Permission setup required';
                                this.apiKeyHeader.requestUpdate();
                            }
                        }
                    }
                } catch (error) {
                    console.error('[HeaderController] Sign-in failed', error);
                    // Check permissions before transitioning
                    const permissionResult = await this.checkPermissions();
                    if (permissionResult.success) {
                        this.transitionToAppHeader();
                    } else {
                        console.log('[HeaderController] Permissions not granted after sign-in failure');
                        if (this.apiKeyHeader) {
                            this.apiKeyHeader.errorMessage = permissionResult.error || 'Permission setup required';
                            this.apiKeyHeader.requestUpdate();
                        }
                    }
                }
            });
            
            
            ipcRenderer.on('request-firebase-logout', async () => {
                console.log('[HeaderController] Received request to sign out.');
                try {
                    await signOut(auth);
                } catch (error) {
                    console.error('[HeaderController] Sign out failed', error);
                }
            });

            ipcRenderer.on('api-key-validated', () => {
                console.log('[HeaderController] API key validation bypassed, going to app');
                this.transitionToAppHeader();
            });

            ipcRenderer.on('api-key-removed', () => {
                console.log('[HeaderController] API key removal ignored, staying in app');
                // No action needed - stay in app interface
            });

            ipcRenderer.on('api-key-updated', () => {
                console.log('[HeaderController] API key update ignored, staying in app');
                // No action needed - stay in app interface
            });

            ipcRenderer.on('firebase-auth-success', async (event, firebaseUser) => {
                console.log('[HeaderController] Received firebase-auth-success:', firebaseUser.uid);
                try {
                    if (firebaseUser.idToken) {
                        const credential = GoogleAuthProvider.credential(firebaseUser.idToken);
                        await signInWithCredential(auth, credential);
                        console.log('[HeaderController] Firebase sign-in successful via ID token');
                    } else {
                        console.warn('[HeaderController] No ID token received from deeplink, virtual key request may fail');
                        // Check permissions before transitioning
                        const permissionResult = await this.checkPermissions();
                        if (permissionResult.success) {
                            this.transitionToAppHeader();
                        } else {
                            console.log('[HeaderController] Permissions not granted after Firebase auth');
                            if (this.apiKeyHeader) {
                                this.apiKeyHeader.errorMessage = permissionResult.error || 'Permission setup required';
                                this.apiKeyHeader.requestUpdate();
                            }
                        }
                    }
                } catch (error) {
                    console.error('[HeaderController] Firebase auth failed:', error);
                    this.transitionToAppHeader();
                }
            });
        }

        this._bootstrap();

        onAuthStateChanged(auth, async user => {
            console.log('[HeaderController] Auth state changed. User:', user ? user.email : 'null');

            if (window.require) {
                const { ipcRenderer } = window.require('electron');

                let userDataWithToken = null;
                if (user) {
                    try {
                        const idToken = await user.getIdToken();
                        userDataWithToken = {
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName,
                            photoURL: user.photoURL,
                            idToken: idToken,
                        };
                    } catch (error) {
                        console.error('[HeaderController] Failed to get ID token:', error);
                        userDataWithToken = {
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName,
                            photoURL: user.photoURL,
                            idToken: null,
                        };
                    }
                }

                ipcRenderer.invoke('firebase-auth-state-changed', userDataWithToken).catch(console.error);
            }

            if (!this.isInitialized) {
                this.isInitialized = true;
                
                // Only transition to app header on first initialization
                // _bootstrap() has already handled the initial setup
                console.log('[HeaderController] Firebase auth initialized, app header already set by bootstrap');
            } else {
                // For subsequent auth state changes, just log but don't change interface
                console.log('[HeaderController] Firebase auth state changed, maintaining current interface');
            }
        });
    }

    notifyHeaderState(stateOverride) {
        const state = stateOverride || this.currentHeaderType || 'apikey';
        if (window.require) {
            window.require('electron').ipcRenderer.send('header-state-changed', state);
        }
    }

    async _bootstrap() {
        // Skip API key check and go directly to app interface
        console.log('[HeaderController] Skipping API key validation, going directly to app interface');
        
        // Check permissions first
            const permissionResult = await this.checkPermissions();
            
            if (permissionResult.success) {
                await this._resizeForApp();
                this.ensureHeader('app');
            } else {
            // Even without permissions, go to app interface with error display
            await this._resizeForApp();
            this.ensureHeader('app');
            console.log('[HeaderController] Permissions not granted but proceeding to app interface:', permissionResult.error);
        }
        
        // Force notify header state to ensure feature windows are created
        console.log('[HeaderController] Force notifying header state as app');
        this.notifyHeaderState('app');
    }

    async transitionToAppHeader(animate = true) {
        if (this.currentHeaderType === 'app') {
            return this._resizeForApp();
        }

        const canAnimate =
            animate &&
            this.apiKeyHeader &&
            !this.apiKeyHeader.classList.contains('hidden') &&
            typeof this.apiKeyHeader.startSlideOutAnimation === 'function';
    
        if (canAnimate) {
            const old = this.apiKeyHeader;
            const onEnd = () => {
                clearTimeout(fallback);
                this._resizeForApp().then(() => this.ensureHeader('app'));
            };
            old.addEventListener('animationend', onEnd, { once: true });
            old.startSlideOutAnimation();
    
            const fallback = setTimeout(onEnd, 450);
        } else {
            this.ensureHeader('app');
            this._resizeForApp();
        }
    }

    _resizeForApp() {
        if (!window.require) return;
        return window
            .require('electron')
            .ipcRenderer.invoke('resize-header-window', { width: 353, height: 60 })
            .catch(() => {});
    }

    async _resizeForApiKey() {
        if (!window.require) return;
        return window
            .require('electron')
            .ipcRenderer.invoke('resize-header-window', { width: 285, height: 220 })
            .catch(() => {});
    }

    async transitionToApiKeyHeader() {
        await this._resizeForApiKey();
        
        if (this.currentHeaderType !== 'apikey') {
            this.ensureHeader('apikey');
        }
        
        if (this.apiKeyHeader) this.apiKeyHeader.reset();
    }

    async checkPermissions() {
        if (!window.require) {
            return { success: true };
        }

        const { ipcRenderer } = window.require('electron');
        
        try {
            // Check permission status
            const permissions = await ipcRenderer.invoke('check-system-permissions');
            console.log('[HeaderController] Current permissions:', permissions);
            
            if (!permissions.needsSetup) {
                return { success: true };
            }

            // If permissions are not set up, return false
            let errorMessage = '';
            if (!permissions.microphone && !permissions.screen) {
                errorMessage = 'Microphone and screen recording access required';
            } else if (!permissions.microphone) {
                errorMessage = 'Microphone access required';
            } else if (!permissions.screen) {
                errorMessage = 'Screen recording access required';
            }
            
            return { 
                success: false, 
                error: errorMessage
            };
        } catch (error) {
            console.error('[HeaderController] Error checking permissions:', error);
            return { 
                success: false, 
                error: 'Failed to check permissions' 
            };
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new HeaderTransitionManager();
});
