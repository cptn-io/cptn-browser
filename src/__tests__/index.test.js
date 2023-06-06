import EventQueue from '../eventQueue';
import Cptn from '../index';

jest.mock('../eventQueue');

describe('Cptn', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.error = jest.fn();
    });

    describe('constructor', () => {
        it('should initialize eventQueue with the provided URL', () => {
            const url = 'https://example.com';
            const cptn = new Cptn({ url });
            expect(cptn.eventQueue).toBeInstanceOf(EventQueue);
            expect(EventQueue).toHaveBeenCalledWith(`${url}/batch`);
        });

        it('should append the key as a token to the URL', () => {
            const url = 'https://example.com';
            const key = 'abc123';
            const cptn = new Cptn({ url, key });
            expect(cptn.eventQueue).toBeInstanceOf(EventQueue);
            expect(EventQueue).toHaveBeenCalledWith(`${url}/batch?token=${key}`);
        });

        it('should use batch url if provided', () => {
            const url = 'https://example.com/events/1234/batch';
            const key = 'abc123';
            const cptn = new Cptn({ url, key });
            expect(cptn.eventQueue).toBeInstanceOf(EventQueue);
            expect(EventQueue).toHaveBeenCalledWith(`${url}?token=${key}`);
        });

        it('should handle trailing / if provided', () => {
            const url = 'https://example.com/events/1234/';
            const key = 'abc123';
            const cptn = new Cptn({ url, key });
            expect(cptn.eventQueue).toBeInstanceOf(EventQueue);
            expect(EventQueue).toHaveBeenCalledWith(`${url.slice(0, -1)}/batch?token=${key}`);
        });

        it('should log an error if URL is not provided', () => {
            const url = undefined;
            new Cptn({ url });
            expect(console.error).toHaveBeenCalledWith('CptnJS: URL is required. Please provide a URL to your Cptn instance.');
        });
    });

    describe('sendEvent', () => {
        let cptn;

        beforeEach(() => {
            const url = 'https://example.com';
            cptn = new Cptn({ url });
            cptn.eventQueue.addEvent = jest.fn();
        });

        it('should add the event to the eventQueue', async () => {
            const payload = { event: 'click', item: 'signup_buttom' };
            await cptn.sendEvent(payload);

            expect(cptn.eventQueue.addEvent).toHaveBeenCalledTimes(1);
        });

        it('should log an error if Cptn is not ready', () => {
            cptn.ready = false;
            const payload = { event: 'click', timestamp: Date.now() };
            cptn.sendEvent(payload);
            expect(console.error).toHaveBeenCalledWith('CptnJS: CptnJS is not ready. Ensure the url and key (if secured) are passed to the constructor.');
        });

        it('should log an error if payload is not an object', () => {
            cptn.sendEvent('invalidPayload');
            expect(console.error).toHaveBeenCalledWith('CptnJS: Event payload must be an object. Discarding event.');
        });
    });

    describe('enrichEvent', () => {
        let cptn;

        beforeEach(() => {
            const url = 'https://example.com';
            cptn = new Cptn({ url });
            cptn.userId = '1234';
            cptn.groupId = '5678';

            //mock window object
            delete window.location;
            window.location = {
                href: 'https://example.com',
                pathname: '/path',
                search: '?search=123',
                hash: '#hash',
            };
            window.navigator = {
                userAgent: 'userAgent',
                language: 'en-US',
            };

            window.screen = {
                width: 100,
                height: 100,
            };

            window.document = {
                referrer: 'https://example.com',
                title: 'title',
            };

            Intl.DateTimeFormat = jest.fn().mockImplementation(() => ({
                resolvedOptions: () => ({
                    timeZone: 'America/New_York',
                }),
            }));

            Date.prototype.getTimezoneOffset = jest.fn().mockImplementation(() => 240);
        });


        it('should add the anonymousId, timestamp, and userId to the event', async () => {
            const payload = { event: 'click', item: 'signup_buttom' };
            const enrichedPayload = await cptn.enrichEvent(payload);
            expect(enrichedPayload).toEqual({
                ...payload,
                "context": {
                    "groupId": "5678",
                    "locale": "en-US",
                    "page": {
                        "hash": "#hash",
                        "path": "/path",
                        "referrer": "https://example.com",
                        "search": "?search=123",
                        "title": "title",
                        "url": "https://example.com",
                    },
                    "screen": {
                        "height": 100,
                        "width": 100,
                    },
                    "timezone": "America/New_York",
                    "tzOffset": 240,
                    "userAgent": "userAgent",
                },
                anonymousId: cptn.anonymousId,
                timestamp: expect.any(String),
                userId: cptn.userId,
            });
        });
    });


});