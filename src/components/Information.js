import React, { Component } from 'react';
import { Divider, Grid, Header } from 'semantic-ui-react';

export default class Information extends Component {

    render() {
        return (
            <div>
                <Divider />
                <Header as='h5' dividing >
                    About the Dapp:
                </Header>
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            Easy and optimized erc20 token transfer dapp,<br/>
                            A decentralized dapp, to make quick ERC20, enabled tokens transfer<br/>.
                            <br/>
                            The Dapp loads up the Token details from the token Address you provide. It handles Decimal calulations in the background.<br/>
                            All you need is to provide the Token contract address above.<br/>
                            Preloads token list from [Metamask Tokens Database](https://github.com/MetaMask/eth-contract-metadata)
                            <br/>
                            * Presently, it only works with Metamask. If we receive enough requests, we would add support for other wallet types
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}