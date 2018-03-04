import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { web3Service } from '../services';
import { Divider, Grid, Card, Form, Label, List } from 'semantic-ui-react';
import { contentStyle } from '../styles';

export default class Content extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.next = this.next.bind(this);
    }

    state = {
        fetchingContract: false,
        tokenLoaded: false,
        tokenAddress: '',
        contractDetails: {}
    }

    get isValidTokenAddressSet (){
        return web3Service._web3.utils.isAddress(this.state.tokenAddress);
    }

    async loadTokenInfo () {
        const { tokenAddress } = this.state;
        this.setState({ fetchingContract: true });
        try {
            const details = {
                address: tokenAddress,
                name: await web3Service.getTokenName(tokenAddress),
                symbol: await web3Service.getTokenSymbol(tokenAddress),
                balance: await web3Service.getTokenBalance(tokenAddress),
                decimals: await web3Service.getTokenDecimals(tokenAddress),
            };
            this.setState({ contractDetails: details, fetchingContract: false, tokenLoaded: true });
            this.next();
        } catch (e) {
        }
    }

    next () {
        const { fetchingContract, tokenLoaded, tokenAddress, contractDetails } = this.state;
        if ( this.isValidTokenAddressSet ) {
            if (tokenLoaded) {
                if (tokenAddress !== contractDetails.address) {
                    this.setState({ tokenLoaded: false });
                }
            } else if (!fetchingContract || tokenAddress !== contractDetails.address) {
                this.loadTokenInfo();
            }
        }
    }

    onChange = (property) => (event) => {
        const { target } = event;
        this.setState({ [property]: target.value});
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
                    {
                        this.state.tokenLoaded &&
                        <div>
                            <Divider />
                        </div>
                    }
                </Card.Header>
            </Card>
        );
    }
}

Content.propTypes = {
    displayAddress: PropTypes.any
};