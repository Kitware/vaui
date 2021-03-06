import _ from 'underscore';
import { Component } from 'react';

import './style.styl';

class BasePane extends Component {
    getContainer() {
        throw new Error('not implemented');
    }

    getItemId(item) {
        throw new Error('not implemented');
    }

    toggleItem(item, enabled) {
        throw new Error('not implemented');
    }

    checkAll() {
        var container = this.getContainer();
        var items = container.getAllItems();
        items
            .filter((item) => container.getEnableState(this.getItemId(item)) === false)
            .forEach((item) => {
                this.toggleItem(item, true);
            });
    }

    uncheckAll() {
        var container = this.getContainer();
        var items = container.getAllItems();
        items
            .filter((item) => container.getEnableState(this.getItemId(item)) === true)
            .forEach((item) => {
                this.toggleItem(item, false);
            });
    }
}
export default BasePane;
