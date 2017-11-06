import React, { PureComponent } from 'react';

import './style.styl';

class InfoView extends PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className={['v-infoview', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>Info</div>
                <div className='panel-body'>
                    <ul className='geometry'>
                        {this.props.annotations && this.props.annotations.map((annotation) => {
                            return <li key={`${annotation.geometry.id0}-${annotation.geometry.id1}`} className='track'>
                                <div title='id1'>Track id: {annotation.geometry.id1}</div>
                                {annotation.type &&
                                    <div>type: {annotation.type.obj_type}</div>
                                }
                                <div title='id0'>Geometry id: {annotation.geometry.id0}</div>
                                <div>Frame id: {annotation.geometry.ts0}</div>
                                {Object.entries(annotation.geometry.keyValues).map(([key, value], index) => {
                                    return <div key={index}>{key}: {value}</div>
                                })}
                                {annotation.activities && annotation.activities.length !== 0
                                    && <ul className='activity'>
                                        {annotation.activities.map((activity) => {
                                            return <li key={activity.id2} className='activity'>
                                                <div title='id2'>Activity id: {activity.id2}</div>
                                                <div>Activity: {activity.act2}</div>
                                            </li>
                                        })}
                                    </ul>}
                            </li>
                        })}
                    </ul>
                    <div className='clear-message'>(Click an annotation to view details. Click on an empty space to clear.)</div>
                </div>
            </div>
        </div>
    }
}
export default InfoView;
