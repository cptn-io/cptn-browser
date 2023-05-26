class EventStorage {
    constructor() {
        this.storage = [];
    }

    async addEvent(event) {
        if (this.storage.length >= 100) {
            console.warn("CptnJS: Event storage is full. Discarding event.")
            return;
        }
        this.storage.push(event);
    }

    getEvents(count) {
        return this.storage.splice(0, count);
    }
}

export default EventStorage;