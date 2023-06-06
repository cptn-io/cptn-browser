import Dispatcher from '../dispatcher';

describe('Dispatcher', () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = new Dispatcher();
        global.XMLHttpRequest = undefined;
        global.XDomainRequest = undefined;
    });

    describe('dispatch', () => {
        it('should send a POST request using XMLHttpRequest and resolve the promise if the request is successful', async () => {
            const sourceUrl = 'https://example.com';
            const data = { foo: 'bar' };

            const mockXhr = {
                open: jest.fn(),
                send: jest.fn(),
                setRequestHeader: jest.fn(),
                withCredentials: false,
                onreadystatechange: jest.fn(),
                readyState: 4,
                status: 200,
            };

            global.XMLHttpRequest = jest.fn(() => mockXhr);

            const promise = dispatcher.dispatch(sourceUrl, data);
            mockXhr.onreadystatechange();
            await expect(promise).resolves.toBeUndefined();
            expect(global.XMLHttpRequest).toHaveBeenCalledTimes(1);
        });

        it('should reject the promise if the XMLHttpRequest request fails 1', async () => {
            const sourceUrl = 'https://example.com';
            const data = { foo: 'bar' };

            const mockXhr = {
                open: jest.fn(),
                send: jest.fn(),
                setRequestHeader: jest.fn(),
                withCredentials: false,
                onerror: jest.fn(),
            };

            global.XMLHttpRequest = jest.fn(() => mockXhr);

            const promise = dispatcher.dispatch(sourceUrl, data);
            mockXhr.onerror();
            await expect(promise).rejects.toThrowError('Error sending XMLHttpRequest');
            expect(global.XMLHttpRequest).toHaveBeenCalledTimes(1);
        });

        it('should handle readystate !=4', async () => {
            const sourceUrl = 'https://example.com';
            const data = { foo: 'bar' };

            const mockXhr = {
                open: jest.fn(),
                send: jest.fn(),
                setRequestHeader: jest.fn(),
                withCredentials: false,
                onreadystatechange: jest.fn(),
                readyState: 3,
                status: 200,
            };

            global.XMLHttpRequest = jest.fn(() => mockXhr);

            const promise = dispatcher.dispatch(sourceUrl, data);

            let resolved = false;
            promise.then(() => {
                resolved = true;
            });

            mockXhr.readyState = 3;
            mockXhr.onreadystatechange();
            expect(resolved).toBe(false);

            mockXhr.readyState = 4;
            mockXhr.onreadystatechange();
            await expect(promise).resolves.toBeUndefined();
            expect(resolved).toBe(true);
            expect(global.XMLHttpRequest).toHaveBeenCalledTimes(1);
        });


        it('should reject the promise if the XMLHttpRequest request fails', async () => {
            const sourceUrl = 'https://example.com';
            const data = { foo: 'bar' };

            const mockXhr = {
                open: jest.fn(),
                send: jest.fn(),
                setRequestHeader: jest.fn(),
                withCredentials: false,
                onreadystatechange: jest.fn(),
                readyState: 4,
                status: 400,
            };

            global.XMLHttpRequest = jest.fn(() => mockXhr);

            const promise = dispatcher.dispatch(sourceUrl, data);
            mockXhr.onreadystatechange();
            await expect(promise).rejects.toThrowError('Request failed with status code 400');
            expect(global.XMLHttpRequest).toHaveBeenCalledTimes(1);
        });

        it('should send a POST request using XDomainRequest and resolve the promise if the request is successful', async () => {
            const sourceUrl = 'https://example.com';
            const data = { foo: 'bar' };

            const mockXdr = {
                open: jest.fn(),
                send: jest.fn(),
                onload: jest.fn(),
                onerror: jest.fn(),
            };

            // Mock XDomainRequest
            global.XDomainRequest = jest.fn(() => mockXdr);

            const promise = dispatcher.dispatch(sourceUrl, data);
            mockXdr.onload();
            await expect(promise).resolves.toBeUndefined();
            expect(global.XDomainRequest).toHaveBeenCalledTimes(1);
        });

        it('should reject the promise if the XDomainRequest request fails', async () => {
            const sourceUrl = 'https://example.com';
            const data = { foo: 'bar' };

            const mockXdr = {
                open: jest.fn(),
                send: jest.fn(),
                onload: jest.fn(),
                onerror: jest.fn(),
            };

            // Mock XDomainRequest
            global.XDomainRequest = jest.fn(() => mockXdr);

            const promise = dispatcher.dispatch(sourceUrl, data);
            mockXdr.onerror();

            await expect(promise).rejects.toThrowError("Error sending XDomainRequest");
            expect(global.XDomainRequest).toHaveBeenCalledTimes(1);
        });

        it('should reject the promise if XMLHttpRequest and XDomainRequest are not available', async () => {
            const sourceUrl = 'https://example.com';
            const data = { foo: 'bar' };

            await expect(dispatcher.dispatch(sourceUrl, data)).rejects.toThrowError('xhr not available');
        });
    });
});
