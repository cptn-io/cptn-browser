import EventQueue from '../eventQueue';
import EventStorage from '../eventStorage';
import Dispatcher from '../dispatcher';

describe('EventQueue', () => {
    let eventQueue;
    let mockStorage;
    let dispatcher;

    beforeEach(() => {
        jest.useFakeTimers();
        mockStorage = new EventStorage();
        dispatcher = new Dispatcher();
        eventQueue = new EventQueue('https://example.com', 10, 1000, 100, 3);
        eventQueue.storage = mockStorage;
        eventQueue.dispatcher = dispatcher;
        dispatcher.dispatch = jest.fn().mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should initialize EventQueue with default values', () => {
            expect(eventQueue.url).toBe('https://example.com');
            expect(eventQueue.storage).toBe(mockStorage);
            expect(eventQueue.batchSize).toBe(10);
            expect(eventQueue.batchInterval).toBe(1000);
            expect(eventQueue.isProcessing).toBe(false);
            expect(eventQueue.maxRetries).toBe(3);
        });

        it('should call processEvents at regular intervals', () => {
            eventQueue.processEvents = jest.fn();

            jest.advanceTimersByTime(5000);
            expect(eventQueue.processEvents).toHaveBeenCalledTimes(5);
        });
    });

    describe('addEvent', () => {

        it('should add an event to the storage', () => {
            mockStorage.addEvent = jest.fn();
            const event = { id: 1, name: 'Event' };
            eventQueue.addEvent(event);
            expect(mockStorage.addEvent).toHaveBeenCalledWith(event);
        });
    });

    describe('processEvents', () => {
        it('should not process events if already processing', async () => {
            eventQueue.isProcessing = true;
            eventQueue.processEventBatch = jest.fn();

            await eventQueue.processEvents();

            expect(eventQueue.processEventBatch).not.toHaveBeenCalled();
        });

        it('should process events and call processEventBatch', async () => {
            const events = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
            mockStorage.getEvents = jest.fn().mockReturnValue(events);
            eventQueue.processEventBatch = jest.fn().mockResolvedValue();

            await eventQueue.processEvents();

            expect(eventQueue.processEventBatch).toHaveBeenCalledWith(events);
            expect(eventQueue.isProcessing).toBe(false);
        });
    });

    describe('processEventBatch', () => {
        it('should return if events array is empty', async () => {
            await eventQueue.processEventBatch([]);
            expect(dispatcher.dispatch).not.toHaveBeenCalled();
        });

        it('should dispatch events using the dispatcher', async () => {
            const events = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
            eventQueue.maxRetries = 3;

            await eventQueue.processEventBatch(events);

            expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
            expect(dispatcher.dispatch).toHaveBeenCalledWith('https://example.com', events);
        });

        it('should retry dispatching events if there is an error', async () => {
            const events = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
            eventQueue.maxRetries = 3;

            dispatcher.dispatch = jest.fn().mockRejectedValue(new Error('Failed to send batch'));

            jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

            const promise = eventQueue.processEventBatch(events);
            jest.advanceTimersByTime(10000);
            try {
                await promise;
            } catch (e) {
                expect(e).toEqual(new Error(`Failed to send batch after 3 tries.`));
            }

            expect(dispatcher.dispatch).toHaveBeenCalledTimes(3);
            expect(dispatcher.dispatch).toHaveBeenCalledWith('https://example.com', events);
            expect(setTimeout).toHaveBeenCalledTimes(2);
        }, 10000);


    });
});
