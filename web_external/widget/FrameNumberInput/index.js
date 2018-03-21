import React, { PureComponent } from 'react';

class FrameNumberInput extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            this.setState({ value: nextProps.value.valueOf() });
        }
    }

    render() {
        return <input className={this.props.className} type='number' value={this.state.value}
            onChange={(e) => {
                var value = parseInt(e.target.value);
                if (isNaN(value)) {
                    return;
                }
                this.setState({ value });
            }}
            onBlur={(e) => {
                var value = this.state.value;
                if (value < this.props.min ||
                    value > this.props.max) {
                    this.setState({ value: this.props.value });
                } else {
                    this.props.onChange(this.state.value);
                    this.setState({ value: this.props.value });
                }
            }} />
    }
}

export default FrameNumberInput;
