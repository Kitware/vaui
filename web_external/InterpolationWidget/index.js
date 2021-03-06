import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import { INTERPOLATE_HIDE } from '../actions/types';
import { remove } from '../util/array';
import interpolate from '../actions/interpolate';
import './style.styl';

class InterpolationWidget extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            trackId: null,
            detections: [],
            sourceType: 'truth',
            processingState: null
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedTrackId && nextProps.selectedTrackId !== this.props.selectedTrackId) {
            this.setState({ trackId: nextProps.selectedTrackId, detections: [] });
        }
        if (nextProps.selectedAnnotation && nextProps.selectedAnnotation !== this.props.selectedAnnotation) {
            if (nextProps.selectedAnnotation.detection.id1 === this.state.trackId) {
                if (!this.state.detections.find((detection) => detection.id0 === nextProps.selectedAnnotation.detection.id0)) {
                    var detections = _.sortBy([...this.state.detections, nextProps.selectedAnnotation.detection], (detection) => detection.ts0);
                    this.setState({ detections });
                }
            } else {
                this.setState({
                    trackId: nextProps.selectedAnnotation.detection.id1,
                    detections: [nextProps.selectedAnnotation.detection]
                });
            }
        }
    }

    render() {
        var canExecute = this.state.trackId !== null;
        return <div className={['v-interpolation-widget', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>Interpolation</div>
                <div className='panel-body'>
                    <label>Track</label>
                    {this.state.trackId === null &&
                        <div className='row'>
                            <div className='col-sm-11 col-sm-offset-1'>(Please select a Track)</div>
                        </div>}
                    {this.state.trackId !== null && <div>
                        <div className='row'>
                            <div className='col-sm-11 col-sm-offset-1'>
                                <div title='id1'>Track id: {this.state.trackId}</div>
                                <div>type: {this.props.annotationTypeContainer.getTrackDisplayLabel(this.state.trackId)}</div>
                            </div>
                        </div>
                        <label className='detections-label'>Detections</label>
                        {this.state.detections.length <= 1 &&
                            <div className='row'>
                                <div className='col-sm-6 col-sm-offset-1 no-padding'>All detections of source</div>
                                <div className='col-sm-3 no-padding'>
                                    <div className='form-group-xs'>
                                        <select className='form-control'
                                            value={this.state.sourceType}
                                            onChange={(e) => {
                                                this.setState({
                                                    sourceType: e.target.value
                                                });
                                            }} >
                                            <option value='truth'>truth</option>
                                            <option value=''>any</option>
                                        </select>
                                    </div>
                                </div>
                            </div>}
                        {this.state.detections.length > 1 &&
                            [<div key='1' className='row detections font-sm bold'>
                                <div className='col-sm-2 col-sm-offset-1 no-padding-right'>Frame</div>
                                <div className='col-sm-3'>ID</div>
                            </div>,
                            <div key='2' className='detections-container'>
                                {this.state.detections.map((detection) => {
                                    return <div key={detection.id0} className='row detection'>
                                        <div className='col-sm-2 col-sm-offset-1 no-padding-right'>{detection.ts0}</div>
                                        <div className='col-sm-3 no-padding-right'>{detection.id0}</div>
                                        <div className='col-sm-1 no-padding'>
                                            <button type='button' className='btn btn-link btn-xs' onClick={(e) => {
                                                this.setState({ detections: remove(this.state.detections, detection) });
                                            }}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                                        </div>
                                    </div>
                                })}
                            </div>]
                        }
                    </div>}
                    <div className='bottom-row'>
                        <div className='row'>
                            <div className='col-xs-11'>
                                <div className='btn-group btn-group-sm' role='group'>
                                    <button type='button' className='btn btn-default' title='Run' disabled={!canExecute || this.state.processingState} onClick={(e) => {
                                        var trackId = this.state.trackId;
                                        var detections = [];
                                        if (this.state.detections.length > 1) {
                                            detections = this.state.detections;
                                        } else {
                                            (this.props.annotationDetectionContainer.getByTrackId(trackId), (detection) => detection.ts0);
                                            detections = this.props.annotationDetectionContainer.getByTrackId(trackId);
                                            if (this.state.sourceType) {
                                                detections = detections.filter((detection) => detection.src === this.state.sourceType);
                                            }
                                            detections = _.sortBy(detections, (detection) => detection.ts0);
                                        }
                                        this.setState({ processingState: 'processing' });
                                        this.props.dispatch(interpolate(trackId, detections)).then(() => {
                                            this.setState({ processingState: 'finished' });
                                            setTimeout(() => {
                                                this.setState({ processingState: null });
                                            }, 2000);
                                        });
                                    }}>{(() => {
                                        if (!this.state.processingState) {
                                            return <span className='glyphicon glyphicon-cog text-success'></span>;
                                        } else if (this.state.processingState === 'processing') {
                                            return 'processing';
                                        } else if (this.state.processingState === 'finished') {
                                            return <span className='text-success'>Finished!</span>;
                                        }
                                    })()}</button>
                                    <button type='button' className='btn btn-default' onClick={(e) => this.props.dispatch({
                                        type: INTERPOLATE_HIDE
                                    })}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >;
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        selectedTrackId: state.selectedTrackId,
        selectedAnnotation: state.selectedAnnotation,
        annotationTypeContainer: state.annotationTypeContainer,
        annotationDetectionContainer: state.annotationDetectionContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(InterpolationWidget);
