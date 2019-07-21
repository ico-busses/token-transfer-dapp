import React, { Component } from 'react';
import Layout from './Layout';

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            screenWidth: 0
        };
        this.screenSizeChanged = this.screenSizeChanged.bind(this);
    }

    screenSizeChanged () {
        if (!this._mounted) return;
        this.setState({
            screenWidth: window.innerWidth
        });
    }

    componentDidMount () {
        this._mounted = true;
        window.addEventListener('resize', this.screenSizeChanged);
        this.screenSizeChanged();
    }

    componentWillUnMount () {
        this._mounted = false;
    }

    get isMobile () {
        return this.state.screenWidth <= 780;
    }

    render () {
        return (
            <Layout isMobile={this.isMobile} />
        );
    }
}
