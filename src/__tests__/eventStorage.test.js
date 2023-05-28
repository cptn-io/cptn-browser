import EventStorage from '../eventStorage';

describe('EventStorage', () => {
    let eventStorage;

    beforeEach(() => {
        eventStorage = new EventStorage();
    });

    test('should add events to the storage', async () => {
        const event = { name: 'Event 1' };
        await eventStorage.addEvent(event);

        expect(eventStorage.storage).toContain(event);
        expect(eventStorage.storage.length).toBe(1);
    });

    test('should discard events when storage is full', async () => {
        const fullStorage = Array.from({ length: 100 }, (_, index) => ({ name: `Event ${index + 1}` }));
        eventStorage.storage = fullStorage;

        const warn = jest.spyOn(console, "warn").mockImplementation(() => { });

        const event = { name: 'Overflow Event' };
        await eventStorage.addEvent(event);

        expect(eventStorage.storage).not.toContain(event);
        expect(warn).toHaveBeenCalledWith('CptnJS: Event storage is full. Discarding event.');
    });

    test('should retrieve events from the storage', () => {
        const events = [
            { name: 'Event 1' },
            { name: 'Event 2' },
            { name: 'Event 3' },
        ];
        eventStorage.storage = events;

        const retrievedEvents = eventStorage.getEvents(2);

        expect(retrievedEvents).toEqual([{ name: 'Event 1' }, { name: 'Event 2' }]);
        expect(eventStorage.storage.length).toBe(1);
    });
});
