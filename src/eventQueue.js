import Dispatcher from "./dispatcher.js";
import EventStorage from "./eventStorage.js";

class EventQueue {
    constructor(url, batchSize = 10, batchInterval = 1000) {
        this.url = url;
        this.storage = new EventStorage();
        this.batchSize = batchSize;
        setInterval(() => {
            this.processEvents();
        }, batchInterval);
    }

    async addEvent(event) {
        this.storage.addEvent(event);
    }

    processEvents() {
        const events = this.storage.getEvents(this.batchSize);
        console.log(events);
        if (events.length > 0) {
            Dispatcher.dispatch(this.url, events);
        }
    }
}

export default EventQueue;