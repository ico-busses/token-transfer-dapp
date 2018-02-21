import Web3 from 'web3';
import Bb from 'bluebird';
import ethereumNode from '../config/ethereumNode';

let _instance;


class web3Service {

    constructor() {
        this.init();
    }

    initialized = false;
    isMetamsak = false;
    netId = null;
    accounts = null;

    init () {
        console.log(ethereumNode)
        if (ethereumNode && typeof ethereumNode == 'string') {
            this._web3 = new Web3(
                new Web3.providers.HttpProvider(ethereumNode)
            );
        } else {
            // Default to metamask/injected web3
            console.log(Web3.givenProvider,window.web3)
            this._web3 = new Web3(
                
            );
        }

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