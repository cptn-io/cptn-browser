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
            this.processEvents().then(() => {
                console.log('Batch processed successfully.');
            }).catch((error) => {
                console.error("Error processing event batch: ", error);
            });
        }, batchInterval);
    }

    addEvent(event) {
        this.storage.addEvent(event);
    }

    processEvents() {
        return new Promise((resolve, reject) => {
            if (this.isProcessing) {
                return;
            }
            this.isProcessing = true;

            const events = this.storage.getEvents(this.batchSize);

            this.processEventBatch(events).then(() => {
                this.isProcessing = false;
                resolve();
            }).catch((error) => {
                console.error(error);
                this.isProcessing = false;
                reject(error);
            });
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
                .catch(async (err) => {
                    console.warn(err);
                    if (curTry < this.maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, this.batchInterval * curTry));
                        try {
                            await this.processEventBatch(events, curTry + 1);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(new Error(`Failed to send batch after ${this.maxRetries} tries.`));
                    }
                });
        });
    }

}

export default EventQueue;