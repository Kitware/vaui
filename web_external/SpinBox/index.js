import React, { Component } from 'react';

import './style.styl';

class SpinBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: this.calcWidth(props.max)
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.max !== this.props.max) {
            var w = this.calcWidth(nextProps.max);
            if (w !== this.state.width) {
                this.setState({width: this.calcWidth(nextProps.max)});
            }
        }
    }
    calcWidth(max) {
        return Math.floor(Math.log10(max)) + 1;
    }
    render() {
        return <div className={'spinbox' + (this.props.disabled ? ' disabled' : '')}>
            <input
                type='number'
                style={{width: this.state.width + 'em'}}
                min={this.props.min}
                max={this.props.max}
                value={this.props.value}
                disabled={this.props.disabled}
                onChange={(e) => this.props.change(e)} />
            {this.props.suffix}
        </div>;
    }
}

export default SpinBox;
