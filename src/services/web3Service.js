import Web3 from 'web3';
import EventEmitter from 'events';
import { ethereumNode, explorers, fnSignatures, networks } from '../config';
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

    async addToWallet (options = {}) {
        const { address, symbol, decimals, image } = options;
        try {
            if (!address || !symbol || (!decimals && decimals !== 0)) {
                throw 'Incorrect Token details';
            }
            const rpcRequest = this.craftRpcCall (
                'wallet_watchAsset',
            );

            const rpcOptions = { address, symbol, decimals };
            image ? rpcOptions.image = image : null;

            rpcRequest.params = {
                type: 'ERC20',
                options: rpcOptions
            };

            const send = this.getProviderSend();
            const rpcCall = await new Promise ((resolve, reject) => {
                send(
                    rpcRequest, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        resolve (data);
                });
            });
            if (rpcCall.error) {
                throw rpcCall.error;
            }
            return rpcCall.result;
        } catch (e) {
            this.emitter.emit('error', e);
        }
    }

    getProviderSend () {
        const provider =this._web3.givenProvider || this._web3.currentProvider;
        return provider.sendAsync || provider.send;
    }

    getFunctionSignature (fn) {
        return this._web3.utils.sha3(fn).substring(0,10);
    }

    cleanConvertedHex(val) {
        /*eslint no-control-regex: "off"*/
        const regPtrn = new RegExp(/\u0000/g);
        return val.replace(regPtrn,'');
    }

    craftRpcCall (method, args=[]) {
        const rpcObject = {
            jsonrpc: '2.0',
            method: method,
            id: new Date().getTime()
        };
        if (args.length > 0) {
            rpcObject.params = args;
        }
        return rpcObject;
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
        return this.initialized && this._web3 && !!(this._web3.givenProvider || this._web3.currentProvider);
    }

    get isWeb3Usable() {
        return (this.isWeb3Viewable && typeof this.accounts !== 'undefined' && this.accounts !== null && this.accounts.length > 0);
    }

    async fetchRpcCall (fn, { to, from, data, value, gas, gasPrice }, args=[]) {
        const send = this.getProviderSend();
        const rpcRequest = {
            to,
            data: data || '0x'
        };

        if (from) {
            rpcRequest.from = from;
        }

        if (value) {
            rpcRequest.value = value;
        }

        if (gas) {
            rpcRequest.gas = gas;
        }

        if (gasPrice) {
            rpcRequest.gasPrice = gasPrice;
        }

        if (!args || typeof args !== 'object') {
            args = [];
        }
        args.unshift(rpcRequest);

        const rpcCall = await new Promise ((resolve, reject) => {
            send(this.craftRpcCall('eth_call', args), function (err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
        if (rpcCall.error) {
            throw rpcCall.error;
        }
        return rpcCall.result;
    }

    async getAccountUpdates() {
        if (!this.initialized) {
            return false;
        }
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
        try {
            const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
            const name = await contract.methods.name().call();
            return name.toString();
        } catch (e) {
            const signature = this.getFunctionSignature(fnSignatures.tokenName);
            const rpcCall = await this.fetchRpcCall(
                'eth_call',
                {
                    to: tokenAddress,
                    data: signature
                }
            );
            return this.cleanConvertedHex(_web3.utils.toAscii(rpcCall)).toString();
        }
    }

    async getTokenSymbol(tokenAddress) {
        await this.awaitInitialized();
        const { _web3 } = this;
        try {
            const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
            const symbol = await contract.methods.symbol().call();
            return symbol.toString();
        } catch (e) {
            const signature = this.getFunctionSignature(fnSignatures.tokenSymbol);
            const rpcCall = await this.fetchRpcCall(
                'eth_call',
                {
                    to: tokenAddress,
                    data: signature
                }
            );
            return this.cleanConvertedHex(_web3.utils.toAscii(rpcCall)).toString();
        }
    }

    async getTokenDecimals(tokenAddress) {
        await this.awaitInitialized();
        const { _web3 } = this;
        try {
            const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
            const decimals = await contract.methods.decimals().call();
            return decimals.toString();
        } catch (e) {
            const signature = this.getFunctionSignature(fnSignatures.tokenDecimals);
            const rpcCall = await this.fetchRpcCall(
                'eth_call',
                {
                    to: tokenAddress,
                    data: signature
                }
            );
            return Number(_web3.utils.toDecimal(rpcCall));
        }
    }

    async getTokenBalance(tokenAddress) {
        await this.awaitInitialized();
        const { _web3, defaultAccount } = this;
        if (!this.isWeb3Usable) {
            return;
        }
        const contract = new _web3.eth.Contract(ERC20, tokenAddress, { from: this.defaultAccount });
        const balance = await contract.methods.balanceOf(defaultAccount).call();
        return balance.toString();
    }

    async transferTokens(tokenAddress, recipient, amount, { onTransactionHash, onReceipt }) {
        await this.awaitInitialized();
        await this.initAccounts();
        if (!this.isWeb3Usable) {
            return;
        }
        const { _web3 } = this;
        const contract = new _web3.eth.Contract(ERC20, tokenAddress);
        await new Promise((resolve, reject) => {
            const tx = contract.methods.transfer(recipient,amount).send({ from: this.defaultAccount });


            tx.on('error', e => reject(e.message || e));
            tx.once('receipt', r => onReceipt(r));
            tx.once('transactionHash', (hash)=> {
                onTransactionHash(hash);
                resolve(hash);
            });
            // tx.then(r => console.log(r) || onReceipt(r));
        });
    }
}

export default new web3Service();