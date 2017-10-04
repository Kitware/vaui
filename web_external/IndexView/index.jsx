import React, { Component } from 'react';
import TreeView from '../TreeView';
import TrackAttribute from '../TrackAttribute';
import Viewer from '../Viewer';

import './style.styl';

class IndexView extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className='v-index clearbox'>
            <TreeView className='left-sidebar' />
            <Viewer className='main' />
            <TrackAttribute className='right-sidebar' />
        </div>
    }
}

export default IndexView;
