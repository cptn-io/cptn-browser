import Dispatcher from "./dispatcher.js";
import EventStorage from "./eventStorage.js";

class EventQueue {
    constructor(url, batchSize = 10, batchInterval = 1000, maxQueueSize = 100) {
        this.url = url;
        this.storage = new EventStorage(maxQueueSize);
        this.batchSize = batchSize;
        setInterval(async () => {
            await this.processEvents();
        }, batchInterval);
    }

    async addEvent(event) {

        this.storage.addEvent(event);
    }

    async processEvents() {
        const events = this.storage.getEvents(this.batchSize);
        if (events.length > 0) {
            const dispatcher = new Dispatcher();
            try {
                await dispatcher.dispatch(this.url, events);
            } catch (e) {
                console.error(e);
            }
        }
    }
}

export default EventQueue;