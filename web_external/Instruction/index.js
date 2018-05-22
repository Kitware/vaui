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
            <div className='container-fluid'>
                <h4>Instruction</h4>
                <ul>
                    <li>The video is showing an activity</li>
                    <li>An activity contains one or more tracks</li>
                    <li>A track is a set of boxes enclosing a single object over time</li>
                    <li>A box should enclose the whole object but leave as little extra space as possible</li>
                    <li>There are three kinds of boxes. </li>
                    <li>Key box is shown with a thick border and created by your drawing and can be deleted</li>
                    <li>Calculated box is shown with a thin border and is automatically generated between key boxes and is read only</li>
                    <li>Input key box is shown like key box but with a shade and is read only</li>
                    <li>At start, there are only two key boxes for each track, at the start and the end. The calculated box are commonly
                not enclosing the object properly</li>
                    <li>Your task is to refine the track by drawing key boxes to make sure both key boxes and calculated boxes enclose the objects properly</li>
                </ul>
                <br />
                <h4>Example</h4>
                <p>Here is an example showing refining a single track of an activity, &ldquo;sitting down&rdquo;.</p>
                <video className='video' controls src='https://s3.amazonaws.com/diva-mturk-apps-resources/instruction-video.mp4'></video>
                <p>The worker watches the video one time to have a general idea and rewind to the start. Then the worker uses the RIGHT
            arrow key to advance the video and draws key boxes. After that, the worker reviews the result and draws additional
            boxes to make sure all boxes are enclosing the object properly.</p>
                <p>You do not need to follow this same workflow as the user in the video, but this video shows an example of how to
            complete the task correctly and efficiently.</p>
                <br />
                <h4>Controls</h4>
                <div>
                    <table className="table table-striped">
                        <thead><tr><th>Function</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr><td>Enter edit mode</td><td>right click on a track</td></tr>
                            <tr><td>Exit edit mode</td><td>While in edit mode, right click on a blank space</td></tr>
                            <tr><td>Draw a key box</td><td>While in edit mode, draw a box with the mouse</td></tr>
                            <tr><td>Remove a key box</td><td>While in edit mode, press DELETE, BACKSPACE, or D key to remove current box if it is a key box.</td></tr>
                            <tr><td>Advance/rewind the video by 1 frame</td><td>RIGHT/LEFT arrow key</td></tr>
                            <tr><td>Continuously advance/rewind the video by frame</td><td>press and hold RIGHT/LEFT arrow key</td></tr>
                            <tr><td>Rewind to start</td><td>Start button or S key</td></tr>
                            <tr><td>Play video</td><td>Play button or SPACE key</td></tr>
                            <tr><td>Pause video</td><td>Pause button or SPACE key</td></tr>
                            <tr><td>Zoom</td><td>mouse scroll</td></tr>
                        </tbody>
                    </table>
                </div>
                <h4>Approval</h4>
                <p>Annotate result will be approved manually.</p>
            </div>
        </div>
    }
}

export default Instruction;
