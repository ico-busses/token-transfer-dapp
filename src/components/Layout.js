import React, { Component } from 'react';
import { Header, Container } from 'semantic-ui-react';
import Footer from './Footer';
import Content from './Content';

export default class Layout extends Component {
    constructor (props) {
        super(props);
        this.showUserAddress = this.showUserAddress.bind(this);
    }

    state = {
        address: ''
    }

    showUserAddress (address) {
        this.setState({ address:address });
    }

    render () {
        return (
            <Container style={{ marginTop: '3em' }}>
                <Header as='h3' dividing >
                    Token Transfer Dapp
                    <small > ( {this.state.address} ) </small>
                </Header>
                <Content {...{ displayAddress: this.showUserAddress }}/>
                <Footer/>
            </Container>
        );
    }
}