import { EventEmitter } from 'node:events';

class WebsocketEvents extends EventEmitter {};

const websocketEvents = new WebsocketEvents();

export default websocketEvents;