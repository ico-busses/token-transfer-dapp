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

const mobilePadding = {
    paddingLeft: '7%',
    paddingRight: '7%'
};

const appName = 'Token Transfer DApp';

export default class Layout extends Component {
    constructor (props) {
        super(props);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.showUserAddress = this.showUserAddress.bind(this);
        this.setTokenLoaded = this.setTokenLoaded.bind(this);
    }

    state = {
        address: '',
        visible: true,
        tokenLoaded: false
    }

    showUserAddress (address) {
        this.setState({ address });
    }

    setTokenLoaded (tokenLoaded) {
        this.setState({ tokenLoaded });
    }

    handleDismiss = () => {
        this.setState({ visible: false });
    }


    render () {
        return (
            <div className={this.props.isMobile ? 'mobile' : ''} >
                {call2Action.message && this.state.visible &&
                    <div className={call2Action.wrapperStyle ? '' : 'alertWrapper'} style={call2Action.wrapperStyle || {}}>
                        <Container style={this.props.isMobile ? { paddingTop: '1em', paddingBottom: '1em' } : { paddingTop: '2em', paddingBottom: '2em' }}>
                            <Grid columns={call2Action.columns || 2}>
                                <Grid.Column width={14}>
                                    <span>
                                        {call2Action.message}
                                    </span>
                                </Grid.Column>
                                <Grid.Column width={2} verticalAlign="middle"  textAlign="center">
                                    { this.props.isMobile ?
                                        <Button icon='close' basic className="white" onClick={this.handleDismiss}/> :
                                        <a onClick={this.handleDismiss} className="dismiss">DISMISS</a>
                                    }
                                </Grid.Column>
                            </Grid>
                        </Container>
                    </div>
                }
                <div  className={`header-section ${this.state.tokenLoaded ? 'tokenLoaded' : ''}`}>
                    <Container style={{ paddingTop: '2em', paddingBottom: this.props.isMobile ? '0' : '3em', width: '100%' }}>
                        { this.props.isMobile ?
                            <Header as='h1' style={{ paddingBottom: '0.5em', margin: 0 }} >
                                <Grid rows={2}>
                                    <Grid.Row className="logo-wrapper mobile" style={Object.assign({ paddingTop: '0.5em', paddingBottom: '0.1em', margin: '0' }, mobilePadding)}>
                                        <Grid.Column verticalAlign="middle">
                                            <Image src="../images/icons/logo-colored.svg" className="logo"/> {appName}
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row textAlign="right" >
                                        <Grid.Column verticalAlign="middle">
                                            {web3Service.isWeb3Viewable &&
                                                <small className="meta-address-holder address">
                                                    { this.state.address &&
                                                        <a
                                                            href={ this.state.address ? `${web3Service.explorer}address/${this.state.address}` : ''} target='_blank'
                                                            rel="noopener noreferrer" >
                                                            {this.state.address || '...'}
                                                        </a>
                                                    }
                                                    { !this.state.address &&
                                                        '...'
                                                    }
                                                </small>
                                            }
                                            </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Header> :
                            <Header as='h1' dividing className='white-bordered' style={{ paddingBottom: '0.5em' }} >
                                <Grid columns={2}>
                                    <Grid.Column className="logo-wrapper" width={10} style={{ color: 'reset' }}>
                                        <Image src="../images/icons/logo-white.svg" className="logo"/> {appName}
                                    </Grid.Column>
                                    <Grid.Column textAlign="right" width={6}>
                                        {web3Service.isWeb3Viewable &&
                                        <small className="meta-address-holder address">
                                            { this.state.address &&
                                                <a
                                                    href={ this.state.address ? `${web3Service.explorer}address/${this.state.address}` : ''} target='_blank'
                                                    rel="noopener noreferrer" >
                                                    {this.state.address}
                                                </a>
                                            }
                                            { !this.state.address &&
                                                '...'
                                            }
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
                    <div style={this.props.isMobile ? mobilePadding : {}}>
                        <Content isMobile={this.props.isMobile} {...{ displayAddress: this.showUserAddress, tokenLoadedFunc: this.setTokenLoaded }}/>
                    </div>
                </div>
                <Container style={Object.assign({ marginTop: '3em' }, this.props.isMobile ? mobilePadding : {})}>
                    { !this.state.tokenLoaded ?
                        <Information isMobile={this.props.isMobile} /> :
                        <div></div>
                    }
                </Container>
                <div className="footer-section">
                    <Container style={Object.assign({ marginTop: '3em' }, this.props.isMobile ? mobilePadding : {})}>
                        <Footer  isMobile={this.props.isMobile}/>
                    </Container>
                </div>
            </div>
        );
    }
}

Layout.propTypes = {
    isMobile: PropTypes.bool.isRequired
};
