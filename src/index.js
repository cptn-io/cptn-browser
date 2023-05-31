import EventQueue from "./eventQueue.js";

class Cptn {

    constructor({ url, key }) {
        if (!url) {
            console.error("CptnJS: URL is required. Please provide a URL to your Cptn instance.");
            return;
        }

        url = url.endsWith("/") ? url : url + "/";
        url = url.endsWith("/batch") ? url : url + "batch";
        url = url + (key ? "?token=" + key : '');

        this.eventQueue = new EventQueue(url);
        this.ready = true;
    }

    async sendEvent(payload) {
        if (!this.ready) {
            console.error("CptnJS: Cptn is not ready. Ensure the url and key are passed to the constructor.");
            return;
        }

        if (typeof payload !== "object") {
            console.error("CptnJS: Event payload must be an object. Discarding event.");
            return;
        }
        this.eventQueue.addEvent(payload);
    }
}

export default Cptn;