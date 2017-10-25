import React, { Component } from 'react';
import events from 'girder/events';

import TreeView from '../TreeView';
import TrackAttribute from '../TrackAttribute';
import annotationGeometryParser from '../util/annotationGeometryParser';
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
            annotationTrackContainer: null,
            annotationGeometryContainer: null
        }
    }
    componentDidMount() {
        // the states would be lift to redux store
        events.on('v:item_selected', (itemModel) => {
            this.setState({ itemModel });
            downloadItemByName(itemModel.get('folderId'), 'activities.yml')
                .then((raw) => {
                    var annotationActivityContainer = annotationActivityParser(raw);
                    this.setState({ annotationActivityContainer });
                });
            downloadItemByName(itemModel.get('folderId'), 'types.yml')
                .then((raw) => {
                    var annotationTrackContainer = annotationTrackParser(raw);
                    this.setState({ annotationTrackContainer });
                });
            downloadItemByName(itemModel.get('folderId'), 'geom.yml')
                .then((raw) => {
                    var annotationGeometryContainer = annotationGeometryParser(raw);
                    this.setState({ annotationGeometryContainer });
                }).catch(() => {
                    this.setState({ annotationGeometryContainer: false })
                    events.trigger('g:alert', {
                        icon: 'ok',
                        text: 'Didn\'t find annotation files',
                        type: 'danger',
                        timeout: 4000
                    });
                });
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
                itemModel={this.state.itemModel}
                annotationGeometryContainer={this.state.annotationGeometryContainer}
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
