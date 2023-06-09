/*!
 * cptn-browser
 * @license Copyright (c) 2023 DevRaven, Inc.
 * MIT license
 */

import Cookies from "js-cookie";
import EventQueue from "./eventQueue.js";

class Cptn {

    anonymousCookieName = "cptnjs_anonymous_id";
    userCookieName = "cptnjs_user_id";

    constructor({ url, key }) {
        if (!url) {
            console.error("CptnJS: URL is required. Please provide a URL to your Cptn instance.");
            return;
        }
        url = url.endsWith("/") ? url.slice(0, -1) : url;
        url = url.endsWith("/batch") ? url : url + "/batch";
        url = url + (key ? "?token=" + key : '');

        this.eventQueue = new EventQueue(url);
        this.setupAnonymousId();
        this.setupUserId();
        this.ready = true;
    }

    setupAnonymousId() {
        let anonymousId = Cookies.get(this.anonymousCookieName);
        if (anonymousId) {
            this.anonymousId = anonymousId;
            return;
        }

        this.anonymousId = anonymousId = Math.random().toString(36).substring(2);
        Cookies.set(this.anonymousCookieName, anonymousId, { expires: 365 });
    }

    setupUserId() {
        let userId = Cookies.get(this.userCookieName);
        if (userId) {
            this.userId = userId;
        }
    }



    identify(userId, properties = {}) {
        if (userId !== 0 && !userId) {
            return;
        }
        this.userId = userId;
        Cookies.set(this.userCookieName, this.userId, { expires: 365 });
        this.sendEvent({ type: "identify", properties });
    }

    track(event = "default", properties = {}) {
        this.sendEvent({ type: "track", event, properties });
    }

    page(category = "default", name = "default", properties = {}) {
        this.sendEvent({ type: "page", category, name, properties });
    }

    screen(name = "default", properties = {}) {
        this.sendEvent({ type: "screen", name, properties });
    }

    group(groupId, properties = {}) {
        this.groupId = groupId;
        this.sendEvent({ type: "group", groupId, properties });
    }

    capture(type = "customEvent", properties = {}) {
        this.sendEvent({ type, properties });
    }

    clearIdentity() {
        this.userId = undefined;
        this.groupId = undefined;
        Cookies.remove(this.userCookieName);
    }

    sendEvent(payload) {
        if (!this.ready) {
            console.error("CptnJS: CptnJS is not ready. Ensure the url and key (if secured) are passed to the constructor.");
            return;
        }

        if (typeof payload !== "object") {
            console.error("CptnJS: Event payload must be an object. Discarding event.");
            return;
        }
        payload = this.enrichEvent(payload);
        this.eventQueue.addEvent(payload);
    }



    enrichEvent(event) {
        return {
            ...event,
            anonymousId: this.anonymousId,
            timestamp: new Date().toISOString(),
            userId: this.userId,
            context: {
                userAgent: window?.navigator?.userAgent,
                page: {
                    url: window?.location?.href,
                    referrer: window?.document?.referrer,
                    title: window?.document?.title,
                    path: window?.location?.pathname,
                    search: window?.location?.search,
                    hash: window?.location?.hash,
                },
                screen: {
                    width: window?.screen?.width,
                    height: window?.screen?.height,
                },
                locale: window?.navigator?.language,
                timezone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone,
                tzOffset: new Date().getTimezoneOffset(),
                groupId: this.groupId
            }
        }
    }


}

export default Cptn;