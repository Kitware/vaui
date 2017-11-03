import React, { PureComponent } from 'react';
import events from 'girder/events';

import TreeView from '../TreeView';
import Viewer from '../Viewer';
import InfoView from '../InfoView';
import annotationGeometryParser from '../util/annotationGeometryParser';
import annotationActivityParser from '../util/annotationActivityParser';
import annotationTypeParser, { AnnotationTypeContainer } from '../util/annotationTypeParser';
import { restRequest } from 'girder/rest';

import './style.styl';

class IndexView extends PureComponent {
    constructor(props) {
        super(props);
        this.toggleActivity = this.toggleActivity.bind(this);
        this.toggleTrack = this.toggleTrack.bind(this);
        this.onAnnotationsSelect = this.onAnnotationsSelect.bind(this);
        this.state = {
            isLoadingAnnotation: false,
            itemModel: null,
            annotationActivityContainer: null,
            annotationTypeContainer: null,
            annotationGeometryContainer: null
        }
    }
    componentDidMount() {
        // the states would be lifted to redux store
        events.on('v:item_selected', (itemModel) => {
            this.setState({
                itemModel,
                annotationActivityContainer: null,
                annotationTypeContainer: null,
                annotationGeometryContainer: null,
                isLoadingAnnotation: true
            });
            restRequest({
                url: `/folder/${itemModel.get('folderId')}`
            }).then((folder) => {
                Promise.all([
                    downloadItemByName(itemModel.get('folderId'), `${folder.name}.activities.yml`)
                        .then((raw) => {
                            var annotationActivityContainer = annotationActivityParser(raw);
                            this.setState({ annotationActivityContainer });
                        })
                        .catch(() => { }),
                    downloadItemByName(itemModel.get('folderId'), `${folder.name}.types.yml`)
                        .then((raw) => {
                            return annotationTypeParser(raw);
                        })
                        .catch(() => {
                            return new AnnotationTypeContainer();
                        })
                        .then((annotationTypeContainer) => this.setState({ annotationTypeContainer })),
                    downloadItemByName(itemModel.get('folderId'), `${folder.name}.geom.yml`)
                        .then((raw) => {
                            var { annotationGeometryContainer, annotationTrackContainer } = annotationGeometryParser(raw);
                            this.setState({ annotationGeometryContainer, annotationTrackContainer });
                        }).catch(() => {
                            events.trigger('g:alert', {
                                icon: 'ok',
                                text: 'Annotation files were not found',
                                type: 'danger',
                                timeout: 4000
                            });
                        })
                ]).then(() => {
                    this.setState({ isLoadingAnnotation: false });
                });
            });
        });
    }

    toggleActivity(activity, enabled) {
        var annotationActivityContainer = this.state.annotationActivityContainer;
        var annotationActivityContainer = annotationActivityContainer.toggleState(activity.id2, enabled);
        this.setState({ annotationActivityContainer });
    }

    toggleTrack(trackId, enabled) {
        var annotationTrackContainer = this.state.annotationTrackContainer;
        var annotationTrackContainer = annotationTrackContainer.toggleState(trackId, enabled);
        this.setState({ annotationTrackContainer });
    }

    onAnnotationsSelect(annotations) {
        this.setState({ selectedAnnotations: annotations })
    }

    render() {
        return <div className='v-index clearbox'>
            <TreeView className='left-sidebar'
                annotationTrackContainer={this.state.annotationTrackContainer}
                annotationActivityContainer={this.state.annotationActivityContainer}
                toggleActivity={this.toggleActivity}
                annotationTypeContainer={this.state.annotationTypeContainer}
                toggleTrack={this.toggleTrack}
            />
            <Viewer className='main'
                itemModel={this.state.itemModel}
                annotationGeometryContainer={this.state.annotationGeometryContainer}
                annotationActivityContainer={this.state.annotationActivityContainer}
                annotationTrackContainer={this.state.annotationTrackContainer}
                annotationTypeContainer={this.state.annotationTypeContainer}
                isLoadingAnnotation={this.state.isLoadingAnnotation}
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
