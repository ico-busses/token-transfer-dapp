import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Divider, Grid, Header } from 'semantic-ui-react';
import '../styles/new-design.css';

export default class Information extends Component {

    render() {
        return (
            <div className='about-section'>
                { this.props.isMobile &&
                    <Divider className='orange double-bordered single-bottom-bordered'/>
                }
                <Header as='h2' className='about-header'>
                    ABOUT THE DAPP
                </Header>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <p>
                                Easy and optimized erc20 token transfer dapp,
                                A decentralized dapp, to make quick ERC20, enabled tokens transfer.
                            </p>
                            <p>
                                It handles Decimal calulations in the background.
                            </p>
                            <p>
                                Presently, only works with <a href='https://metamask.io' target='_blank' rel='noopener noreferrer'> Metamask </a> and similar Web3 enabled browsers. If we receive enough requests, we would add support for other wallet types
                            </p>

                        </Grid.Column>
                        <Grid.Column width={8}>
                            <p> The Dapp loads up the Token details from the token Address you provide.</p>
                            <p>All you need is to provide the Token contract address above.</p>
                            <p> Muliple transfers is done throgh Javascript only, and as such, you have to confirm Metamask for each transfer.</p>
                            <p>Preloads token list from <a href='https://github.com/MetaMask/eth-contract-metadata' target='_blank' rel='noopener noreferrer'> Metamask Tokens Database </a>
                            </p>

                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

Information.propTypes = {
    isMobile: PropTypes.bool.isRequired
};
