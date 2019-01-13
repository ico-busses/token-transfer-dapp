# token transfer dapp
Easy and optimized erc20 token transfer dapp  
A decentralized dapp, to make quick ERC20, enabled tokens transfer  
https://ttd.icobusses.io/
  
  
[![Build Status](https://travis-ci.org/ico-busses/token-transfer-dapp.svg?branch=master)](https://travis-ci.org/ico-busses/token-transfer-dapp) 
  
The Dapp loads up the Token details from the token Address you provide. It handles Decimal calulations in the background.
All you need is the Token contract address.  
Preloads token list from [Metamask Tokens Database](https://github.com/MetaMask/eth-contract-metadata)  
Muliple transfers is done throgh Javascript only, and as such, you have to confirm Metamask for each transfer.
 
* Presently, it only works with [Metamask](htps://metamask.io) and similar Web3 enabled browsers. If we receive enough requests, we would add support for other wallet types

#### Usage  
- Get the address of the token you wish to interact with
- Login to Metamask and load up the Dapp
- Put the adddress in the `contract address` input field on the Dapp
- Let the Dapp run its Magic, to load up the contract informaation
- You are good to go, and can carry out your transfers

#### Setup  
- Clone the repo
- run `npm install`
- run `npm start`

#### Issues/Contribute/Feature request
https://github.com/ico-busses/token-transfer-dapp/issues
  


#### Live Url
https://ttd.icobusses.io/