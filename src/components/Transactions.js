import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { web3Service } from '../services';
import ContractMap from 'eth-contract-metadata';
import { Checkbox, Header, Divider, Grid, Card, Form, Icon, Button, Label, List, Dimmer, Loader, Search } from 'semantic-ui-react';
import { contentStyle } from '../styles';
import HasAlert from './HasAlert';

const ContractMapAddresses = Object.keys(ContractMap);

export default class Transactions extends HasAlert {

    constructor (props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.setMaxValue = this.setMaxValue.bind(this);
        this.toggleBatch = this.toggleBatch.bind(this);
        this.addToArray = this.addToArray.bind(this);
        this.removeFromArray = this.removeFromArray.bind(this);
        this.remainingBalance = this.remainingBalance.bind(this);
        this.isValidRecipientAmountSet = this.isValidRecipientAmountSet.bind(this);
    }

    state = {
        isBatch: false,
        recipientAddress: '',
        recipientAmount: '',
        recipientAddresses: [],
        recipientAmounts: []
    }

    get totalAmount () {
        return this.state.recipientAddresses.length > 0 ? new BigNumber(this.state.recipientAmounts.reduce((a,b) => a+b)).plus(this.state.recipientAmount || 0).toNumber() : new BigNumber(this.state.recipientAmount || 0).toNumber();
    }

    isValidRecipientAmountSet(index) {
        let isValid = true;
        const value = typeof index === 'undefined' ? this.state.recipientAmount : this.state.recipientAmounts[index];
        if (new RegExp('^\\d+\\.?\\d*$').test(value) && Number(value) > 0) {
        let total = new BigNumber(0);
            if (typeof index === 'undefined') {
                index = this.state.recipientAmounts.length;
    }
            this.state.recipientAmounts.map((amount, ind) =>console.log(ind, index) || ind < index ? total = total.plus(amount) : null );
            total.plus(value);
            isValid = total.lte(new BigNumber(this.props.balance));
        } else {
            isValid = false;
        }
        return isValid;

    }

    remainingBalance () {
        const total = this.state.recipientAddresses.length > 0 ? new BigNumber(this.state.recipientAmounts.reduce((a,b) => a+b)).plus(this.state.recipientAmount || 0).toNumber() : new BigNumber(this.state.recipientAmount || 0).toNumber();
        return new BigNumber(this.props.balance).minus(total);
    }

    updateArray(array, index, value) {
        return array.map((val, ind) => ind !== index ? val : value);
    }

    toggleBatch () {
        this.setState({ isBatch: !this.state.isBatch });
    }

    addToArray () {
        if (this.state.recipientAddresses.length > 0 && this.state.recipientAddresses.includes(this.state.recipientAddress)) {
            return false;
        }
        const length = this.state.recipientAddresses.length;
        const addresses = this.state.recipientAddresses;
        const amounts = this.state.recipientAmounts;
        addresses[length] = this.state.recipientAddress;
        amounts[length] = this.state.recipientAmount;

        this.setState({
            recipientAddresses: addresses,
            recipientAmounts: amounts,
            recipientAddress: '',
            recipientAmount: ''
        });
    }

    removeFromArray = (index) => () => {
        const addresses = this.state.recipientAddresses;
        const amounts = this.state.recipientAmounts;
        addresses.splice(index, 1);
        amounts.splice(index, 1);

        this.setState({
            recipientAddresses: addresses,
            recipientAmounts: amounts
        });
    }

    setMaxValue = (index) => () => {
        if (typeof index === 'undefined') {
            this.setState({ recipientAmount: this.props.parseTokenAmount(this.remainingBalance().plus(this.state.recipientAmount || 0)).toNumber() }, () => {
                this.props.updateTotalAmount(this.totalAmount);
        });
        } else {
            this.setState({ recipientAmounts: this.updateArray(this.state.recipientAmounts, index, this.props.parseTokenAmount(this.remainingBalance().plus(this.recipientAmounts[index] || 0)).toNumber()) }, () => {
                this.props.updateTotalAmount(this.totalAmount);
            });
        }
    }

    onChange = (property, index) => (event) => {
        const { target } = event;
        if (typeof index === 'undefined') {
            this.setState({ [property]: target.value });
        } else {
            this.setState({ [property]: this.updateArray(this.state[property], index, target.value) });
        }
        const amountFields = ['recipientAmount', 'recipientAmounts'];
        if (amountFields.includes(property)) {
            this.props.updateTotalAmount(this.totalAmount);
        }
    }

