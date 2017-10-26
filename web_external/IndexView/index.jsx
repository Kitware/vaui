import React, { PureComponent } from 'react';
import events from 'girder/events';

import TreeView from '../TreeView';
import Viewer from '../Viewer';
import InfoView from '../InfoView';
import annotationGeometryParser from '../util/annotationGeometryParser';
import annotationActivityParser from '../util/annotationActivityParser';
import annotationTrackParser from '../util/annotationTrackParser';
import { restRequest } from 'girder/rest';

import './style.styl';

class IndexView extends PureComponent {
    constructor(props) {
        super(props);
        this.toggleActivity = this.toggleActivity.bind(this);
        this.toggleTrack = this.toggleTrack.bind(this);
        this.onAnnotationsSelect = this.onAnnotationsSelect.bind(this);
        this.state = {
            annotationActivityContainer: null,
            annotationTrackContainer: null,
            annotationGeometryContainer: null
        }
    }
    componentDidMount() {
        // the states would be lifted to redux store
        events.on('v:item_selected', (itemModel) => {
            this.setState({
                itemModel,
                annotationActivityContainer: null,
                annotationTrackContainer: null,
                annotationGeometryContainer: null
            });
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
                        text: 'Annotation files were not found',
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

    onAnnotationsSelect(annotations) {
        this.setState({ selectedAnnotations: annotations })
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
                annotationsSelect={this.onAnnotationsSelect}
            />
            <InfoView className='right-sidebar'
                annotations={this.state.selectedAnnotations}
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
