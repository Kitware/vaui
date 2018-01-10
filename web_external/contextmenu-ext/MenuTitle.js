import React, { Component } from 'react';
import { MenuItem } from 'react-contextmenu';

export class MenuTitle extends Component {
    render() {
        return ([
            <div key='title' className='react-contextmenu-title'>
                {this.props.children}
            </div>,
            <MenuItem key='menu-item' divider />
        ]);
    }
}
