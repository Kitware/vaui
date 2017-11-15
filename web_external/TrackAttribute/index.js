import React, { Component } from 'react';

import trackAttributes from './track-attributes';

import './style.styl';

class TrackAttribute extends Component {
    constructor(props) {
        super(props);
        this.state = { trackAttributes };
    }
    render() {
        return <div className={['v-trackattribute', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>Attributes</div>
                <div className='panel-body'>
                    <ul>
                        {Object.entries(this.state.trackAttributes).map(([category, attributes], index) => {
                            return <li key={index}>
                                {category}
                                <ul>
                                    {attributes.map((attribute, index) => {
                                        return <li key={index}>
                                            <div className='checkbox'>
                                                <label>
                                                    <input type='checkbox' />
                                                    {attribute}
                                                </label>
                                            </div>
                                        </li>;
                                    })}
                                </ul>
                            </li>;
                        })}
                    </ul>
                </div>
            </div>
        </div>;
    }
}
export default TrackAttribute;
