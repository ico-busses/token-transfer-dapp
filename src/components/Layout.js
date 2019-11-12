import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router';
import { Link, Redirect, Route } from 'react-router-dom';
import { Button, Grid, Header, Container, Image } from 'semantic-ui-react';
import { web3Service, NULL_ADDRESS } from '../services';
import { call2Action } from '../config';
import { Address } from "./lib/";
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
                        <div style={this.props.isMobile ? { padding: '0', paddingTop: '1em', paddingBottom: '1em' } : { paddingTop: '2em', paddingBottom: '2em' }}>
                            <Grid>
                                <Grid.Row columns={call2Action.columns || 2}>
                                    <Grid.Column width={14}>
                                        <Container>
                                            {call2Action.message}
                                        </Container>
                                    </Grid.Column>
                                    <Grid.Column width={2} verticalAlign="middle"  textAlign="center">
                                        { this.props.isMobile ?
                                            <Button icon='close' basic className="white" onClick={this.handleDismiss}/> :
                                            <a onClick={this.handleDismiss} className="dismiss">DISMISS</a>
                                        }
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </div>
                    </div>
                }
                <div  className={`header-section ${this.state.tokenLoaded ? 'tokenLoaded' : ''}`}>
                        { this.props.isMobile ?
                            <div style={{ paddingTop: '2em', paddingBottom: '0', width: '100%' }}>
                                <Header as='h1' style={{ paddingBottom: '0.5em', margin: 0 }} >
                                    <div rows={2}>
                                        <div className="logo-wrapper mobile" style={{ paddingBottom: '0 !important' }}>
                                            <div style={Object.assign({ verticalAlign:'middle', paddingTop: '0.5em', paddingBottom: '0.1em', margin: '0' }, mobilePadding)}>
                                                <Link to='/'>
                                                    <Image src="./images/icons/logo-colored.svg" className="logo"/> {appName}
                                                </Link>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }} >
                                            <div style={{ verticalAlign: 'middle' }}>
                                                {web3Service.isWeb3Viewable &&
                                                    <small className="meta-address-holder address">
                                                        { this.state.address && this.state.address !== NULL_ADDRESS ?
                                                            <Address
                                                                url={ this.state.address ? `${web3Service.explorer}address/${this.state.address}` : ''}
                                                                address={this.state.address || '...'}
                                                                hideCopy={this.state.address === '...'}
                                                            />:
                                                            <a onClick={()=>{}}>
                                                                ...
                                                            </a>
                                                        }
                                                    </small>
                                                }
                                                </div>
                                        </div>
                                    </div>
                                </Header>
                            </div> :
                            <Container style={{ paddingTop: '2em', paddingBottom: '3em', width: '100%' }}>
                                <Header as='h1' dividing className='white-bordered' style={{ paddingBottom: '0.5em' }} >
                                    <Grid columns={2}>
                                        <Grid.Column className="logo-wrapper" width={10} style={{ color: 'reset' }}>
                                            <Link to='/'>
                                                <Image src="./images/icons/logo-white.svg" className="logo"/> {appName}
                                            </Link>
                                        </Grid.Column>
                                        <Grid.Column textAlign="right" width={6}>
                                            {web3Service.isWeb3Viewable &&
                                            <small className="meta-address-holder address">
                                                { this.state.address && this.state.address !== NULL_ADDRESS ?
                                                    <Address
                                                    url={ this.state.address ? `${web3Service.explorer}address/${this.state.address}` : ''}
                                                    address={this.state.address}
                                                    hideCopy={this.state.address === '...'}
                                                />:
                                                    <a onClick={()=>{}}>
                                                        ...
                                                    </a>
                                                }
                                            </small>
                                            }
                                            { !web3Service.isWeb3Viewable &&
                                                <small> Loading Network ...</small>
                                            }
                                        </Grid.Column>
                                    </Grid>
                                </Header>
                            </Container>
                        }
                    <div style={this.props.isMobile ? mobilePadding : {}}>
                        <Switch>
                            <Redirect exact to="/:address/transfer" from="/:address" />
                        </Switch>
                        < Route path="/:address?" strict render ={ props =>
                            <Content isMobile={this.props.isMobile} {...{ displayAddress: this.showUserAddress, tokenLoadedFunc: this.setTokenLoaded }} {...props}/>
                        }/>
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
