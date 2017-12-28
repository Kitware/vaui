import React, { Component } from 'react';
import { connect } from 'react-redux'

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
                            <ActivityPane />
                        </div>
                        <div id='tracks' className='tab-pane'>
                            <TrackPane />
                        </div>
                        <div id='scene-elements' className='tab-pane'>4</div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TreeView);
