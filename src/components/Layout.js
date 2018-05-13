import React, { Component } from 'react';
import { Icon, Header, Container } from 'semantic-ui-react';
import { web3Service } from '../services';
import Footer from './Footer';
import Content from './Content';
import { contentStyle } from '../styles';

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
                    <small > (
                        <a href={`${web3Service.explorer}address/${this.state.address}`} target='_blank' rel="noopener noreferrer">
                            {this.state.address}
                        </a>)
                    </small>
                    <a href='https://github.com/ico-busses/token-transfer-dapp' style={contentStyle.source} >
                        Source code
                    <Icon color='black' size='large' name="github" style={contentStyle.sorceIcon} />
                    </a>
                </Header>
                <Content {...{ displayAddress: this.showUserAddress }}/>
                <Footer/>
            </Container>
        );
    }
}