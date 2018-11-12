import Web3 from 'web3';
import EventEmitter from 'events';
import ethereumNode from '../config/ethereumNode';
import explorers from '../config/explorers';
import networks from '../config/networks';
import ERC20 from '../abi/ForeignToken';

class web3Service {

    constructor() {
        this.emitter = new EventEmitter();
        this.init();
    }

    initialized = false;
    isMetamsak = false;
    netId = null;
    accounts = null;
    accountsRejected = false;

    async init () {
        try {
            if (ethereumNode && typeof ethereumNode == 'string') {
                this._web3 = new Web3(
                    new Web3.providers.HttpProvider(ethereumNode)
                );
            } else if (window.ethereum) {
                this._web3 = new Web3(window.ethereum);
            } else if (window.web3) {
                // Default to metamask/injected web3
                this._web3 = new Web3(
                    Web3.givenProvider || window.web3.currentProvider
                );
            }
            this.isMetamask = this._web3.currentProvider.isMetaMask;
            this.netId = await this._web3.eth.net.getId().valueOf();
            this.initialized = true;
        } catch (e) {
            this.emitter.emit('error', e);
        }
    }

    async initAccounts () {
        if (this.checkingAccounts) {
            return;
        }
        this.checkingAccounts = true;
        if (!this.accounts) {
            try {
                if (window.ethereum) {
                    // Request account access if needed
                    await window.ethereum.enable();
                }
                this.accounts = await this._web3.eth.getAccounts();
                this.defaultAccount = this.accounts[0];
                this.accountsRejected = false;
            } catch (e) {
                if (e === 'User rejected provider access') {
                    this.accountsRejected = true;
                }
                this.emitter.emit('error', e);
            }
        }
        this.checkingAccounts = false;
    }

    async awaitInitialized() {
        const that = this;
        if (!this.initialized) {
            let Promises = new Promise((resolve) => {
                setTimeout(async function () {
                    resolve(await that.awaitInitialized());
                }, 2000);
            });
            return Promises;
        } else
            return true;
    }

    setdefaultAccount (address) {
        this.defaultAccount = address;
    }

    get explorer () {
        return explorers[this.netId || 0];
    }

    get network () {
        return networks[this.netId || 0];
    }

    get isWeb3Viewable() {
        return this._web3.isConnected();
    }

    get isWeb3Usable() {
        return (this._web3.isConnected() && typeof this.accounts !== 'undefined' && this.accounts !== null && this.accounts.length > 0);
    }

    async getAccountUpdates() {
        await this.awaitInitialized();
        let accountChanged;
        if (!this.accounts) {
            if (this.accountsRejected || this.checkingAccounts) {
                return false;
            }

            await this.initAccounts();
            return null !== this.accounts;
        } else {
            try {
                const accounts = await this._web3.eth.getAccounts();
                accountChanged = (!!this.accounts && this.accounts.length) !== (!!accounts && accounts.length) || !!this.accounts && typeof this.accounts.length === 'undefined' && this.accounts.some((account,id) => account !== accounts[id]);
                this.accounts = accounts;
                this.defaultAccount = this.accounts[0] || '';
            } catch (e) {
                this.emitter.emit('error', e);
            }
        }
        return accountChanged;
    }

    async getTokenName(tokenAddress) {
        await this.awaitInitialized();
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const name = await contract.methods.name().call();
        return name.valueOf();
    }

    async getTokenSymbol(tokenAddress) {
        await this.awaitInitialized();
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const symbol = await contract.methods.symbol().call();
        return symbol.valueOf();
    }

    async getTokenBalance(tokenAddress) {
        await this.awaitInitialized();
        const { _web3, defaultAccount } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const balance = await contract.methods.balanceOf(defaultAccount).call();
        return balance.valueOf();
    }

    async getTokenDecimals(tokenAddress) {
        await this.awaitInitialized();
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const balance = await contract.methods.decimals().call();
        return balance.valueOf();
    }

    async transferTokens(tokenAddress, recipient, amount, { onTransactionHash, onReceipt }) {
        await this.awaitInitialized();
        await this.initAccounts();
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        await contract.methods.transfer(recipient,amount).send()
            .on('transactionHash', onTransactionHash)
            .on('receipt', onReceipt);
    }
}

export default new web3Service();