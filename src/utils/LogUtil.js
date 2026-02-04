export default class LogUtil{
	static #instance;
	_logLevel;

	constructor(logLevel) {
		this._logLevel = logLevel;
	}

	static getInstance() {
		if (!LogUtil.#instance){
			LogUtil.#instance = new LogUtil(this._logLevel);
		}
		return LogUtil.#instance;
	}

	error() {}

	info() {}

	warn() {}

	log() {}
}

