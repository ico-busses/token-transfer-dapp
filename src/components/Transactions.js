import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { web3Service } from '../services';
import ContractMap from 'eth-contract-metadata';
import { Header, Divider, Grid, Card, Form, Button, Label, List, Dimmer, Loader, Search } from 'semantic-ui-react';
import { contentStyle } from '../styles';
import HasAlert from './HasAlert';

const ContractMapAddresses = Object.keys(ContractMap);

export default class Transactions extends HasAlert {

    constructor (props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.setMaxValue = this.setMaxValue.bind(this);
    }

    state = {
        recipientAddress: '',
        recipientAmount: '',
        recipientAddresses: [],
        recipientAmounts: []
    }

    isValidRecipientAmountSet(index) {
        let total = new BigNumber(0);
        this.state.recipientAmounts((amount, ind) => ind < index ? total = total.plus(amount) : null );
        return total.lte(this.props.balance);
    }

    remainingBalance () {
        return this.props.balance.minus(this.recipientAmounts.reduce(a,b => a+b));
    }

    updateArray(array, index, value) {
        return array.map((val, ind) => ind !== index ? val : value);
    }

    setMaxValue(index) {
        if (typeof index === 'undefined') {
            this.setState({ recipientAmount: this.props.parseTokenAmount(this.props.balance).toNumber() });
        } else {
            this.setState({ recipientAmounts: this.updateArray(this.state.recipientAmounts, index, this.props.parseTokenAmount(this.props.balance).toNumber()) });
        }
    }

    onChange = (property, index) => (event) => {
        const { target } = event;
        if (typeof index === 'undefined') {
            this.setState({ [property]: target.value });
        } else {
            this.setState({ [property]: this.updateArray(state[property], index, target.value) });
        }
    }

    render () {
        return (
            <div>
                { this.state.recipientAddresses.map( (address, index) =>
                    <Grid.Row>
                        <Grid.Column>
                            <Form.Field error={this.props.isValidAddress(address)} >
                                <Form.Input
                                    placeholder='Address'
                                    value={this.state.recipientAddresses[index]}
                                    onChange={this.onChange('recipientAddresses', index)}
                                    onKeyUp={this.onChange('recipientAddresses', index)}
                                    onBlur={this.onChange('recipientAddresses', index)}
                                />
                            </Form.Field>
                            <Form.Field error={this.isValidRecipientAmountSet(index)} >
                                <Form.Input
                                    placeholder={`${this.props.symbol}s to send`}
                                    value={this.state.recipientAmountS[inde]}
                                    onChange={this.onChange('recipientAmounts', index)}
                                    onKeyUp={this.onChange('recipientAmounts', index)}
                                    onBlur={this.onChange('recipientAmounts', index)}
                                />
                                <a onClick={this.setMaxValue(index)} style={contentStyle.entire} >
                                    Send remaining Balance
                                </a>
                            </Form.Field>
                        </Grid.Column>
                    </Grid.Row>
                )}
                <Form.Field error={Boolean(this.state.recipientAddress && this.state.recipientAddress) && !this.props.isValidAddress(this.state.recipientAddress)} >
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
                        placeholder={`${this.props.symbol}s to send`}
                        value={this.state.recipientAmount}
                        onChange={this.onChange('recipientAmount')}
                        onKeyUp={this.onChange('recipientAmount')}
                        onBlur={this.onChange('recipientAmount')}
                    />
                    <a onClick={this.setMaxValue} style={contentStyle.entire} >
                        Send remaining Balance
                    </a>
                </Form.Field>
            </div>
        );
    }
};

Transactions.propTypes = {
    isValidAddress: PropTypes.func.isRequired,
    parseTokenAmount: PropTypes.func.isRequired,
    symbol: PropTypes.string.isRequired
}