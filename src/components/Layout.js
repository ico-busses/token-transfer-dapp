import React, { Component } from 'react';
import { Icon, Header, Container } from 'semantic-ui-react';
import { web3Service } from '../services';
import Content from './Content';
import Information from './Information';
import Footer from './Footer';
import { contentStyle } from '../styles';
import '../styles/new-design.css';

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
            <div>
            <div style={contentStyle.yellowBg}>
                <Container style={{ paddingTop: '3em', paddingBottom: '3em' }}>
                <Header as='h1' dividing  >
                    Token Transfer Dapp
                    <small style={{ fontSize: '55%' }} > (
                        <a href={`${web3Service.explorer}address/${this.state.address}`} target='_blank' rel="noopener noreferrer">
                            {this.state.address}
                        </a>)
                    </small>
                    { !web3Service.isWeb3Viewable &&
                        <small> Loading Network ...</small>
                    }
                </Header>
                <Content {...{ displayAddress: this.showUserAddress }}/>
                </Container>
            </div>
            <Container style={{ marginTop: '3em' }}>
                <Information/>
            </Container>
             <div className="footer-section">
                 <Container style={{ marginTop: '3em' }}>
                 <Footer/>
                 </Container>
             </div>
            </div>
        );
    }
}
