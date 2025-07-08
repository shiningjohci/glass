// 应用状态诊断脚本
// 在应用启动后，在开发者工具的控制台中运行此脚本

console.log('=== Glass 应用状态诊断 ===');

// 1. 检查当前界面状态
console.log('\n1. 界面状态检查:');
const headerContainer = document.getElementById('header-container');
if (headerContainer) {
    console.log('✅ Header容器找到');
    const apiKeyHeader = headerContainer.querySelector('apikey-header');
    const appHeader = headerContainer.querySelector('app-header');
    
    if (apiKeyHeader) {
        console.log('❌ 当前显示API密钥界面 (应该是app界面)');
    } else if (appHeader) {
        console.log('✅ 当前显示App界面');
        
        // 检查按钮是否存在
        const listenButton = appHeader.shadowRoot?.querySelector('.listen-button');
        const askAction = appHeader.shadowRoot?.querySelector('.ask-action');
        const settingsButton = appHeader.shadowRoot?.querySelector('.settings-button');
        
        console.log('   - Listen按钮:', listenButton ? '✅ 存在' : '❌ 不存在');
        console.log('   - Ask按钮:', askAction ? '✅ 存在' : '❌ 不存在');
        console.log('   - 设置按钮:', settingsButton ? '✅ 存在' : '❌ 不存在');
    } else {
        console.log('❌ 没有找到任何header界面');
    }
} else {
    console.log('❌ Header容器未找到');
}

// 2. 检查IPC是否可用
console.log('\n2. IPC连接检查:');
if (window.require) {
    console.log('✅ Electron环境可用');
    const { ipcRenderer } = window.require('electron');
    
    // 测试IPC通信
    ipcRenderer.invoke('get-current-api-key')
        .then(key => {
            console.log('✅ IPC通信正常');
        })
        .catch(err => {
            console.log('❌ IPC通信失败:', err);
        });
} else {
    console.log('❌ Electron环境不可用');
}

// 3. 检查状态灯
console.log('\n3. LiteLLM状态灯检查:');
const pickleGlassApp = document.querySelector('pickle-glass-app');
if (pickleGlassApp) {
    console.log('✅ PickleGlassApp组件找到');
    const statusIndicator = pickleGlassApp.shadowRoot?.querySelector('.status-indicator');
    if (statusIndicator) {
        console.log('✅ 状态指示器存在');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');
        
        if (statusDot) {
            const statusClass = statusDot.classList.contains('connected') ? 'connected' : 
                              statusDot.classList.contains('disconnected') ? 'disconnected' : 
                              statusDot.classList.contains('checking') ? 'checking' : 'unknown';
            console.log(`   - 状态: ${statusClass}`);
        }
        if (statusText) {
            console.log(`   - 状态文本: ${statusText.textContent}`);
        }
    } else {
        console.log('❌ 状态指示器不存在');
    }
} else {
    console.log('❌ PickleGlassApp组件未找到');
}

// 4. 手动测试IPC功能
console.log('\n4. 功能测试:');
if (window.require) {
    const { ipcRenderer } = window.require('electron');
    
    console.log('测试toggle-feature功能...');
    
    // 测试Ask功能
    ipcRenderer.invoke('toggle-feature', 'ask')
        .then(() => {
            console.log('✅ Ask功能IPC调用成功');
        })
        .catch(err => {
            console.log('❌ Ask功能IPC调用失败:', err);
        });
    
    // 测试Listen功能
    ipcRenderer.invoke('toggle-feature', 'listen')
        .then(() => {
            console.log('✅ Listen功能IPC调用成功');
        })
        .catch(err => {
            console.log('❌ Listen功能IPC调用失败:', err);
        });
}

// 5. 检查快捷键
console.log('\n5. 快捷键检查:');
console.log('请尝试以下快捷键:');
console.log('   - Ctrl+Enter (Windows) / Cmd+Enter (Mac): Ask功能');
console.log('   - Ctrl+\\ (Windows) / Cmd+\\ (Mac): 切换可见性');

console.log('\n=== 诊断完成 ===');
console.log('如果发现问题，请将以上输出截图发送给开发者'); 