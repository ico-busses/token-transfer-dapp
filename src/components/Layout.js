import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, Header, Container, Image } from 'semantic-ui-react';
import { web3Service } from '../services';
import { call2Action } from '../config';
import Content from './Content';
import Information from './Information';
import Footer from './Footer';
import '../styles/new-design.css';
import '../styles/layout.css';

export default class Layout extends Component {
    constructor (props) {
        super(props);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.showUserAddress = this.showUserAddress.bind(this);
    }

    state = {
        address: '',
        visible: true
    }

    showUserAddress (address) {
        this.setState({ address });
    }
    handleDismiss = () => {
        this.setState({ visible: false });
    }


    render () {
        return (
            <div>
                {this.state.visible &&
                <div className="alertWrapper">
                    <Container style={{ paddingTop: '3em', paddingBottom: '3em' }}>
                        <Grid columns={call2Action.columns || 2}>
                            <Grid.Column width={14}>
                              <span>
                                  {call2Action.message}
                              </span>

                            </Grid.Column>
                            <Grid.Column width={2} verticalAlign="middle">
                                { this.props.isMobile ?
                                    <Button icon='close' basic color="white" onClick={this.handleDismiss}/> :
                                    <a onClick={this.handleDismiss} className="dismiss">DISMISS</a>
                                }
                            </Grid.Column>
                        </Grid>
                    </Container>
                </div>
            }
            <div  className={this.props.isMobile ? "header-section-mobile" : "header-section"}>
                <Container style={{ paddingTop: '2em', paddingBottom: '3em' }}>
                    { this.props.isMobile ?
                        <Header as='h1' style={{ paddingBottom: '0.5em' }} >

                            <Grid rows={2}>
                                <Grid.Row className="logo-wrapper">
                                    <Image src="../images/icons/logo-colored.svg" className="logo"/>Token Transfer DApp
                                </Grid.Row>
                                <Grid.Row textAlign="right" width={6}>
                                    {web3Service.isWeb3Viewable &&
                                    <small style={{ fontSize: '55%' }} className="meta-address-holder-mobile"><a
                                        href={`${web3Service.explorer}address/${this.state.address}`} target='_blank'
                                        rel="noopener noreferrer">
                                        {this.state.address}
                                    </a>
                                    </small>
                                    }
                                    { !web3Service.isWeb3Viewable &&
                                    <small> Loading Network ...</small>
                                    }
                                </Grid.Row>
                            </Grid>
                        </Header> :
                        <Header as='h1' dividing  style={{ paddingBottom: '0.5em' }} >

                            <Grid columns={2}>
                                <Grid.Column className="logo-wrapper" width={10} style={{color: "reset"}}>
                                    <Image src="../images/icons/logo-white.svg" className="logo"/>Token Transfer DApp
                                </Grid.Column>
                                <Grid.Column textAlign="right" width={6}>
                                    {web3Service.isWeb3Viewable &&
                                    <small style={{ fontSize: '55%' }} className="meta-address-holder"><a
                                        href={`${web3Service.explorer}address/${this.state.address}`} target='_blank'
                                        rel="noopener noreferrer">
                                        {this.state.address}
                                    </a>
                                    </small>
                                    }
                                    { !web3Service.isWeb3Viewable &&
                                    <small> Loading Network ...</small>
                                    }
                                </Grid.Column>
                            </Grid>
                        </Header>
                    }
                </Container>
                <Content {...{ displayAddress: this.showUserAddress }}/>
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

Layout.propTypes = {
    isMobile: PropTypes.bool.isRequired
};
