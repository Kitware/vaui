import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import './style.styl';

class InfoView extends PureComponent {
    render() {
        var annotation = this.props.annotation;
        return <div className={['v-infoview', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>Info</div>
                <div className='panel-body'>
                    <ul className='detection'>
                        {annotation &&
                            <li key={annotation.detection.id0 + '-' + annotation.detection.id1} className='track'>
                                <div title='id1'>Track id: {annotation.detection.id1}</div>
                                {annotation.type &&
                                    <div>type: {Object.keys(annotation.type.cset3).join(',')}</div>
                                }
                                <div title='id0'>Detection id: {annotation.detection.id0}</div>
                                <div>Frame id: {annotation.detection.ts0}</div>
                                {Object.entries(annotation.detection.keyValues).map(([key, value], index) => {
                                    return <div key={index}>{key}: {value}</div>;
                                })}
                                {annotation.activities && annotation.activities.length !== 0 &&
                                    <ul className='activity'>
                                        {annotation.activities.map((activity) => {
                                            return <li key={activity.id2} className='activity'>
                                                <div title='id2'>Activity id: {activity.id2}</div>
                                                <div>Activity: {Object.keys(activity.act2).join(',')}</div>
                                            </li>;
                                        })}
                                    </ul>}
                            </li>
                        }
                    </ul>
                    <div className='clear-message'>(Click an annotation to view details. Click on an empty space to clear.)</div>
                </div>
            </div>
        </div>;
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        annotation: state.selectedAnnotation
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(InfoView);
