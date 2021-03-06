import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import bootbox from 'bootbox';

import { CHANGE_TRACK } from '../actions/types';
import trackTypes from '../trackTypes';

import './style.styl';

class TrackWidget extends PureComponent {
    constructor(props) {
        super(props);
        this.state = this._getInitialState(props);
    }

    _getInitialState(props) {
        return {
            id: props.selectedTrackId,
            cset3: props.annotationTypeContainer.getItem(props.selectedTrackId).cset3,
            changed: false
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this._getInitialState(nextProps));
    }

    render() {
        var range = this.props.annotationDetectionContainer.getTrackFrameRange(this.props.selectedTrackId);
        var types = Object.keys(this.state.cset3);
        var type = types.length === 0 ? '' : (types.length === 1 ? types[0] : 'multiple');

        return <div className={['v-track-widget', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>Track</div>
                <div className='panel-body'>
                    <form className='form-horizontal'>
                        <fieldset>
                            <legend>Track</legend>
                        </fieldset>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label' htmlFor='trackId'>Id:</label>
                            <div className='col-sm-9'>
                                <input type='number' className='form-control' id='trackId' value={this.state.id}
                                    onBlur={(e) => {
                                        var newTrackId = this.state.id;
                                        if (newTrackId === this.props.selectedTrackId) {
                                            return;
                                        }
                                        if (!this.props.annotationDetectionContainer.validateNewTrackId(newTrackId)) {
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
                                <select className='form-control' value={type} onChange={(e) => {
                                    this.setState({
                                        cset3: e.target.value ? { [e.target.value]: 1.0 } : null,
                                        changed: true
                                    });
                                }} >
                                    <option value='' disabled></option>
                                    <option value='multiple' disabled>Multiple</option>
                                    {_.sortBy(trackTypes).map((type) => {
                                        return <option key={type} value={type}>{type}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>Start:</label>
                            <div className='col-sm-9'>
                                <p className='form-control-static'>{this.props.annotationDetectionContainer.isTrackEmpty(this.props.selectedTrackId) ? 'N/A' : `${range[0]} (frame)`}</p>
                            </div>
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>End:</label>
                            <div className='col-sm-9'>
                                <p className='form-control-static'>{this.props.annotationDetectionContainer.isTrackEmpty(this.props.selectedTrackId) ? 'N/A' : `${range[1]} (frame)`}</p>
                            </div>
                        </div>
                        {this.state.changed &&
                            <div className='row bottom-row'>
                                <div className='col-xs-11'>
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
                                                    newCset3: this.state.cset3
                                                }
                                            });
                                        }}><span className='glyphicon glyphicon-ok text-success'></span></button>
                                    </div>
                                </div>
                            </div>}
                    </form>
                </div>
            </div>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedTrackId: state.selectedTrackId,
        annotationTypeContainer: state.annotationTypeContainer,
        annotationDetectionContainer: state.annotationDetectionContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackWidget);
