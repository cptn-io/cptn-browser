![GitHub](https://img.shields.io/github/license/cptn-io/cptn-js)

# cptn-js
JS library for sending tracking events from browser clients to cptn.io instance's Source end point.

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
Use as ES module 

```js
import Cptn from 'cptn-js';

const cptn = new Cptn({url:"<Ingestion url>", key:"<key>"});
cptn.capture({
    "type": "click",
    "element": "add_to_cart"
});

//key is optional if the source url is unsecured

```

Use as CommonJS module

```js
const Cptn = require('cptn-js');

const cptn = new Cptn({url:"<Ingestion url>", key:"<key>"});
cptn.capture({
    "type": "click",
    "element": "add_to_cart"
});

//key is optional if the source url is unsecured

```

## Supported methods:

### capture

Send custom captured events 

```js
cptn.capture(type, properties);

//Following payload will be sent along with common attributes
{
    type,
    properties
}

```

### page

Track page load events

```js
cptn.page(category, name, properties);

//Following payload will be sent along with common attributes
{
    type:"page",
    category,
    name,
    properties
}

```

### screen

Track screen view events

```js
cptn.screen(name, properties);

//Following payload will be sent along with common attributes
{
    type:"screen",
    name,
    properties
}

```

### identify

Send identify event and associate userId for all subsequent events

```js
cptn.identify(userId, properties);

//Following payload will be sent along with common attributes. UserId will be part of common attributes
{
    type:"identify",    
    properties
}

```

Note: userId value will also be persisted to cookies and will be automatically associated for subsequent events until clearIdentity is invoked.

### group

Send group event and associate groupId for all subsequent events

```js
cptn.group(groupId, properties);

//Following payload will be sent along with common attributes. UserId will be part of common attributes
{
    type:"group", 
    groupId,
    properties
}

```

### track

Send track event with custom details

```js
cptn.track(event, properties);

//Following payload will be sent along with common attributes.
{
    type:"track", 
    event,
    properties
}

```
### clearIdentity

clears the currently set userId, groupId and removes userId cookie

```js
cptn.clearIdentity()
```

## AnonymousId
All events sent will have an anonymousId value. This value is generated if not present and will be persisted to cookies. All subsequent events will use the same anonymousId until the cookies are cleared.

## Common Attributes:
Following are the common attributes part of the events captured:

```js
    {
        ...event,
        anonymousId,
        timestamp: new Date().toISOString(),
        userId,
        context: {
            userAgent: window?.navigator?.userAgent,
            page: {
                url: window?.location?.href,
                referrer: window?.document?.referrer,
                title: window?.document?.title,
                path: window?.location?.pathname,
                search: window?.location?.search,
                hash: window?.location?.hash,
            },
            screen: {
                width: window?.screen?.width,
                height: window?.screen?.height,
            },
            locale: window?.navigator?.language,
            timezone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone,
            tzOffset: new Date().getTimezoneOffset(),
            groupId
        }
    }
```

## IP tracking

cptn.io supports capturing user ip address starting with Cupertino release (coming up soon). When enabled, the inbound event will be enriched with the remote IP address as below.

```js
{
    ...event,
    cptn {
        remote_ip
    }
}
```

## User privacy and GDPR compliance

This library uses cookies to persist anonymousId and passed userId information. Obtaining consent from the user is not in scope for this project and it must be determined by your application.

You application must make the determination to ask for user consent and then instantiate or load the library into your web page after user consent. 