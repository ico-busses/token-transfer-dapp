import React, { Component } from 'react';
import { Divider, Grid, Header } from 'semantic-ui-react';
import { footerStyle } from '../styles';

export default class Information extends Component {

    render() {
        return (
            <div>
                <Divider />
                <Header as='h6' dividing >
                    About the Dapp:
                </Header>
                <Grid>
                    <Grid.Row>
                        <Header as='p'>
                            Easy and optimized erc20 token transfer dapp<br/>
                            A decentralized dapp, to make quick ERC20, enabled tokens transfer <br/>
                            <br/>
                            The Dapp loads up the Token details from the token Address you provide. It handles Decimal calulations in the background.<br/>
                            All you need is the Token address.<br/>
                            <br/>
                            * Presently, it only works with Metamask. If we receive enough requests, we would add support for other wallet types
                        </Header>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}