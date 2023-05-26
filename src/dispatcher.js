import axios from "axios";

class Dispatcher {
    static async dispatch(url, data) {
        await axios.post(url, data).catch((error) => {
            console.error("Error sending event to Cptn", error);
        })

    }
}

export default Dispatcher;