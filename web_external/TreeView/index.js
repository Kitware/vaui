import React, { Component } from 'react';

import ActivityPane from './ActivityPane';
import TrackPane from './TrackPane';

import './style.styl';

class TreeView extends Component {
    render() {
        return <div className={['v-treeview', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    <ul className='nav nav-tabs'>
                        <li className='active'>
                            <a data-toggle='tab' href='#activities'>Activities</a>
                        </li>
                        <li>
                            <a data-toggle='tab' href='#tracks'>Tracks</a>
                        </li>
                        {/* <li>
                            <a data-toggle='tab' href='#scene-elements'>Scene Elements</a>
                        </li> */}
                    </ul>
                </div>
                <div className='panel-body'>
                    <div className='tab-content'>
                        <div id='activities' className='tab-pane active'>
                            <ActivityPane
                                annotationActivityContainer={this.props.annotationActivityContainer
                                }
                                toggleActivity={this.props.toggleActivity}
                                annotationTypeContainer={this.props.annotationTypeContainer}
                            />
                        </div>
                        <div id='tracks' className='tab-pane'>
                            <TrackPane
                                annotationTrackContainer={this.props.annotationTrackContainer
                                }
                                annotationTypeContainer={this.props.annotationTypeContainer
                                }
                                toggleTrack={this.props.toggleTrack}
                            />
                        </div>
                        <div id='scene-elements' className='tab-pane'>4</div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default TreeView;
