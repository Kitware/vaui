import React, { PureComponent } from 'react';
import { connect } from 'react-redux'
import events from 'girder/events';
import { restRequest } from 'girder/rest';

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
};

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
