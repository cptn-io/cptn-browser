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

        setInterval(() => {
            this.processEvents();
        }, batchInterval);
    }

    addEvent(event) {
        this.storage.addEvent(event);
    }

    processEvents() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;

        const events = this.storage.getEvents(this.batchSize);

        this.processEventBatch(events).then(() => {
            this.isProcessing = false;
        }).catch((error) => {
            console.error(error);
            this.isProcessing = false;
        });
    }

    async processEventBatch(events, curTry = 1) {
        return new Promise((resolve, reject) => {
            if (events.length === 0) {
                resolve();
                return;
            }
            if (curTry > 1) {
                console.log(`Retrying #${curTry}/${this.maxRetries} times.`);
            }

            this.dispatcher.dispatch(this.url, events)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.warn(err);
                    if (curTry < this.maxRetries) {
                        setTimeout(async () => {
                            try {
                                await this.processEventBatch(events, curTry + 1);
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        }, this.batchInterval * curTry);
                    } else {
                        reject(new Error(`Failed to send batch after ${this.maxRetries} tries.`));
                    }
                });
        });
    }

}

export default EventQueue;