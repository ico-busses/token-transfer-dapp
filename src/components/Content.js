import React from 'react';
import PropTypes from 'prop-types';
import { Link, Route } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { web3Service } from '../services';
import ContractMap from 'eth-contract-metadata';
import { Button, Card, Form, Grid, List, Loader, Search, Container } from 'semantic-ui-react';
import { contentStyle } from '../styles';
import HasAlert from './HasAlert';
import Approvals from './Approvals';
import Transactions from './Transactions';
import '../styles/new-design.css';

const ContractMapAddresses = Object.keys(ContractMap);

export default class Content extends HasAlert {
    constructor(props) {
        super(props);

        this.addTokenToWallet = this.addTokenToWallet.bind(this);
        this.onChange = this.onChange.bind(this);
        this.next = this.next.bind(this);
        this.search = this.search.bind(this);
        this.searchSelected = this.searchSelected.bind(this);
        this.transferTokens = this.transferTokens.bind(this);
        this.parseTokenAmount = this.parseTokenAmount.bind(this);
        this.clearTokenAddress = this.clearTokenAddress.bind(this);
        this.updateTotalAmount = this.updateTotalAmount.bind(this);
        this.setLayoutTokenLoaded = this.setLayoutTokenLoaded.bind(this);
        this.setResetDetails = this.setResetDetails.bind(this);
        this.setTransferDetailsFetcher= this.setTransferDetailsFetcher.bind(this);
        this.setValidRecipientAddressesSet = this.setValidRecipientAddressesSet.bind(this);
        this.setValidRecipientAmountsSet = this.setValidRecipientAmountsSet.bind(this);

        web3Service.emitter.on('error', (e) =>
            this.notify({ msg: e.message|| e, type: 'error' })
        );
        web3Service.emitter.on('info', (e) =>
            this.notify({ msg: e.message|| e, type: 'info' })
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
        tokenFilterList: [],
        resetDetails: null,
        fetchTransferDetails: null,
        totalRecipientsAmounts: 0,
        isValidRecipientAmountsSet: false,
        isValidRecipientAddressesSet: false,
    }

    get isValidTokenAddressSet (){
        return web3Service._web3.utils.isAddress(this.state.tokenAddress);
    }

    get canSend() {
        return web3Service.isWeb3Usable && this.isValidTokenAddressSet && this.state.isValidRecipientAddressesSet && this.state.isValidRecipientAmountsSet;
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
                image:  this.state.tokenFilterList.length < 6 ? `images/contractLogos/${ContractMap[token].logo}` : ''
            };
        });
    }

    resolveUrlAddress () {
        if (this.props.match.params && this.props.match.params.address) {
            this.setState({
                tokenAddress: this.props.match.params.address
            }, () => this.next());
        }
    }

    setResetDetails (value) {
        this.setState({ resetDetails: value });
    }

    setTransferDetailsFetcher (value) {
        this.setState({ fetchTransferDetails: value });
    }

    setValidRecipientAddressesSet(value) {
        this.setState({ isValidRecipientAddressesSet: !!value });
    }

    setValidRecipientAmountsSet(value) {
        this.setState({ isValidRecipientAmountsSet: !!value });
    }

    updateTotalAmount(value) {
        this.setState({ totalRecipientsAmounts: value });
    }

    parseTokenAmount (amount, incoming=true) {
        const factor = new BigNumber(10 ** Number(this.state.contractDetails.decimals));
        if (incoming ) {
            return new BigNumber(amount.toString()).div(factor);
        } else {
            return new BigNumber(amount.toString()).times(factor);
        }
    }

    clearTokenAddress () {
        this.setState({ tokenAddress: '' }, () => this.next());
    }

    isValidAddress (address) {
        return web3Service._web3.utils.isAddress(address);
    }

    setLayoutTokenLoaded () {
        this.props.tokenLoadedFunc(this.state.tokenLoaded);
    }

    async base64ViaFileReader(url) {
        return new Promise ((resolve, reject) => {
            try {
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                  var reader = new FileReader();
                  reader.onloadend = function() {
                    resolve(reader.result);
                  };
                  reader.readAsDataURL(xhr.response);
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            } catch (e) {
                reject(e);
            }
        });
    }

    async addTokenToWallet () {
        const { address, symbol, decimals } = this.state.contractDetails;
        let image;

        try {
            if (ContractMap[address] && ContractMap[address].logo) {
                image = `images/contractLogos/${ContractMap[address].logo}`;
                image = await this.base64ViaFileReader(image);
            }

            const tokenDetails = { address, symbol, decimals };
            image ? tokenDetails.image = image : null;
            const addCall = await web3Service.addToWallet(tokenDetails);

            if (addCall) {
                this.notify({ msg: `Token added to wallet`, type: 'success', autoClose: true });
            } else {
                throw `Failed to add Token to wallet`;
            }
        } catch (e) {
            this.notify({ msg: e.message || e, type: 'error', autoClose: true });

        }
    }

    async scoutUpdates() {
        const SCOUT_TIMEOUT = 1000;
        if (!this._mounted) {
            return false;
        }
        this.timeout = setTimeout(() => this.scoutUpdates(), SCOUT_TIMEOUT);

        if (this.state.scouting) {
            return false;
        }
        this.setState({ scouting: true });
        try {
            const accountsChanged = await web3Service.getAccountUpdates();
            if (accountsChanged) {
                this.props.displayAddress(web3Service.defaultAccount);
                this.notify({ msg: `Accounts changed`, type: 'info', autoClose: true });
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
        this.setState({ userBalance: balance });
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

            this.setState({ contractDetails: details, tokenLoaded: true }, () => {
                this.setLayoutTokenLoaded();
            });
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
        const { tokenAddress } = this.state;
        const txDetails = this.state.fetchTransferDetails();

        if (txDetails.addresses.length > 1 && txDetails.amounts.length > 1) {
            this.notify({ msg: 'Making multiple transfers. You need to approve metamask for each transaction', type: 'info', autoClose: true });
        }

        try {
            await Promise.all(
                txDetails.addresses.map( (address, index) => {
                    return web3Service.transferTokens(tokenAddress, address, this.parseTokenAmount(txDetails.amounts[index], false).toFixed(), {
                        onTransactionHash: (hash) => {
                            this.notify({ msg: 'Transfer successful, track transaction.', type: 'success', autoClose: 1000 });
                            this.notify({ msg: <div><b>Transaction hash:</b> {hash}</div>, type: 'info' });
                        },
                        onReceipt: (receipt) => {
                            this.notify({ msg: <div><b>Transaction confirmed:</b><br/> Hash - {receipt.transactionHash},<br/> Block - {receipt.blockNumber}</div>, type: 'info' });
                        }
                    });
                })
            );
            this.state.resetDetails();
            this.setState({
                sendingTokens: false,
                totalRecipientsAmounts: 0,
                isValidRecipientAmountsSet: false,
                isValidRecipientAddressesSet: false
            });
        } catch (e) {
            this.notify({ msg: `Transfer failed !!!: ${e.message || e}` });
            this.setState({
                sendingTokens: false
            });
        }
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
        if (this.props.match.params.address !== tokenAddress) {
            this.props.history.push(`/${tokenAddress}`);
        }
        if ( this.isValidTokenAddressSet ) {
            if (tokenLoaded) {
                if (tokenAddress !== contractDetails.address && !fetchingContract) {
                    this.setState({ tokenLoaded: false, contractDetails: {}, userBalance: 0 }, () => {
                        this.loadTokenInfo();
                        this.setLayoutTokenLoaded();
                    });
                }
            } else if (!fetchingContract || tokenAddress !== contractDetails.address) {
                this.loadTokenInfo();
            }
        } else {
            this.setState({ tokenLoaded: false, contractDetails: {}, userBalance: 0, runningNext: false }, () => {
                this.setLayoutTokenLoaded();
            });
        }
        this.setState({ runningNext: false });
    }

    onChange = (property) => (event) => {
        const { target } = event;
        this.setState({ [property]: target.value });
    }

    async componentDidMount () {
        this._mounted=true;
        this.props.displayAddress('...');
        await web3Service.awaitInitialized();
        this.props.displayAddress(web3Service.defaultAccount);
        this.scoutUpdates();
        this.resolveUrlAddress();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location
             && this.props.location.pathname === '/'
        ) {
          this.clearTokenAddress();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        this._mounted=false;
    }

    render() {
        const iconProp = {};
        if (this.state.tokenAddress) {
            iconProp.icon = { name: 'close', style: { cursor: 'pointer', pointerEvents: 'auto' }, onClick: this.clearTokenAddress };
        }

        return (
            <Card fluid style={Object.assign({}, contentStyle.formSection, this.state.tokenLoaded ? { paddingBottom: 0 } : {}, this.props.isMobile ? {
                paddingTop: '36px',
                paddingBottom: '36px' } : {})} >
                <Container>
                    <Card.Header style={contentStyle.main}>
                        <Grid stackable divided padded='horizontally' className={this.state.tokenLoaded ? 'mb-24' : ''}>
                            { !this.props.isMobile &&
                                <Grid.Column width={4} style={contentStyle.noBoxShadow}>
                                </Grid.Column>
                            }
                            <Grid.Column width={this.props.isMobile ? 16 : 8} verticalAlign='middle' style={contentStyle.noBoxShadow}>
                                <Form className='contract-form'>
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
                                            error={Boolean(this.state.tokenAddress && !this.isValidTokenAddressSet)}
                                            className={`${!this.props.isMobile && this.state.tokenAddress && this.isValidTokenAddressSet ? 'white-background' : ''} ${(this.state.tokenAddress && !this.isValidTokenAddressSet) ? 'error' : ''}`}
                                            {...iconProp}
                                        />
                                        <Search
                                            fluid
                                            loading={this.state.searchingPreloaded}
                                            value={this.state.searchToken}
                                            placeholder='Search by Contract Name, Symbol or Address snippet'
                                            onResultSelect={this.searchSelected}
                                            onSearchChange={this.onChange('searchToken')}
                                            results={this.tokenFilterList}
                                            onKeyUp={this.search}
                                            onBlur={this.search}
                                            className={`${!this.props.isMobile && this.state.searchToken && this.state.searchToken.length > 0 ? 'white-background' : ''} ${(this.state.tokenAddress && !this.isValidTokenAddressSet) ? 'error' : ''}`}
                                        />
                                    </Form.Field>
                                </Form>
                            </Grid.Column>
                            { !this.props.isMobile &&
                                <Grid.Column width={4} style={contentStyle.noBoxShadow}>
                                </Grid.Column>
                            }
                        </Grid>
                        <Grid >
                            { this.state.fetchingContract &&
                                <div style={{ position: 'relative', margin: '6em auto 3em' }} >
                                    <Loader active={this.state.fetchingContract} size='massive' ></Loader>
                                </div>
                            }
                        </Grid>
                    </Card.Header>
                </Container>
                {
                    this.state.tokenLoaded &&
                        <div className='formDetails'>
                            <Container>
                                <div>
                                    <Grid>
                                        <Grid.Column width={16}>
                                            {
                                                this.state.tokenLoaded &&
                                                    <div>
                                                        { this.props.isMobile ?
                                                            <Card fluid className='mt-0 mb-0'>
                                                                <List divided relaxed>
                                                                    <List.Item>
                                                                        <List.Content>
                                                                            <List.Header as='h2'>Token Address</List.Header>
                                                                            <List.Description as='p' className='address'>
                                                                                <a href={`${web3Service.explorer}token/${this.state.tokenAddress}`} target='_blank' rel='noopener noreferrer'>
                                                                                    {this.state.tokenAddress}
                                                                                </a>
                                                                            </List.Description>
                                                                        </List.Content>
                                                                    </List.Item>
                                                                    <List.Item>
                                                                        <List.Content>
                                                                            <List.Header as='h2'>Name</List.Header>
                                                                            <List.Description as='p'>
                                                                                {this.state.contractDetails.name}
                                                                            </List.Description>
                                                                        </List.Content>
                                                                    </List.Item>
                                                                    <List.Item>
                                                                        <List.Content>
                                                                            <List.Header as='h2'>Decimals</List.Header>
                                                                            <List.Description as='p'>
                                                                                {this.state.contractDetails.decimals}
                                                                            </List.Description>
                                                                        </List.Content>
                                                                    </List.Item>
                                                                    <List.Item>
                                                                        <List.Content>
                                                                            <List.Header as='h2'>Symbol</List.Header>
                                                                            <List.Description as='p'>
                                                                                {this.state.contractDetails.symbol}
                                                                            </List.Description>
                                                                        </List.Content>
                                                                    </List.Item>
                                                                    <List.Item>
                                                                        <List.Content>
                                                                            <List.Header as='h2'>Balance(approx.)</List.Header>
                                                                            <List.Description as='p'>
                                                                                {` ${this.printUserBalance} ${this.state.contractDetails.symbol}` }
                                                                            </List.Description>
                                                                        </List.Content>
                                                                    </List.Item>
                                                                </List>
                                                            </Card> :
                                                            <Card fluid className='board mt-24 mb-0'>
                                                                <List divided relaxed>
                                                                    <List.Item>
                                                                        <List.Content>
                                                                            <List.Header as='h2'>Token Address</List.Header>
                                                                            <List.Description as='p' className='address'>
                                                                                <a href={`${web3Service.explorer}address/${this.state.tokenAddress}`} target='_blank' rel='noopener noreferrer'>
                                                                                    {this.state.tokenAddress}
                                                                                </a>
                                                                            </List.Description>
                                                                        </List.Content>
                                                                    </List.Item>
                                                                    <List.Item>
                                                                        <List.Content>
                                                                            <Grid>
                                                                                <Grid.Column width={8}>
                                                                                    <List.Header as='h2'>Name</List.Header>
                                                                                    <List.Description as='p'>
                                                                                        {this.state.contractDetails.name}
                                                                                    </List.Description>
                                                                                </Grid.Column>
                                                                                <Grid.Column width={8}>
                                                                                    <List.Header as='h2'>Decimals</List.Header>
                                                                                    <List.Description as='p'>
                                                                                        {this.state.contractDetails.decimals}
                                                                                    </List.Description>
                                                                                </Grid.Column>
                                                                            </Grid>
                                                                        </List.Content>
                                                                    </List.Item>
                                                                    <List.Item>
                                                                        <List.Content>
                                                                            <Grid>
                                                                                <Grid.Column width={8}>
                                                                                    <List.Header as='h2'>Symbol</List.Header>
                                                                                    <List.Description as='p'>
                                                                                        {this.state.contractDetails.symbol}
                                                                                    </List.Description>
                                                                                </Grid.Column>
                                                                                <Grid.Column width={8}>
                                                                                    <List.Header as='h2'>Balance(approx.)</List.Header>
                                                                                    <List.Description as='p'>
                                                                                        {` ${this.printUserBalance} ${this.state.contractDetails.symbol}` }
                                                                                    </List.Description>
                                                                                </Grid.Column>
                                                                            </Grid>
                                                                        </List.Content>
                                                                    </List.Item>
                                                                </List>
                                                            </Card>
                                                        }
                                                        <div className='btnHolder'>
                                                            <Button className='ash curved-border wide-button' onClick={this.addTokenToWallet}>
                                                                Add Token to Web3 Wallet
                                                            </Button>
                                                        </div>
                                                    </div>
                                            }
                                        </Grid.Column>
                                    </Grid>
                                </div>
                                <div>
                                    <Route path="/:address/transfer" render={ props =>
                                        <Transactions
                                            balance={this.state.userBalance || '0'}
                                            symbol={this.state.contractDetails.symbol}
                                            isMobile={this.props.isMobile}
                                            isValidAddress={this.isValidAddress}
                                            parseTokenAmount={this.parseTokenAmount}
                                            updateTotalAmount={this.updateTotalAmount}
                                            setResetDetails={this.setResetDetails}
                                            setTransferDetailsFetcher={this.setTransferDetailsFetcher}
                                            setValidRecipientAddressesSet={this.setValidRecipientAddressesSet}
                                            setValidRecipientAmountsSet={this.setValidRecipientAmountsSet}
                                            canSend={this.canSend}
                                            sendingTokens={this.state.sendingTokens}
                                            transferTokens={this.transferTokens}
                                            totalRecipientsAmounts={this.state.totalRecipientsAmounts}
                                        />}
                                    />
                                    <Route path="/:address/approve" render={ props =>
                                        <Approvals
                                            balance={this.state.userBalance || '0'}
                                            symbol={this.state.contractDetails.symbol}
                                            isMobile={this.props.isMobile}
                                            isValidAddress={this.isValidAddress}
                                            parseTokenAmount={this.parseTokenAmount}
                                            updateTotalAmount={this.updateTotalAmount}
                                            setResetDetails={this.setResetDetails}
                                            setTransferDetailsFetcher={this.setTransferDetailsFetcher}
                                            setValidRecipientAddressesSet={this.setValidRecipientAddressesSet}
                                            setValidRecipientAmountsSet={this.setValidRecipientAmountsSet}
                                            canSend={this.canSend}
                                            sendingTokens={this.state.sendingTokens}
                                            transferTokens={this.transferTokens}
                                            totalRecipientsAmounts={this.state.totalRecipientsAmounts}
                                        />}
                                    />
                                </div>
                        </Container>
                    </div>
                }
                {super.render()}
            </Card>
        );
    }
}

Content.propTypes = {
    displayAddress: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    isMobile: PropTypes.bool.isRequired,
    match: PropTypes.object.isRequired,
    tokenLoadedFunc: PropTypes.func.isRequired
};
