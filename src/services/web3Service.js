import Web3 from 'web3';
import Bb from 'bluebird';
import ethereumNode from '../config/ethereumNode';
import explorers from '../config/explorers';
import networks from '../config/networks';
import ERC20 from '../abi/ForeignToken';

class web3Service {

    constructor() {
        this.init();
    }

    initialized = false;
    isMetamsak = false;
    netId = null;
    accounts = null;

    async init () {
        if (ethereumNode && typeof ethereumNode == 'string') {
            this._web3 = new Web3(
                new Web3.providers.HttpProvider(ethereumNode)
            );
        } else {
            // Default to metamask/injected web3
            this._web3 = new Web3(
                Web3.givenProvider || window.web3.currentProvider
            );
            this.isMetamsak = true;
        }
        this.netId = (await Bb.fromCallback(callback => this._web3.eth.net.getId(callback))).valueOf();
        this.accounts = await Bb.fromCallback(callback => this._web3.eth.getAccounts(callback));
        this.defaultAccount = this.accounts[0];
        this.initialized = true;
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
        const accounts = await Bb.fromCallback(callback => this._web3.eth.getAccounts(callback));
        const accountChanged = this.accounts.length !== accounts.length || (this.accounts.length > 0 && this.accounts[0] !== accounts[0]);
        if (accountChanged) {
            this.accounts = accounts;
            this.defaultAccount = this.accounts[0] || '';
        }
        return accountChanged;
    }

    async getTokenName(tokenAddress) {
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const name = (await Bb.fromCallback(callback => contract.methods.name().call(callback)));
        return name.valueOf();
    }

    async getTokenSymbol(tokenAddress) {
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const symbol = (await Bb.fromCallback(callback => contract.methods.symbol().call(callback)));
        return symbol.valueOf();
    }

    async getTokenBalance(tokenAddress) {
        const { _web3, defaultAccount } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const balance = await Bb.fromCallback(callback => contract.methods.balanceOf(defaultAccount).call(callback));
        return balance.valueOf();
    }

    async getTokenDecimals(tokenAddress) {
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const balance = await Bb.fromCallback(callback => contract.methods.decimals().call(callback));
        return balance.valueOf();
    }

    async transferTokens(tokenAddress, recipient, amount) {
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const transaction = await Bb.fromCallback(callback => contract.methods.transfer(recipient,amount).send(callback));
        return transaction;
    }
}

export default new web3Service();