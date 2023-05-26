import Cptn from "./index.js";

const cptn = new Cptn({ url: 'http://localhost:8081/event/source/0803332e-6eda-4e2c-965d-b14d2049e063' });

let i = 0;
while (true) {
    console.log("sending event " + i);
    cptn.sendEvent({ name: 'test', value: 'test' });
    i++;
    await new Promise(resolve => setTimeout(resolve, 100));
}