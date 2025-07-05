const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');

let db;

function initialize() {
    return new Promise((resolve, reject) => {
        const dbExists = fs.existsSync(dbPath);
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Failed to connect to SQLite database.', err);
                return reject(err);
            }
            console.log('Connected to SQLite database.');

            // Simplified schema: only one key, identified by a fixed ID.
            const schema = `
                CREATE TABLE IF NOT EXISTS api_keys (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    api_key TEXT NOT NULL
                );
            `;
            db.run(schema, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
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
    db.close((err) => {
        if (err) {
            return console.error('Error closing the database connection.', err.message);
        }
        console.log('Closed the database connection.');
    });
}

module.exports = {
    initialize,
    saveApiKey,
    getApiKey,
    close
}; 