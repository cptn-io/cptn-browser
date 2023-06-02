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
        this.dispatcher = new Dispatcher();

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

        try {
            await this.dispatcher.dispatch(this.url, events);
        } catch (e) {
            console.log(`Failed to send batch. Retrying in ${this.batchInterval * curTry}ms.`, e)
            if (curTry < this.maxRetries) {
                console.log(`Retrying batch #${curTry}/${this.maxRetries} times.`)
                await new Promise((resolve) => {
                    console.log("here1");
                    setTimeout(() => {
                        console.log("here2");
                        console.log(`Retrying batch #${curTry}/${this.maxRetries} times.`)
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