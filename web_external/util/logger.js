
import { restRequest } from 'girder/rest';

class Logger {
    constructor() {
        this.context = {};
        this.disabled = false;
    }

    setContext(key, value) {
        this.context[key] = value;
    }

    setContexts(data) {
        Object.assign(this.context, data);
    }

    deleteContext(key) {
        delete this.context[key];
    }

    log(type, data) {
        if (this.disabled) {
            return Promise.resolve();
        }
        return restRequest({
            url: `/log/${this.context.hitId}/${type}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ ...this.context, ...data })
        });
    }

    disable(value) {
        this.disabled = !!value;
    }
}

export default new Logger();
