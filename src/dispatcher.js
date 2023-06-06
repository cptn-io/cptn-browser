class Dispatcher {
    async dispatch(sourceUrl, data) {
        const postData = JSON.stringify(data);

        try {
            if (typeof XMLHttpRequest !== 'undefined') {
                return this.sendHttpRequest(sourceUrl, postData);
            } else if (typeof XDomainRequest !== 'undefined') {
                return this.sendXDomainRequest(sourceUrl, postData);
            } else {
                throw new Error('xhr not available');
            }
        } catch (error) {
            throw new Error(`Error sending request: ${error.message}`);
        }
    }

    sendHttpRequest(url, data) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.withCredentials = false;

            xhr.onreadystatechange = () => {
                if (xhr.readyState !== 4) {
                    return;
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Request failed with status code ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Error sending XMLHttpRequest'));
            };

            xhr.send(data);
        });
    }

    sendXDomainRequest(url, data) {
        return new Promise((resolve, reject) => {
            const xdr = new XDomainRequest();
            xdr.open('POST', url);
            xdr.onload = () => {
                resolve();
            };
            xdr.onerror = () => {
                reject(new Error('Error sending XDomainRequest'));
            };
            xdr.send(data);
        });
    }
}

export default Dispatcher;
