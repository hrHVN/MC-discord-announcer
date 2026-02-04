import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const sqlite = sqlite3.verbose();

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

export default class DatabaseManager {
	static #instance;
	
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

	async waitForOpen() {
    	if (this.db.open) return;
    	await new Promise((resolve, reject) => {
    	  this.db.once('open', resolve);
    	  this.db.once('error', reject);
    	});
  	}

	query(sql, params = []) {
		return new Promise((resolve, reject) => {
			this.db.all(sql, params, (err, rows) =>{
				if(err) reject(err);
				else resolve(rows);
			})
		});
	}

	run(sql, params = []) {
		return new Promise((resolve, reject) => {
			this.db.run(sql, params, (err, rows) =>{
				if(err) reject(err);
				else resolve(rows);
			})
		});
	}

	async initialiseDatabase() {
		const runAsync   = promisify(this.db.run.bind(this.db));
		const execAsync  = promisify(this.db.exec.bind(this.db));
    	const schemaDir = path.resolve('db/db-migrations');

		async function execFileInTx(sqlContent, fileName) {
		    const statements = sqlContent
		      .split(/;\s*(?:\r?\n|$)/g)          
		      .map(s => s.trim())
		      .filter(s => s.length > 0);

		    if (statements.length === 0) return; 

		    try {
			    await execAsync('BEGIN TRANSACTION;');
			    for (const stmt of statements) {
			    	await execAsync(stmt + ';');
			    }
			    await execAsync('COMMIT;');
		      	console.log(`Applied ${fileName}`);
		    } catch (err) {
		    	await execAsync('ROLLBACK;');
		      	console.error(`Failed to apply ${fileName}:`, err.message);
		      	throw err;
		    }
		}

		const files = await readdir(schemaDir);
		const sqlFiles = files
		  .filter(f => f.endsWith('.sql'))
		  .map(f => ({
		    name: f,
		    // Extract leading number (e.g., "001" from "001_schema.sql")
		    order: parseInt(f.split('_')[0], 10) || 0,
		  }))
		  .sort((a, b) => a.order - b.order);
		
		for (const { name } of sqlFiles) {
		  const fullPath = path.join(schemaDir, name);
		  const rawSql   = await readFile(fullPath, 'utf8');
		  await execFileInTx(rawSql, name);
	  }
	}

	async close() {
		await new Promise((resolve, reject) => {
      		this.db.close(err => (err ? reject(err) : resolve()));
   		});
    	console.info('[DatabaseManager] Connection closed');
	}
}