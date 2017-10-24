import React, { Component } from 'react';
import events from 'girder/events';

import TreeView from '../TreeView';
import TrackAttribute from '../TrackAttribute';
import annotationActivityParser from '../util/annotationActivityParser';
import annotationTrackParser from '../util/annotationTrackParser';
import { restRequest } from 'girder/rest';
import Viewer from '../Viewer';

import './style.styl';

class IndexView extends Component {
    constructor(props) {
        super(props);
        this.toggleActivity = this.toggleActivity.bind(this);
        this.toggleTrack = this.toggleTrack.bind(this);
        this.state = {
            annotationActivityContainer: null,
            annotationTrackContainer: null
        }
    }
    componentDidMount() {
        events.on('v:item_selected', (itemModel) => {
            downloadItemByName(itemModel.get('folderId'), 'activities.yml')
                .then((raw) => {
                    var annotationActivityContainer = annotationActivityParser(raw);
                    this.setState({ annotationActivityContainer });
                });
            downloadItemByName(itemModel.get('folderId'), 'types.yml')
                .then((raw) => {
                    var annotationTrackContainer = annotationTrackParser(raw);
                    this.setState({ annotationTrackContainer });
                })
        });
    }

    toggleActivity(activity, enabled) {
        var annotationActivityContainer = this.state.annotationActivityContainer;
        var annotationActivityContainer = annotationActivityContainer.toggleState(activity.id2, enabled);
        this.setState({ annotationActivityContainer });
    }

    toggleTrack(track, enabled) {
        var annotationTrackContainer = this.state.annotationTrackContainer;
        var annotationTrackContainer = annotationTrackContainer.toggleState(track.id1, enabled);
        this.setState({ annotationTrackContainer });
    }

    render() {
        return <div className='v-index clearbox'>
            <TreeView className='left-sidebar'
                annotationActivityContainer={this.state.annotationActivityContainer}
                toggleActivity={this.toggleActivity}
                annotationTrackContainer={this.state.annotationTrackContainer}
                toggleTrack={this.toggleTrack}
            />
            <Viewer className='main'
                annotationActivityContainer={this.state.annotationActivityContainer}
                annotationTrackContainer={this.state.annotationTrackContainer}
            />
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
