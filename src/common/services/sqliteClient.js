const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

let db;
const defaultUserId = 'default_user';

// 连接函数（兼容databaseInitializer的调用）
function connect(dbPath) {
    return new Promise((resolve, reject) => {
        const finalDbPath = dbPath || path.join(__dirname, '..', '..', 'database.sqlite');
        
        db = new sqlite3.Database(finalDbPath, (err) => {
            if (err) {
                console.error('Failed to connect to SQLite database.', err);
                return reject(err);
            }
            console.log('Connected to SQLite database.');
            resolve();
        });
    });
}

// 初始化表结构
function initTables() {
    return new Promise((resolve, reject) => {
        const schema = `
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                api_key TEXT NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS users (
                uid TEXT PRIMARY KEY,
                display_name TEXT,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS presets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                name TEXT,
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        db.exec(schema, (err) => {
            if (err) {
                return reject(err);
            }
            console.log('[SQLite] Tables initialized successfully');
            resolve();
        });
    });
}

// 初始化默认数据
function initDefaultData() {
    return new Promise((resolve, reject) => {
        // 创建默认用户
        const insertUser = `
            INSERT OR IGNORE INTO users (uid, display_name, email) 
            VALUES (?, ?, ?)
        `;
        
        db.run(insertUser, [defaultUserId, 'Default User', 'default@glass.app'], function(err) {
            if (err) {
                return reject(err);
            }
            console.log('[SQLite] Default user initialized');
            resolve();
        });
    });
}

// 获取用户
function getUser(uid) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE uid = ?`;
        db.get(query, [uid], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

// 获取预设
function getPresets(userId) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM presets WHERE user_id = ?`;
        db.all(query, [userId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows || []);
        });
    });
}

// 兼容原有的初始化函数
function initialize() {
    return connect().then(() => initTables()).then(() => initDefaultData());
}

function saveApiKey(key) {
    return new Promise((resolve, reject) => {
        // Use UPSERT logic for a single key entry.
        const query = `
            INSERT INTO api_keys (id, api_key) VALUES (1, ?)
            ON CONFLICT(id) DO UPDATE SET api_key = excluded.api_key;
        `;
        db.run(query, [key], function(err) {
            if (err) {
                console.error('Error saving API key to database', err);
                return reject(err);
            }
            resolve();
        });
    });
}

function getApiKey() {
    return new Promise((resolve, reject) => {
        const query = `SELECT api_key FROM api_keys WHERE id = 1;`;
        db.get(query, [], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row ? row.api_key : null);
        });
    });
}

function close() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database connection.', err.message);
            } else {
                console.log('Closed the database connection.');
            }
            db = null;
        });
    }
}

module.exports = {
    connect,
    initialize,
    initTables,
    initDefaultData,
    getUser,
    getPresets,
    saveApiKey,
    getApiKey,
    close,
    defaultUserId
}; 