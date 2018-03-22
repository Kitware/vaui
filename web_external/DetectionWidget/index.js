import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import bootbox from 'bootbox';

import { CHANGE_DETECTION_ATTRIBUTES } from '../actions/types';

import './style.styl';

class DetectionWidget extends PureComponent {
    constructor(props) {
        super(props);
        this.state = { editingDetectionId: null };
        this.state = this._getInitialState(this.state, props);
    }

    _getInitialState(state, props) {
        var detection = this.props.annotationDetectionContainer.getDetection(state.editingDetectionId || props.selectedDetectionId);
        return {
            editingDetectionId: state.editingDetectionId,
            id0: detection.id0,
            src: detection.src,
            occlusion: detection.occlusion,
            changed: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedDetectionId !== this.props.selectedDetectionId) {
            this.setState(this._getInitialState(this.state, nextProps));
        }
    }

    _dispatchDetection() {
        this.props.dispatch({
            type: CHANGE_DETECTION_ATTRIBUTES,
            payload: {
                id0: this.state.id0,
                attributes: {
                    src: this.state.src,
                    occlusion: this.state.occlusion
                }
            }
        });
        this.setState({ editingDetectionId: null });
    }

    render() {
        var canCommit = this.state.changed;
        return <div className={['v-detection-widget', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>{this.state.editing ? 'Edit Detection' : 'Detection'}</div>
                <div className='panel-body'>
                    <form className='form-horizontal'>
                        <fieldset>
                            <legend>Detection</legend>
                        </fieldset>
                        <div className='form-group form-group-xs'>
                            <label className='col-xs-3 control-label'>Id:</label>
                            <div className='col-xs-5'>
                                {this.state.id0}
                            </div>
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-xs-3 control-label'>Source:</label>
                            <div className='col-xs-6'>
                                {this.state.editingDetectionId === null && <p className='form-control-static'>
                                    {this.state.src}</p>}
                                {this.state.editingDetectionId !== null && <select className='form-control'
                                    value={this.state.src}
                                    onChange={(e) => {
                                        this.setState({
                                            src: e.target.value,
                                            changed: true
                                        });
                                    }} >
                                    <option value='' disabled></option>
                                    <option value='truth'>truth</option>
                                    <option value='computed'>computed</option>
                                    <option value='linear-interpolation'>linear-interpolation</option>
                                </select>}
                            </div>
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-xs-3 control-label'>Occlusion:</label>
                            <div className='col-xs-6'>
                                {this.state.editingDetectionId === null && <p className='form-control-static'>
                                    {this.state.occlusion}</p>}
                                {this.state.editingDetectionId !== null && <select className='form-control'
                                    value=
                                    {this.state.occlusion}
                                    onChange={(e) => {
                                        this.setState({
                                            occlusion: e.target.value,
                                            changed: true
                                        });
                                    }} >
                                    <option value=''></option>
                                    <option value='partially'>partially</option>
                                    <option value='medium'>medium</option>
                                    <option value='heavy'>heavy</option>
                                </select>}
                            </div>
                        </div>
                        <div className='bottom-row'>
                            <div className='row'>
                                <div className='col-xs-11'>
                                    {this.state.editingDetectionId === null &&
                                        <button type='button' className='btn btn-default btn-sm' onClick={(e) => {
                                            this.setState({ editingDetectionId: this.state.selectedDetectionId });
                                        }}><span className='glyphicon glyphicon-wrench'></span></button>}
                                    {this.state.editingDetectionId !== null &&
                                        <div className='btn-group btn-group-sm' role='group'>
                                            <button type='button' className='btn btn-default' onClick={(e) => {
                                                this.setState({ editingDetectionId: null }, () => {
                                                    this.setState(this._getInitialState(this.state, this.props));
                                                });
                                            }}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                                            <button type='button' className='btn btn-default' disabled={!canCommit} onClick={(e) => {
                                                this._dispatchDetection()
                                            }}><span className='glyphicon glyphicon-ok text-success'></span></button>
                                        </div>}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedDetectionId: state.selectedDetectionId,
        annotationDetectionContainer: state.annotationDetectionContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetectionWidget);
