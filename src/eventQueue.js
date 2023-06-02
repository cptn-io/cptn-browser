import Dispatcher from "./dispatcher.js";
import EventStorage from "./eventStorage.js";

class EventQueue {
    constructor(url, batchSize = 10, batchInterval = 1000, maxQueueSize = 100, maxRetries = 3) {
        this.url = url;
        this.storage = new EventStorage(maxQueueSize);
        this.batchInterval = batchInterval;
        this.batchSize = batchSize;
        this.isProcessing = false;
        this.maxRetries = maxRetries;

        setInterval(async () => {
            await this.processEvents();
        }, batchInterval);
    }

    async addEvent(event) {
        this.storage.addEvent(event);
    }

    async processEvents() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;

        const events = this.storage.getEvents(this.batchSize);
        await this.processEventBatch(events);

        this.isProcessing = false;
    }

    async processEventBatch(events, curTry = 1) {
        if (events.length === 0) {
            return;
        }
        if (curTry > 1) {
            console.log(`Retrying #${curTry}/${this.maxRetries} times.`);
        }

        const dispatcher = new Dispatcher();
        try {
            await dispatcher.dispatch(this.url, events);
        } catch (e) {
            if (curTry < this.maxRetries) {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        this.processEventBatch(events, curTry + 1).then(resolve).catch(resolve);
                    }, this.batchInterval * curTry);
                });
            } else {
                console.error(`Failed to send batch after ${this.maxRetries} tries.`, e);
            }
        }
    }
}

export default EventQueue;