import ApplicationAdapter from './application';
import classic from 'ember-classic-decorator';

@classic
export default class Email extends ApplicationAdapter {
    retry(model) {
        let url = `${this.buildURL('email', model.get('id'))}retry/`;

        return this.ajax(url, 'PUT', {data: {}}).then((data) => {
            this.store.pushPayload(data);
            return model;
        });
    }
}
