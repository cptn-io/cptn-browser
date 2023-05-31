# cptn-js (still in dev)
JS library for sending events to cptn.io instance's ingestion API

## Installation

### NodeJS 18.x+

```
npm install cptn-js

```

### Browser

Add the following script to head section of your web page.

```
<script src="https://unpkg.com/cptn-js/dist/browser.js" />
```

## Usage

```
const cptn = new Cptn({url:"<Ingestion url>", key:"<key>"});
cptn.sendEvent({
    "type":"click",
    "element": "add_to_cart"
});

```