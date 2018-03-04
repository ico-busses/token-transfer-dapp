import React from 'react';
import PropTypes from 'prop-types';
import { web3Service } from '../services';
import { Header, Divider, Grid, Card, Form, Label, List } from 'semantic-ui-react';
import { contentStyle } from '../styles';
import HasAlert from './HasAlert';

export default class Content extends HasAlert {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.next = this.next.bind(this);
    }

    state = {
        fetchingContract: false,
        tokenLoaded: false,
        tokenAddress: '',
        userBalance: 0,
        contractDetails: {}
    }

    get isValidTokenAddressSet (){
        return web3Service._web3.utils.isAddress(this.state.tokenAddress);
    }

    get printUserBalance() {
        let bal = this.state.userBalance || 0;
        bal = bal ? bal/(10**Number(this.state.contractDetails.decimals)) : bal;
        return new RegExp('^\\d+\\.?\\d{8,}$').test(bal) ? bal.toFixed(8) : bal;
    }

    async loadTokenInfo () {
        const { tokenAddress } = this.state;
        this.setState({ fetchingContract: true });
        try {
            const details = {
                address: tokenAddress,
                name: await web3Service.getTokenName(tokenAddress),
                symbol: await web3Service.getTokenSymbol(tokenAddress),
                decimals: await web3Service.getTokenDecimals(tokenAddress),
            };
            const balance = await web3Service.getTokenBalance(tokenAddress);
            this.notify({ msg: 'Token contract details loaded' });

            this.setState({ contractDetails: details, userBalance: balance, tokenLoaded: true });
            this.next();
        } catch (e) {
            this.notify({ msg: 'Error fetching token contract details' });
        }
        this.setState({ fetchingContract: false });
    }

    next () {
        const { fetchingContract, tokenLoaded, tokenAddress, contractDetails } = this.state;
        if ( this.isValidTokenAddressSet ) {
            if (tokenLoaded) {
                if (tokenAddress !== contractDetails.address) {
                    this.setState({ tokenLoaded: false, contractDetails: {}, userBalance: 0 });
                }
            } else if (!fetchingContract || tokenAddress !== contractDetails.address) {
                this.loadTokenInfo();
            }
        }
    }

    onChange = (property) => (event) => {
        const { target } = event;
        this.setState({ [property]: target.value });
    }

    async componentDidMount () {
        this.props.displayAddress('...');
        await web3Service.awaitInitialized();
        this.props.displayAddress(web3Service.defaultAccount);
    }

    render() {
        return (
            <Card fluid >
                <Card.Header style={contentStyle.main}>
                    <Grid rows={2} stackable divided padded='horizontally'>
                        <Grid.Column width={8} verticalAlign='middle'>
                            <Form.Input
                                fluid
                                error={true}
                                loading={this.state.fetchingContract}
                                value={this.state.tokenAddress}
                                placeholder='Contract Address'
                                onChange={this.onChange('tokenAddress')}
                                onKeyUp={this.next}
                                onBlur={this.next}
                                />
                        </Grid.Column>
                        <Grid.Column width={8}>
                            {
                                (this.state.fetchingContract || this.state.tokenLoaded ) &&
                            <List>
                                <List.Item>
                                    <Label pointing='right'>Token Address</Label>
                                        {this.state.tokenAddress}
                                </List.Item>
                                <List.Item>
                                    <Label pointing='right'>Name</Label>
                                        {this.state.contractDetails.name}
                                </List.Item>
                                <List.Item>
                                    <Label pointing='right'>Symbol</Label>
                                        {this.state.contractDetails.symbol}
                                </List.Item>
                                <List.Item>
                                    <Label pointing='right'>Decimals</Label>
                                        {this.state.contractDetails.decimals}
                                </List.Item>
                            </List>
                            }
                        </Grid.Column>
                    </Grid>
                </Card.Header>

                {
                    this.state.tokenLoaded &&
                    <div>
                        <Card.Meta padded='horizontally'>
                            <Grid rows={1} stackable divided padded='horizontally'>
                                <Grid.Column width={16}>
                                    <Divider />
                                    <Header as='h3' padded='horizontally' >
                                        Balance ≅
                                        {` ${this.printUserBalance} ${this.state.contractDetails.symbol}` }
                                    </Header>
                                </Grid.Column>
                            </Grid>
                        </Card.Meta>
                        <Card.Content style={contentStyle.main}>
                        </Card.Content>
                    </div>
                }
                {super.render()}
            </Card>
        );
    }
}

Content.propTypes = {
    displayAddress: PropTypes.any
};