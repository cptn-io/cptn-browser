import Cookies from 'js-cookie';
import Cptn from '../index';

jest.mock('../eventQueue');

describe('tracking events', () => {
    let cptn;
    beforeEach(() => {
        jest.clearAllMocks();
        console.error = jest.fn();
        Cookies.get = jest.fn(() => undefined);
        const url = 'https://example.com';
        cptn = new Cptn({ url });
    });

    it('should track page view', async () => {
        cptn.sendEvent = jest.fn();
        const category = 'signup';
        const name = 'signup_page';
        const properties = { signup: 'true' };
        cptn.page(category, name, properties);
        expect(cptn.sendEvent).toHaveBeenCalledWith({ type: "page", category, name, properties });
    });

    it('should track screen view', async () => {
        cptn.sendEvent = jest.fn();
        const name = 'signup_screen';
        const properties = { signup: 'true' };
        cptn.screen(name, properties);
        expect(cptn.sendEvent).toHaveBeenCalledWith({ type: "screen", name, properties });
    });

    it('should track screen view', async () => {
        cptn.sendEvent = jest.fn();
        const name = 'signup_screen';
        const properties = { signup: 'true' };
        cptn.screen(name, properties);
        expect(cptn.sendEvent).toHaveBeenCalledWith({ type: "screen", name, properties });
    });

    it('should handle group', async () => {
        cptn.sendEvent = jest.fn();
        const groupId = '1234';
        const properties = { name: 'engineering' };
        cptn.group(groupId, properties);
        expect(cptn.sendEvent).toHaveBeenCalledWith({ type: "group", groupId, properties });
    });

    it('should handle identify call', async () => {
        cptn.sendEvent = jest.fn();
        const userId = '1234';
        const properties = { name: 'engineering' };
        cptn.identify(userId, properties);
        expect(cptn.sendEvent).toHaveBeenCalledWith({ type: "identify", properties });
    });

    it('should handle identify call with id 0', async () => {
        cptn.sendEvent = jest.fn();
        const userId = 0;
        const properties = { name: 'engineering' };
        cptn.identify(userId, properties);
        expect(cptn.sendEvent).toHaveBeenCalledWith({ type: "identify", properties });
    });

    it('should handle identify call with no userId', async () => {
        cptn.sendEvent = jest.fn();
        const userId = null;
        const properties = { name: 'engineering' };
        cptn.identify(userId, properties);
        expect(cptn.sendEvent).toBeCalledTimes(0);
    });

    it('should handle track call', async () => {
        cptn.sendEvent = jest.fn();
        const event = 'click';
        const properties = { button: 'signup' };
        cptn.track(event, properties);
        expect(cptn.sendEvent).toHaveBeenCalledWith({ type: "track", event, properties });
    });

    it('should handle custom events', async () => {
        cptn.sendEvent = jest.fn();
        const type = 'user_signup.done';
        const properties = { button: 'signup' };
        cptn.capture(type, properties);
        expect(cptn.sendEvent).toHaveBeenCalledWith({ type, properties });
    });

    it('ensure anonymousId is set', async () => {
        expect(cptn.anonymousId).toBeDefined();

        const anonymousId = Math.random().toString(36).substring(2);
        Cookies.get = jest.fn(() => anonymousId);
        const url = 'https://example.com';
        cptn = new Cptn({ url });
        expect(cptn.anonymousId).toEqual(anonymousId);
    });

    it('ensure userId is set', async () => {
        expect(cptn.userId).toBeUndefined();
        const userId = Math.random().toString(36).substring(2);
        Cookies.get = jest.fn(() => userId);
        const url = 'https://example.com';
        cptn = new Cptn({ url });
        cptn.identify(userId);
        expect(cptn.userId).toEqual(userId);
    });

    it('should remove userId, groupId on clearUserDetails', async () => {
        cptn.sendEvent = jest.fn();
        Cookies.remove = jest.fn();
        const userId = 0;
        const properties = { name: 'engineering' };
        cptn.identify(userId, properties);
        const groupId = '1234';
        cptn.group(groupId, properties);

        expect(cptn.userId).toEqual(userId);
        expect(cptn.groupId).toEqual(groupId);
        cptn.clearIdentity();
        expect(cptn.userId).toBeUndefined();
        expect(cptn.groupId).toBeUndefined();
        expect(Cookies.remove).toHaveBeenCalledWith(cptn.userCookieName);
    });
});