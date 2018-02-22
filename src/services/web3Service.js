import Web3 from 'web3';
import Bb from 'bluebird';
import ethereumNode from '../config/ethereumNode';
import explorers from '../config/explorers';
import networks from '../config/networks';
import ERC20 from '../abi/ForeignToken';

let _instance;


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
        console.log(this)
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

    async getTokenName(tokenAddress) {
        const { _web3 } = this;
        const contract = _web3(ERC20).at(tokenAddress);
        const name = (await Bb.fromCallback(callback => contract.name(callback)));
        return name.valueOf();
    }

    async getTokenSymbol(tokenAddress) {
        const { _web3 } = this;
        const contract = _web3(ERC20).at(tokenAddress);
        const symbol = (await Bb.fromCallback(callback => contract.name(callback)));
        return symbol.valueOf();
    }

    async getTokenBalance(tokenAddress ) {
        const { _web3, defaultAccount } = this;
        const contract = _web3(ERC20).at(tokenAddress);
        const balance = await Bb.fromCallback(callback => contract.balanceOf(defaultAccount,callback));
        return balance.valueOf();
    }


}

const instantiate = ()=>{
    if (_instance) {
        _instance;
    } else {
        _instance = new web3Service ();
        return _instance;
    }
}


export default instantiate();