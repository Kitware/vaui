import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import { INTERPOLATE_HIDE } from '../actions/types';

import './style.styl';

class InterpolationWidget extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            trackId: null,
            geometries: []
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedTrackId !== this.props.selectedTrackId) {
            this.setState({ trackId: nextProps.selectedTrackId });
        }
        if (nextProps.selectedAnnotation !== this.props.selectedAnnotation) {
            if (nextProps.selectedAnnotation.geometry.id1 === this.state.trackId) {
                console.log(this.state.geometries.length);
                this.setState({
                    geometries: [...this.state.geometries, nextProps.selectedAnnotation.geometry]
                });
            } else {
                this.setState({
                    geometries: [nextProps.selectedAnnotation.geometry]
                });
            }
        }
    }

    render() {
        var canExecute = this.state.trackId !== null;
        return <div className={['v-interpolation-widget', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>Interpolate</div>
                <div className='panel-body'>
                    <label>Track:</label>
                    <div className='row'>
                        <div className='col-sm-11 col-sm-offset-1'>
                            <div title='id1'>Track id: {this.state.trackId}</div>
                            <div>type: {this.props.annotationTypeContainer.getTrackDisplayLabel(this.state.trackId)}</div>
                        </div>
                    </div>
                    {this.state.geometries.length > 1 &&
                        [<label key='geometries-title'>Geometries:</label>,
                        <ol className='geometries' key='geometries'>
                            {this.state.geometries.map((geometry) => {
                                return <li key={geometry.id0}>
                                    <div>Frame id: {geometry.ts0}</div>
                                    <div title='id0'>Geometry id: {geometry.id0}</div>
                                </li>
                            })}
                        </ol>]
                    }
                    <div className='bottom-row'>
                        <div className='row'>
                            <div className='col-xs-11 action-buttons-container'>
                                <div className='btn-group btn-group-sm' role='group'>
                                    <button type='button' className='btn btn-default' disabled={!canExecute} onClick={(e) => {
                                    }}><span className='glyphicon glyphicon-cog text-success'></span></button>
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
        annotationTypeContainer: state.annotationTypeContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(InterpolationWidget);
