import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import Sleep from '../../utils/Sleep.js';
const { createHash, randomUUID } = await import('node:crypto');

const md5Hash = () => createHash('md5').update(randomUUID().replace(/-/g, '')).digest('hex');
const sqlite = sqlite3.verbose();

export default class DatabaseManager {
	static #instance;
	_busy = false;
	_que = [];

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

	async query(sql, params = []) {
		return new Promise(async (resolve, reject) => {
			const id = md5Hash();
			this._que.push(id);
			this._busy = true;	
			while(this._busy) {
				if(this._que.length == 0) {
					//console.log("---DEBUG--- stoping while-busy: ",this._que);
					this._busy = false;
					break;
				}
				if (this._que[0] == id) {
					//console.log("---DEBUG--- exiting while-busy: ", this._que.length);
					break;
				}
				await Sleep(50);
			}
			
            this.db.all(sql, params, (err, rows) => {
                if (err) {
					//console.log("---DEBUG--- returning reject");
                	this._que.shift();
                	if (this._que.length < 1) this._busy = false;
                	reject(err);
                }
				//console.log("---DEBUG--- returning result", sql.slice(0,35).match(/\b\w*guild\w*\b/g)[0]);
                this._que.shift();
                if (this._que.length < 1) this._busy = false;
            	resolve(rows);
            });
        });
	}

	async run(sql, params = []) {
		return new Promise((resolve, reject) => {
			this.db.run(sql, params, (err, rows) =>{
				if(err) reject(err);
				else resolve(rows);
			})
		});
	}

	async close() {
		await new Promise((resolve, reject) => {
      		this.db.close(err => (err ? reject(err) : resolve()));
   		});
    	console.info('[DatabaseManager] Connection closed');
	}
}