import Cptn from '../';

describe('Cptn test', () => {
    let cptn;

    beforeEach(() => {
        cptn = new Cptn({ url: 'http://localhost:8081/event/source/0803332e-6eda-4e2c-965d-b14d2049e063' });
    });

    test('should add events to the storage', async () => {
        let i = 0;
        while (true) {
            console.log("sending event " + i);
            await cptn.sendEvent({ name: 'test', value: 'test' });
            i++;
            await new Promise(resolve => setTimeout(resolve, 10000));
        }

    }, 60000);
});