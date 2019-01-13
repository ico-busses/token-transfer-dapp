import React, { Component } from 'react';
import { Icon, Header, Container } from 'semantic-ui-react';
import { web3Service } from '../services';
import Content from './Content';
import Information from './Information';
import Footer from './Footer';
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
        this.setState({ address });
    }

    render () {
        return (
            <Container style={{ marginTop: '3em' }}>
                <Header as='h1' dividing >
                    Token Transfer Dapp
                    <small style={{ fontSize: '55%' }} > (
                        <a href={`${web3Service.explorer}address/${this.state.address}`} target='_blank' rel="noopener noreferrer">
                            {this.state.address}
                        </a>)
                    </small>
                    { !web3Service.isWeb3Viewable &&
                        <small> Loading Network ...</small>
                    }
                    <a href='https://github.com/ico-busses/token-transfer-dapp' style={contentStyle.source} >
                        Source code
                    <Icon color='black' size='large' name="github" style={contentStyle.sorceIcon} />
                    </a>
                </Header>
                <Content {...{ displayAddress: this.showUserAddress }}/>
                <Information/>
                <Footer/>
            </Container>
        );
    }
}