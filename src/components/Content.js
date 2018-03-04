import React from 'react';
import PropTypes from 'prop-types';
import { web3Service } from '../services';
import { Header, Divider, Grid, Card, Form, Button, Label, List, Dimmer, Loader } from 'semantic-ui-react';
import { contentStyle } from '../styles';
import HasAlert from './HasAlert';

export default class Content extends HasAlert {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.next = this.next.bind(this);
        this.transferTokens = this.transferTokens.bind(this);
    }

    state = {
        fetchingContract: false,
        tokenLoaded: true,
        sendingTokens: false,
        tokenAddress: '',
        userBalance: 0,
        contractDetails: {},
        recipientAddress:'',
        recipientAmount: 0
    }

    get isValidTokenAddressSet (){
        return web3Service._web3.utils.isAddress(this.state.tokenAddress);
    }

    get isValidRecipientAddressSet() {
        return web3Service._web3.utils.isAddress(this.state.recipientAddress);
    }

    get isValidRecipientAmountSet() {
        return new RegExp('^\\d+\\.?\\d*$').test(this.state.recipientAmount) && Number(this.state.recipientAmount) > 0 && Number(this.state.userBalance) > Number(this.state.recipientAmount);
    }

    get canSend() {
        return this.isValidTokenAddressSet && this.isValidRecipientAddressSet && this.isValidRecipientAmountSet;
    }

    get printUserBalance() {
        let bal = this.state.userBalance || 0;
        bal = bal ? bal/(10**Number(this.state.contractDetails.decimals)) : bal;
        return new RegExp('^\\d+\\.?\\d{8,}$').test(bal) ? bal.toFixed(8) : bal;
    }

    async loadTokenInfo () {
        const { tokenAddress } = this.state;
        if ( this.state.fetchingContract ) {
            return;
        }

        this.setState({ fetchingContract: true });
        try {
            const details = {
                address: tokenAddress,
                name: await web3Service.getTokenName(tokenAddress),
                symbol: await web3Service.getTokenSymbol(tokenAddress),
                decimals: await web3Service.getTokenDecimals(tokenAddress),
            };
            const balance = await web3Service.getTokenBalance(tokenAddress);
            this.notify({ msg: 'Token contract details loaded', type: 'success' });

            this.setState({ contractDetails: details, userBalance: balance, tokenLoaded: true });
            this.next();
        } catch (e) {
            this.notify({ msg: 'Error fetching token contract details' });
        }
        this.setState({ fetchingContract: false });
    }

    async transferTokens () {
        if (this.state.sendingTokens || !this.canSend) {
            return;
        }
        this.setState({ sendingTokens: true });

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
                            <Form>
                                <Form.Field error={Boolean(this.state.tokenAddress) && !this.isValidTokenAddressSet}>
                                    <label></label>
                                    <Form.Input
                                        fluid
                                        loading={this.state.fetchingContract}
                                        value={this.state.tokenAddress}
                                        placeholder='Contract Address'
                                        onChange={this.onChange('tokenAddress')}
                                        onKeyUp={this.next}
                                        onBlur={this.next}
                                    />
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            { this.state.fetchingContract &&
                                <Dimmer active={this.state.fetchingContract} inverted >
                                    <Loader>Loading</Loader>
                                </Dimmer>
                            }
                            {
                                this.state.tokenLoaded &&
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
                        <Card.Meta >
                            <Grid rows={1} stackable divided padded='horizontally'>
                                <Grid.Column width={16}>
                                    <Divider />
                                    <Header as='h3' >
                                        Balance ≅
                                        {` ${this.printUserBalance} ${this.state.contractDetails.symbol}` }
                                    </Header>
                                </Grid.Column>
                            </Grid>
                        </Card.Meta>
                        <Card.Content style={contentStyle.main}>
                            <Divider />
                            <Divider />
                            <Grid padded centered >
                                <Grid.Column width={12}>
                                    <Form >
                                        <Form.Field error={Boolean(this.state.recipientAddress) && !this.isValidRecipientAddressSet} >
                                            <label>To Address: </label>
                                            <Form.Input
                                                placeholder='Address'
                                                value={this.state.recipientAddress}
                                                onChange={this.onChange('recipientAddress')}
                                                onKeyUp={this.onChange('recipientAddress')}
                                                onBlur={this.onChange('recipientAddress')}
                                            />
                                        </Form.Field>
                                        <Form.Field error={Boolean(this.state.recipientAmount) && !this.isValidRecipientAmountSet} >
                                            <label>Amount to send</label>
                                            <Form.Input
                                                placeholder={`${this.state.contractDetails.symbol}s to send`}
                                                value={this.state.recipientAmount}
                                                onChange={this.onChange('recipientAmount')}
                                                onKeyUp={this.onChange('recipientAmount')}
                                                onBlur={this.onChange('recipientAmount')}
                                            />
                                            <span className='ui tiny'> Entire Balance </span>
                                        </Form.Field>
                                        <Button onClick={this.transferTokens} disabled={this.state.sendingTokens || !this.canSend} loading={this.state.sendingTokens} floated='right' inverted color='green' >
                                            Transfer {Boolean(Number(this.state.recipientAmount)) && `${this.state.recipientAmount} ${this.state.contractDetails.symbol}(s)`}
                                        </Button>
                                    </Form>
                                </Grid.Column>
                            </Grid>
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