    render () {
        return (
            <div>
                <Grid.Row>
                    <Grid.Column style={contentStyle.slider}>
                        <Checkbox slider checked={this.state.isBatch} onChange={this.toggleBatch} label='Multiple transfers' />
                    </Grid.Column>
                </Grid.Row>
                { this.state.isBatch &&
                    <div>
                        <Grid columns={3} >
                            <Grid.Column width={9}>
                                    <Header as='h4' >
                                        To Address
                                    </Header>
                            </Grid.Column>
                            <Grid.Column width={6}>
                                    <Header as='h4' >
                                        Amount to send
                                    </Header>
                            </Grid.Column>
                            <Grid.Column width={1}>
                            </Grid.Column>
                        </Grid>
                        { this.state.recipientAddresses.map( (address, index) =>
                            <Grid columns={3} key={address} style={contentStyle.contentRow}>
                                <Grid.Column width={9}>
                                    <Form.Field error={Boolean(address) && !this.props.isValidAddress(address)} >
                                        <Form.Input
                                            placeholder='Address'
                                            value={this.state.recipientAddresses[index]}
                                    onChange={this.onChange('recipientAddresses', index)}
                                    onKeyUp={this.onChange('recipientAddresses', index)}
                                            onBlur={this.onChange('recipientAddresses', index)}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={6}>
                                    <Form.Field error={Boolean(this.state.recipientAmounts[index]) && !this.isValidRecipientAmountSet(index)} >
                                        <Form.Input
                                            placeholder={`${this.props.symbol}s to send`}
                                            value={this.state.recipientAmounts[index]}
                                            onChange={this.onChange('recipientAmounts', index)}
                                            onKeyUp={this.onChange('recipientAmounts', index)}
                                            onBlur={this.onChange('recipientAmounts', index)}
                                            action={<Button icon color='blue' onClick={this.setMaxValue(index)} title='Send remaining Balance'>
                                                    <Icon name='suitcase'/>
                                                </Button>}
                                        />
                                    </Form.Field>
                                </Grid.Column>
                                <Grid.Column width={1} style={{paddingLeft: '0'}}>
                                    <Button icon basic color='red' onClick={this.removeFromArray(index)} title='Remove address'>
                                        <Icon name='delete' style={contentStyle.iconButton}  />
                                    </Button>
                                </Grid.Column>
                            </Grid>
                        )}
                        <Grid columns={3} style={contentStyle.contentRow}>
                            <Grid.Column width={9}>
                                <Form.Field error={Boolean(this.state.recipientAddress && this.state.recipientAddress) && !this.props.isValidAddress(this.state.recipientAddress)} >
                                    <Form.Input
                                        placeholder='Address'
                                        value={this.state.recipientAddress}
                                        onChange={this.onChange('recipientAddress')}
                                        onKeyUp={this.onChange('recipientAddress')}
                                        onBlur={this.onChange('recipientAddress')}
                                    />
                                </Form.Field>
                            </Grid.Column>
                            <Grid.Column width={6}>
                                <Form.Field error={Boolean(this.state.recipientAmount) && !this.isValidRecipientAmountSet()} >
                                    <Form.Input
                                        placeholder={`${this.props.symbol}s to send`}
                                        value={this.state.recipientAmount}
                                        onChange={this.onChange('recipientAmount')}
                                        onKeyUp={this.onChange('recipientAmount')}
                                        onBlur={this.onChange('recipientAmount')}
                                        action={<Button icon color='blue' onClick={this.setMaxValue()} title='Send remaining Balance'>
                                                <Icon name='suitcase'/>
                                            </Button>}
                                    />
                                </Form.Field>
                            </Grid.Column>
                            <Grid.Column width={1} style={{paddingLeft: '0'}}>
                                <Button icon basic color='teal' onClick={this.addToArray} title='Add new address'>
                                    <Icon name='plus' style={contentStyle.iconButton}  />
                                </Button>
                            </Grid.Column>
                        </Grid>
                    </div>
                }
                { !this.state.isBatch &&
                    <div>
                        <Form.Field error={Boolean(this.state.recipientAddress) && !this.props.isValidAddress(this.state.recipientAddress)} >
                            <label>To Address: </label>
                            <Form.Input
                                placeholder='Address'
                        value={this.state.recipientAddress}
                        onChange={this.onChange('recipientAddress')}
                        onKeyUp={this.onChange('recipientAddress')}
                                onBlur={this.onChange('recipientAddress')}
                            />
                        </Form.Field>
                        <Form.Field error={Boolean(this.state.recipientAmount) && !this.isValidRecipientAmountSet()} >
                            <label>Amount to send</label>
                            <Form.Input
                                placeholder={`${this.props.symbol}s to send`}
                        value={this.state.recipientAmount}
                        onChange={this.onChange('recipientAmount')}
                                onKeyUp={this.onChange('recipientAmount')}
                                onBlur={this.onChange('recipientAmount')}
                            />
                            <a onClick={this.setMaxValue()} style={contentStyle.entire} >
                                Send remaining Balance
                            </a>
                        </Form.Field>
                    </div>
                }
                {super.render()}
            </div>
        );
    }
};

Transactions.propTypes = {
    balance: PropTypes.string.isRequired,
    isValidAddress: PropTypes.func.isRequired,
    parseTokenAmount: PropTypes.func.isRequired,
    updateTotalAmount: PropTypes.func.isRequired,
    setValidRecipientAddressesSet: PropTypes.func.isRequired,
    setValidRecipientAmountsSet: PropTypes.func.isRequired,
    symbol: PropTypes.string.isRequired
}