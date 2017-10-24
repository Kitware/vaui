import React, { Component } from 'react';
import events from 'girder/events';

import TreeView from '../TreeView';
import TrackAttribute from '../TrackAttribute';
import annotationActivityParser from '../util/annotationActivityParser';
import { restRequest } from 'girder/rest';
import Viewer from '../Viewer';

import './style.styl';

class IndexView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            annotationActivityContainer: null
        }
    }
    componentDidMount() {
        events.on('v:item_selected', (itemModel) => {
            downloadItemByName(itemModel.get('folderId'), 'activities.yml')
                .then((raw) => {
                    var annotationActivityContainer = annotationActivityParser(raw);
                    this.setState({ annotationActivityContainer });
                });
            // downloadItemByName(itemModel.get('folderId'), 'types.yml')
            //     .then((raw) => {

            //     })
        });
    }
    render() {
        return <div className='v-index clearbox'>
            <TreeView className='left-sidebar' />
            <Viewer className='main' annotationActivityContainer={this.state.annotationActivityContainer} />
            <TrackAttribute className='right-sidebar' />
        </div>
    }
}

var downloadItemByName = (folderId, name) => {
    return restRequest({
        url: '/item',
        data: {
            folderId: folderId,
            name: name
        }
    }).then((items) => {
        return restRequest({
            url: `/item/${items[0]._id}/download`,
            dataType: 'text'
        });
    });
}

export default IndexView;
