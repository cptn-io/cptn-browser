class Dispatcher {
    async dispatch(sourceUrl, data) {
        if (process.browser) {
            return this.dispatchForBrowser(sourceUrl, data);
        } else {
            return this.dispatchForNode(sourceUrl, data);
        }
    }

    async dispatchForNode(sourceUrl, data) {
        return new Promise(async (resolve, reject) => {
            const url = await import('url');
            const http = await import('http');
            const https = await import('https');
            const parsedUrl = url.parse(sourceUrl);
            const requestModule = parsedUrl.protocol === 'https:' ? https : http;
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            var postData = JSON.stringify(data);


            const req = requestModule.request(options, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                } else {
                    reject(new Error(`Request failed with status code ${res.statusCode}`));
                }
            });

            req.on('error', (error) => {
                console.error('An error occurred:', error);
            });
            req.write(postData);

            req.end();
        });
    }

    async dispatchForBrowser(sourceUrl, data) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            //not supporting sendbeacon as xdomain calls would require Access-Control-Allow-Credentails: true for sending json payloads
            if (XMLHttpRequest) {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', sourceUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.withCredentials = false;
                xhr.send(postData);

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error(`Request failed with status code ${xhr.status}`));
                        }
                    }
                };
                return;
            } else if (XDomainRequest) {
                //XDomainRequest for IE
                const xdr = new XDomainRequest();
                xdr.open('POST', sourceUrl);
                xdr.onerror = function () {
                    reject(new Error('error sending xdr'));
                };
                xdr.send(postData);
                return;
            }
            reject(new Error('xhr not available'));
        });
    }
}

export default Dispatcher;