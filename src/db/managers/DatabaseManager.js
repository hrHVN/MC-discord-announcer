import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Sleep from '../../utils/Sleep.js';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const { createHash, randomUUID } = await import('node:crypto');

const md5Hash = () => createHash('md5').update(randomUUID().replace(/-/g, '')).digest('hex');
const sqlite = sqlite3.verbose();

export default class DatabaseManager {
	static #instance;
	 _queue = [];
    _processing = false;
    db = null;


	constructor() {
		this.db = new sqlite.Database(
			path.resolve('db/sqlite', 'database.db'),
			sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
			err => {
        		if (err) console.error('[DatabaseManager] DB open error:', err);
      		},
  			{ bigint: true });
	}

	static getInstance() {
		if (!DatabaseManager.#instance){
			DatabaseManager.#instance = new DatabaseManager();
		}
		return DatabaseManager.#instance;
	}

	async #processQueue() {
        // Prevent nested processing
        if (this._processing) return;
        this._processing = true;

        try {
            while (this._queue.length > 0) {
                const item = this._queue.shift();
                
                try {
                    const result = await new Promise((res, rej) => {
                        this.db.all(item.sql, item.params, (err, rows) => {
                            if (err) rej(err);
                            else res(rows);
                        });
                    });
                    item.resolve(result);
                } catch (err) {

                    item.reject(err);
                }
            }
        } finally {
            this._processing = false;
        }
    }

	async query(sql, params = []) {
		const id = md5Hash();
        // Add query to queue and return a promise that resolves when processed
        return new Promise((resolve, reject) => {
            this._queue.push({
                id,
                sql,
                params,
                resolve,
                reject
            });
            
            // Start processing if not already running
            this.#processQueue();
        });
	}

	async run(sql, params = []) {
		const id = md5Hash();
        
        return new Promise((resolve, reject) => {
            this._queue.push({
                id,
                sql,
                params,
                resolve,
                reject,
                type: 'run'
            });
            
            this.#processQueue();
        });
	}

	async close() {
		while (this._queue.length > 0 || this._processing) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        await new Promise((resolve, reject) => {
            this.db.close(err => err ? reject(err) : resolve());
        });
        
        console.info('[DatabaseManager] Connection closed');
	}

	async InitialiseSQLite() {
	    const db = this.db;
	    const execAsync = promisify(db.exec.bind(db));
	    const runAsync = promisify(db.run.bind(db));
	    const getAsync = promisify(db.get.bind(db));
	    const schemaDir = path.resolve('db/db-migrations');
	    
	    async function execFileInTx(sqlContent, fileName, sequence) {
	        // More robust SQL splitting that handles comments better
	        const statements = sqlContent
	            .replace(/(--.*)|\/\*[\s\S]*?\*\//g, '')  // Remove comments
	            .split(';')
	            .map(s => s.trim())
	            .filter(s => s.length > 0);

	        if (statements.length === 0) {
	            console.warn(`No valid statements in ${fileName}`);
	            return;
	        }

	        try {
	            await execAsync('BEGIN TRANSACTION;');
	            for (let stmt of statements) {
	                console.debug(`Executing: ${stmt}`);
	                await runAsync(stmt);  // Use run() for individual statements
	            }
	            await runAsync('INSERT INTO migrations (sequence) VALUES (?)', [sequence]);
	            await execAsync('COMMIT;');
	            
	            console.info(`Applied migration: ${fileName}`);
	        } catch (err) {
	            await execAsync('ROLLBACK;');
	            console.error(`Migration failed ${fileName}:`, err.message);
	            throw err;  // Propagate error to caller
	        }
	    }
	    
	    try {
	        console.info('Starting database update...');

	        // Ensure migrations tracking table exists
	        await execAsync(`
	            CREATE TABLE IF NOT EXISTS migrations (
	                id INTEGER PRIMARY KEY AUTOINCREMENT,
	                sequence INTEGER NOT NULL UNIQUE
	            );
	        `);
	        
	        // Get last applied migration
	        const latestRow = await getAsync(
	            'SELECT sequence FROM migrations ORDER BY id DESC LIMIT 1'
	        );
	        const lastMigrationId = latestRow?.sequence ?? 0;
	        console.log('Last migration:', lastMigrationId);
	        
	        // Load and sort migration files
	        const files = await readdir(schemaDir);
	        const sqlFiles = files
	            .filter(f => f.endsWith('_schema.sql'))
	            .map(f => ({
	                name: f,
	                order: parseInt(f.split('_')[0], 10) || 0,
	            }))
	            .sort((a, b) => a.order - b.order);
	        
	        // Run migrations sequentially
	        for (const { name, order } of sqlFiles) {
	            if (order <= lastMigrationId) {
	                console.debug(`Skipping applied migration: ${name}`);
	                continue;
	            }
	            
	            const fullPath = path.join(schemaDir, name);
	            const rawSql = await readFile(fullPath, 'utf8');
	            await execFileInTx(rawSql, name, order);  // Sequential by design
	        }

	        console.info('Finished database update!');
	    } catch (e) {
	        console.error('Database update failed:', e);
	        throw e;  // Let caller handle failure
	    }
	}
}