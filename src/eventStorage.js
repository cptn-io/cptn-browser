class EventStorage {
    constructor(maxQueueSize = 100) {
        this.storage = [];
        this.maxQueueSize = maxQueueSize;
    }

    async addEvent(event) {
        if (this.storage.length >= this.maxQueueSize) {
            console.warn("CptnJS: Event storage is full. Discarding event.");
            return;
        }
        this.storage.push(event);
    }

    getEvents(count) {
        return this.storage.splice(0, count);
    }
}

export default EventStorage;