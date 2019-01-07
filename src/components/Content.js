import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { web3Service } from '../services';
import ContractMap from 'eth-contract-metadata';
import { Header, Divider, Grid, Card, Form, Button, Label, List, Dimmer, Loader, Search } from 'semantic-ui-react';
import { contentStyle } from '../styles';
import HasAlert from './HasAlert';
import Transactions from './Transactions';

const ContractMapAddresses = Object.keys(ContractMap);

export default class Content extends HasAlert {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.next = this.next.bind(this);
        this.search = this.search.bind(this);
        this.searchSelected = this.searchSelected.bind(this);
        this.transferTokens = this.transferTokens.bind(this);

        web3Service.emitter.on('error', (e) =>
            this.notify({ msg: e.message|| e, type: 'error' })
        );
    }

    state = {
        fetchingContract: false,
        tokenLoaded: false,
        sendingTokens: false,
        runningNext: false,
        scouting: false,
        tokenAddress: '',
        userBalance: 0,
        contractDetails: {},
        recipientAddress:'',
        recipientAmount: 0,
        tokenFilterList: []
    }

    get isValidTokenAddressSet (){
        return web3Service._web3.utils.isAddress(this.state.tokenAddress);
    }

    get isValidRecipientAddressSet() {
        return web3Service._web3.utils.isAddress(this.state.recipientAddress);
    }

    get isValidRecipientAmountSet() {
        return new RegExp('^\\d+\\.?\\d*$').test(this.state.recipientAmount) && Number(this.state.recipientAmount) > 0 && Number(this.state.userBalance) >= Number(this.parseTokenAmount(this.state.recipientAmount,false));
    }

    get canSend() {
        return web3Service.isWeb3Usable && this.isValidTokenAddressSet && this.isValidRecipientAddressSet && this.isValidRecipientAmountSet;
    }

    get printUserBalance() {
        let bal = this.state.userBalance || 0;
        bal = bal ? this.parseTokenAmount(bal).toNumber() : bal;
        return new RegExp('^\\d+\\.?\\d{8,}$').test(bal) ? bal.toFixed(8) : bal;
    }

    get tokenFilterList () {
        return this.state.tokenFilterList.map( token => {
            return {
                title: `${ContractMap[token].name} (${ContractMap[token].symbol})`,
                description: token,
                image: `images/contractLogos/${ContractMap[token].logo}`
            };
        });
    }

    isValidRecipientAddressesSet() {

    }

    isValidRecipientAmountsSet() {

    }

    parseTokenAmount (amount, incoming=true) {
        const factor = new BigNumber(10 ** Number(this.state.contractDetails.decimals));
        if (incoming ) {
            return new BigNumber(amount.toString()).div(factor);
        } else {
            return new BigNumber(amount.toString()).times(factor);
        }
    }

    isValidAddress (address) {
        return web3Service._web3.utils.isAddress(address);
    }

    async scoutUpdates() {
        const SCOUT_TIMEOUT = 1000;
        if(!this._mounted) {
            return false;
        }
        this.timeout = setTimeout(() => this.scoutUpdates(), SCOUT_TIMEOUT);
        if (this.state.scouting) {
            return;
        }
        this.setState({ scouting: true });
        try {
        const accountsChanged = await web3Service.getAccountUpdates();
        if (accountsChanged) {
            this.props.displayAddress(web3Service.defaultAccount);
                this.notify({ msg: `Accounts changed`, type: 'info' });
            }
            await this.getTokenBalance();
            this.setState({ scouting: false });
        } catch (e) {
            this.setState({ scouting: false });
            throw e;
        }
    }

    async getTokenBalance () {
        const balance = this.state.tokenAddress && this.isValidTokenAddressSet ? await web3Service.getTokenBalance(this.state.tokenAddress) : 0;
        this.setState({ userBalance: balance, });
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
            await this.getTokenBalance();
            this.notify({ msg: 'Token contract details loaded', type: 'success' });

            this.setState({ contractDetails: details, tokenLoaded: true });
            this.next();
        } catch (e) {
            this.notify({ msg: `Error fetching token contract details: ${e.message || e}` });
        }
        this.setState({ fetchingContract: false });
    }

    async transferTokens () {
        if (this.state.sendingTokens || !this.canSend) {
            return;
        }
        this.setState({ sendingTokens: true });
        const { tokenAddress, recipientAddress, recipientAmount } = this.state;
        try {
            await web3Service.transferTokens(tokenAddress,recipientAddress, this.parseTokenAmount(recipientAmount, false).valueOf(), {
                onTransactionHash: (hash) => {
                    this.notify({ msg: 'Transfer successful, track transaction.', type: 'success' });
                    this.notify({ msg: `Transaction hash: ${hash}`, type: 'info' });
                    this.setState({ recipientAddress: '', recipientAmount: 0 });
                },
                onReceipt: (receipt) => {
                    this.notify({ msg: `Transaction confirmed: Hash - ${receipt.transactionHash}, Block - ${receipt.blockNumber}`, type: 'info' });
                }
            });
        } catch (e) {
            this.notify({ msg: `Transfer failed !!!: ${e.message || e}` });
        }
        this.setState({ sendingTokens: false });
    }

    search () {
        if (this.state.searchToken === this.state.activeSearch) {
            return false;
        }
        this.setState({
            searchingPreloaded: true,
            activeSearch: this.state.searchToken,
            tokenFilterList: []
        });
        const activeSearch = this.state.searchToken;

        const tokenFilterList = ContractMapAddresses.filter( address => (activeSearch.includes('0x') && address.includes(activeSearch)) || (ContractMap[address].erc20 && new RegExp(activeSearch,'i').test(ContractMap[address].name)) || (ContractMap[address].erc20 && new RegExp(activeSearch,'i').test(ContractMap[address].symbol)));
        this.setState({
            searchingPreloaded: false,
            tokenFilterList
        });
    }

    searchSelected (event, { result }) {
        this.setState({
            activeSearch: result.title,
            searchToken: result.title,
            tokenAddress: result.description,
            tokenFilterList: [
                result.description
            ]
        }, () => {
            this.next();
        });
    }

    next () {
        if (this.state.runningNext) {
            return;
        }
        this.setState({ runningNext: true });
        const { fetchingContract, tokenLoaded, tokenAddress, contractDetails } = this.state;
        if ( this.isValidTokenAddressSet ) {
            if (tokenLoaded) {
                if (tokenAddress !== contractDetails.address && !fetchingContract) {
                    this.setState({ tokenLoaded: false, contractDetails: {}, userBalance: 0 }, () => {
                        this.loadTokenInfo();
                    });
                }
            } else if (!fetchingContract || tokenAddress !== contractDetails.address) {
                this.loadTokenInfo();
            }
        } else {
            this.setState({ tokenLoaded: false, contractDetails: {}, userBalance: 0 });
        }
        this.setState({ runningNext: false });
    }

    onChange = (property) => (event) => {
        const { target } = event;
        this.setState({ [property]: target.value });
    }

    async componentDidMount () {
        this.props.displayAddress('...');
        await web3Service.awaitInitialized();
        this.props.displayAddress(web3Service.defaultAccount);
        this.scoutUpdates();
        this._mounted=true;
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        this._mounted=false;
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
                                    <Search
                                        loading={this.state.searchingPreloaded}
                                        value={this.state.searchToken}
                                        placeholder='Search by Contract Name, Symbol or Address snippet'
                                        onResultSelect={this.searchSelected}
                                        onSearchChange={this.onChange('searchToken')}
                                        results={this.tokenFilterList}
                                        onKeyUp={this.search}
                                        onBlur={this.search}
                                        fluid
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
                                        <a href={`${web3Service.explorer}address/${this.state.tokenAddress}`} target='_blank' rel="noopener noreferrer">
                                            {this.state.tokenAddress}
                                        </a>
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
                                        <Transactions symbol={this.state.contractDetails.symbol} isValidAddress={this.isValidAddress} parseTokenAmount={this.parseTokenAmount} />
                                        <Button onClick={this.transferTokens} disabled={this.state.sendingTokens || !this.canSend} loading={this.state.sendingTokens} floated='right' inverted color='green' >
                                            Transfer {Boolean(Number(this.state.totalAmount)) && `${this.state.totalAmount} ${this.state.contractDetails.symbol}(s)`}
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