import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { staticRoot } from 'girder/rest';
import Plyr from 'react-plyr';

import Dodont from './Dodont';

import 'plyr/dist/plyr.css';
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
                    <li>There are 3 kinds of boxes</li>
                    <li>Key box is shown with a thick border. You will draw key boxes and be able to delete them</li>
                    <li>Calculated box is shown with a thin border and is automatically generated between key boxes that you draw. This may help you reduce the number of boxes to draw</li>
                    <li>Input key box is shown like key box but with a shade and is read-only. They are the boxes at the start and the end of a track</li>
                    <li>At the beginning, the calculated boxes are commonly not enclosing the object properly. Your task is to refine the track by drawing key boxes to make sure both key boxes and calculated boxes enclose the objects properly</li>
                    <li>After making sure all boxes are properly enclosing the objects, click the submit button to submit. You will have an option to provide feedback before submitting</li>
                </ul>
                <br />
                <h4>Properly enclosing</h4>
                <Dodont
                    src0='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/enclose_do.jpg'
                    src1='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/enclose_dont.jpg' />
                <p>Enclose all part of the object</p>
                <Dodont
                    src0='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/extraspace_do.jpg'
                    src1='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/extraspace_dont.jpg' />
                <p>Leave as little extra space as possible</p>
                <Dodont
                    src0='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/presumelocation_do.jpg'
                    src1='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/presumelocation_dont.jpg' />
                <p>Extend to presumed location of the object</p>
                <br />
                <h4>Example video</h4>
                <p>Here is an example showing refining a single track of an activity, &ldquo;sitting down&rdquo;.</p>
                <Plyr
                    type="video"
                    url="https://s3.amazonaws.com/diva-mturk-apps-resources/instruction-video.mp4"
                    controls={['play-large', 'play', 'progress', 'current-time']}
                />
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
                <br />
                <h4>Approval</h4>
                <p>Result will be approved manually.</p>
                <br />
                <h4>Other</h4>
                <h5>Track line</h5>
                <p>The position of each tracked object over time will display as a line. Where a user has drawn a key box, there will be a small dot appearing on the track line. Clicking on these dots will jump to the frame where that box was created.</p>
                <h5>Playback speed</h5>
                <p>Additional playback speed can be selected from the menu next to play button.</p>
            </div>
        </div>
    }
}

export default Instruction;
