import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs, Tab, Nav, NavItem } from 'react-bootstrap';

import { TREE_PANEL_SELECT } from '../actions/types';
import ActivityPane from './ActivityPane';
import TrackPane from './TrackPane';

import './style.styl';

class TreeView extends Component {
    render() {
        return <div className={['v-treeview', this.props.className].join(' ')}>
            <Tab.Container id='tabs-with-dropdown' defaultActiveKey='track'
                onSelect={(key) => {
                    this.props.dispatch({
                        type: TREE_PANEL_SELECT,
                        payload: key
                    })
                }}>
                <div className='panel panel-default'>
                    <div className='panel-heading'>
                        <Nav bsStyle='tabs'>
                            <NavItem eventKey='track'>Tracks</NavItem>
                            <NavItem eventKey='activity'>Activities</NavItem>
                        </Nav>
                    </div>
                    <div className='panel-body'>
                        <Tab.Content animation={false}>
                            <Tab.Pane eventKey='track'>
                                <TrackPane />
                            </Tab.Pane>
                            <Tab.Pane eventKey='activity'>
                                <ActivityPane />
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </div>
            </Tab.Container>
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
