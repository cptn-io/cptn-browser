# cptn-js (still in dev)
JS library for sending events from browser clients to cptn.io instance's ingestion API

This library is not intended to be used with NodeJS applications.

## Usage

### Embed into web pages

Add the following code snippet to web pages. Change the <Ingestion url> and <key> values to your Source end point values.
    
```js
<script>
    (function () {
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/cptn-js/dist/browser.js';
        script.onload = function () {
            window.cptn = new Cptn({ url: '<Ingestion url>', key: '<key>' });
        };
        document.head.appendChild(script);
    })();
</script>
```   

### Use as a NPM module:
    
```
npm install cptn-js    
```
    
```js
import Cptn from 'cptn-js';

const cptn = new Cptn({url:"<Ingestion url>", key:"<key>"});
cptn.sendEvent({
    "type":"click",
    "element": "add_to_cart"
});

```

```js
const Cptn = require('cptn-js');

const cptn = new Cptn({url:"<Ingestion url>", key:"<key>"});
cptn.sendEvent({
    "type":"click",
    "element": "add_to_cart"
});

```
