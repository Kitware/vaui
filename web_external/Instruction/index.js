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
                    <li>There are 3 kinds of boxes.</li>
                    <li>Key boxes are shown with a thick border. You will draw key boxes and be able to delete them.</li>
                    <li>Calculated boxes are shown with a thin border and are automatically generated between key boxes that you draw.</li>
                    <li>This may help you reduce the number of boxes to draw.</li>
                    <li>Fixed key boxes are shown like key boxes but are shaded and filled in. They are read-only. They are the boxes at the start and the end of a track.</li>
                    <li>At the beginning, the calculated boxes are commonly not enclosing the object properly. Your task is to refine this by drawing key boxes to make sure both key boxes and calculated boxes enclose the objects properly.</li>
                    <li>After making sure all boxes properly enclose the objects, click the submit button to submit. You will have an option to provide feedback before submitting.</li>
                </ul>
                <br />
                <h4>Properly enclosing</h4>
                <Dodont
                    src0='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/enclose_do.jpg'
                    src1='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/enclose_dont.jpg' />
                <p>Enclose all parts of the object.  Including small carried items for person tracks.</p>
                <Dodont
                    src0='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/extraspace_do.jpg'
                    src1='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/extraspace_dont.jpg' />
                <p>Leave as little extra space as possible.</p>
                <Dodont
                    src0='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/presumelocation_do.jpg'
                    src1='https://s3.amazonaws.com/diva-mturk-apps-resources/do_dont/presumelocation_dont.jpg' />
                <p>Enclose all parts of the object, even if you can't see all of the parts of the object. Make a best estimate on where you think all parts of the object would be if you could see them.</p>
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
                <p>Results will be approved manually.</p>
                <br />
                <h4>Other</h4>
                <h5>Track line</h5>
                <p>The position of each tracked object over time will display as a line. Where a user has drawn a key box, there will be a small dot appearing on the track line. Clicking on these dots will jump to the frame where that box was created.</p>
                <h5>Playback speed</h5>
                <p>Additional playback speeds can be selected from the menu next to play button.</p>
            </div>
        </div>
    }
}

export default Instruction;
