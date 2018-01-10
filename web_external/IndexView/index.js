import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import TreeView from '../TreeView';
import Viewer from '../Viewer';
import InfoView from '../InfoView';

import './style.styl';

class IndexView extends PureComponent {
    render() {
        return <div className='v-index clearbox'>
            <TreeView className='left-sidebar' />
            <Viewer className='main' />
            <InfoView className='right-sidebar' />
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

export default connect(mapStateToProps, mapDispatchToProps)(IndexView);
