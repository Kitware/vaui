import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { staticRoot } from 'girder/rest';

import Viewer from '../Viewer';
import FormSubmitter from '../FormSubmitter';
import image from '../assets/image.jpg';

import './style.styl';

class Instruction extends PureComponent {
    render() {
        return <div className='b-instruction'>
            <button className='btn btn-sm btn-primary' onClick={() => this.props.history.goBack()}>Back</button>
            <div className='container-fluid'>
                <h4>Instruction</h4>
                <div>
                    Annotate vehicles (exclude motorbike) on the image.
                    <ul>
                        <li>Drag and move to draw an annotation box</li>
                        <li>Right-click on a box to remove it</li>
                        <li>Enclose vehicle in the box as precise as possible</li>
                        <li>Annotate as many vehicles as possible</li>
                    </ul>
                </div>
                <img className='example' src={`${staticRoot}/built/plugins/box_objects/${image}`} />
                <h4>Approval</h4>
                <div>
                    Annotate result will be approved manually.
                    <ul>
                        <li>To improve approve rate annotate vehicles as many and precise as possible</li>
                        <li>Result with a large number of missing or incorrect boxes will be rejected</li>
                    </ul>
                </div>
            </div>
        </div>
    }
}

export default Instruction;
