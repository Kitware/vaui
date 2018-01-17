import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import bootbox from 'bootbox';

import { CHANGE_TRACK } from '../actions/types';
import trackTypes from '../trackTypes';

import './style.styl';

class TrackInfo extends PureComponent {
    constructor(props) {
        super(props);
        this.state = this._getInitialState(props);
    }

    _getInitialState(props) {
        return {
            id: props.selectedTrackId,
            type: props.annotationTypeContainer.getItem(props.selectedTrackId).obj_type || '',
            changed: false
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this._getInitialState(nextProps));
    }

    render() {
        var range = this.props.annotationGeometryContainer.getTrackFrameRange(this.props.selectedTrackId);

        return <div className='trackinfo-widget'>
            <form className='form-horizontal'>
                <fieldset>
                    <legend>Track</legend>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label' htmlFor='trackId'>Id:</label>
                        <div className='col-sm-9'>
                            <input type='number' className='form-control' id='trackId' value={this.state.id}
                                onBlur={(e) => {
                                    var newTrackId = this.state.id;
                                    if (newTrackId === this.props.selectedTrackId) {
                                        return;
                                    }
                                    if (!this.props.annotationGeometryContainer.validateNewTrackId(newTrackId)) {
                                        bootbox.alert({
                                            size: 'small',
                                            message: 'A track with this id already exists'
                                        });
                                        this.setState({
                                            id: this.props.selectedTrackId
                                        })
                                    } else {
                                        this.setState({
                                            changed: true
                                        });
                                    }
                                }}
                                onChange={(e) => {
                                    this.setState({
                                        id: parseInt(e.target.value)
                                    });
                                }} />
                        </div>
                    </div>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>Type:</label>
                        <div className='col-sm-9'>
                            <select className='form-control' value={this.state.type} onChange={(e) => {
                                this.setState({
                                    type: e.target.value,
                                    changed: true
                                });
                            }} >
                                <option value=''></option>
                                {_.sortBy(trackTypes).map((type) => {
                                    return <option key={type} value={type}>{type}</option>
                                })}
                            </select>
                        </div>
                    </div>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>Start:</label>
                        <div className='col-sm-9'>
                            <p className='form-control-static'>{range[0]} (frame)</p>
                        </div>
                    </div>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>End:</label>
                        <div className='col-sm-9'>
                            <p className='form-control-static'>{range[1]} (frame)</p>
                        </div>
                    </div>
                </fieldset>
            </form>
            {this.state.changed &&
                <div className='row'>
                    <div className='col-sm-offset-8 col-sm-4'>
                        <div className='btn-group btn-group-sm' role='group' aria-label='...'>
                            <button type='button' className='btn btn-default' onClick={(e) => {
                                this.setState(this._getInitialState(this.props));
                            }}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                            <button type='button' className='btn btn-default' onClick={(e) => {
                                this.props.dispatch({
                                    type: CHANGE_TRACK,
                                    payload: {
                                        trackId: this.props.selectedTrackId,
                                        newTrackId: this.state.id,
                                        newTrackType: this.state.type ? this.state.type : null
                                    }
                                });
                            }}><span className='glyphicon glyphicon-ok text-success'></span></button>
                        </div>
                    </div>
                </div>}
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedTrackId: state.selectedTrackId,
        annotationTypeContainer: state.annotationTypeContainer,
        annotationGeometryContainer: state.annotationGeometryContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackInfo);
