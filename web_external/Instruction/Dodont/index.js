import React, { PureComponent } from 'react';
import './style.styl';

export default (props) => {
    return <div className='dodont'>
        <div className='image-container'>
            <div className='marker do'><span className='glyphicon glyphicon-ok'></span></div>
            <img src={props.src0} />
        </div>
        <div className='image-container'>
            <div className='marker dont'><span className='glyphicon glyphicon-remove'></span></div>
            <img src={props.src1} />
        </div>
    </div>
}
