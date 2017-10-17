import React, { Component } from 'react';
import './style.styl';

class TreeView extends Component {
    constructor(props) {
        super(props);
        var tracks = [];
        var objects = ['Vehicle', 'Person'];
        for (var i = 0; i < 100; i++) {
            tracks.push(objects[Math.round(Math.random())] + '-' + (Math.floor(Math.random() * 400) + 100));
        }
        this.state = { tracks };
    }
    render() {
        return <div className={['v-treeview', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    <ul className='nav nav-tabs'>
                        <li>
                            <a data-toggle='tab' href='#activities'>Activities</a>
                        </li>
                        <li className='active'>
                            <a data-toggle='tab' href='#tracks'>Tracks</a>
                        </li>
                        <li>
                            <a data-toggle='tab' href='#scene-elements'>Scene Elements</a>
                        </li>
                    </ul>
                </div>
                <div className='panel-body'>
                    <div className='tab-content'>
                        <div id='activities' className='tab-pane'>1</div>
                        <div id='tracks' className='tab-pane active'>
                            <ul className='item-list'>
                                {this.state.tracks.map((track, index) => {
                                    return <li key={index}>
                                        <div className='checkbox'>
                                            <label>
                                                <input type='checkbox' defaultChecked />
                                                {track}
                                            </label>
                                        </div>
                                    </li>
                                })}
                            </ul>
                        </div>
                        <div id='scene-elements' className='tab-pane'>4</div>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default TreeView;
