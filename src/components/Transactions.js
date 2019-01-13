import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { Checkbox, Header, Grid, Form, Icon, Button } from 'semantic-ui-react';
import { contentStyle } from '../styles';

export default class Transactions extends Component {

    constructor (props) {
        super(props);
        this.props.setTransferDetailsFetcher(this.fetchTransferDetails.bind(this));
        this.props.setResetDetails(this.resetDetails.bind(this));

        this.onChange = this.onChange.bind(this);
        this.setMaxValue = this.setMaxValue.bind(this);
        this.toggleBatch = this.toggleBatch.bind(this);
        this.addToArray = this.addToArray.bind(this);
        this.validateForm = this.validateForm.bind(this);
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
        let total = new BigNumber(0);
        if (this.state.recipientAddresses.length > 0) {
            this.state.recipientAmounts.map((a) => {
                total = total.plus(this.props.parseTokenAmount(a || 0, false));
            });
        }
        total = total.plus(this.props.parseTokenAmount(this.state.recipientAmount || 0, false));
        return  total.valueOf();
    }

    isValidRecipientAmountSet(index) {
        let isValid = true;
        const value = typeof index === 'undefined' ? this.state.recipientAmount : this.state.recipientAmounts[index];

        if (new RegExp('^\\d+\\.?\\d*$').test(value) && Number(value) > 0) {
            let total = new BigNumber(0);
            if (typeof index === 'undefined') {
                index = this.state.recipientAmounts.length;
            }
            this.state.recipientAmounts.map((amount, ind) => ind < index ? total = total.plus(this.props.parseTokenAmount(amount ||0, false)) : null );
            total = total.plus(this.props.parseTokenAmount(value || 0, false));
            isValid = total.lte(new BigNumber(this.props.balance));
        } else {
            isValid = false;
        }
        return isValid;
    }

    remainingBalance () {
        return new BigNumber(this.totalAmount).lte(this.props.balance) ? new BigNumber(this.props.balance).minus(this.totalAmount) : new BigNumber(0);
    }

    updateArray(array, index, value) {
        return array.map((val, ind) => ind !== index ? val : value);
    }

    toggleBatch () {
        if (this.state.isBatch) {
            const address = this.state.recipientAddresses[0] || this.state.recipientAddress;
            const amount = this.state.recipientAmounts[0] || this.state.recipientAmount;
            this.setState({
                isBatch: !this.state.isBatch,
                recipientAddress: address,
                recipientAmount: amount,
                recipientAddresses: [],
                recipientAmounts: []
            });
        } else {
            this.setState({ isBatch: !this.state.isBatch });
        }
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

    validateAddresses () {
        let isValid = true;
        if (this.state.recipientAddresses.length > 0) {
            this.state.recipientAddresses.map( address => {
                if (!this.props.isValidAddress (address)) {
                    isValid = false;
                }
            });
        }
        if (
            (this.state.recipientAddress || this.state.recipientAmount || (this.state.recipientAddresses.length === 0 && !this.state.recipientAddress)) &&
            (!this.props.isValidAddress(this.state.recipientAddress) || this.state.recipientAddresses.includes(this.state.recipientAddress))
        ) {
            isValid = false;
        }
        this.props.setValidRecipientAddressesSet(isValid);
    }

    validateAmounts () {
        let isValid = true;
        if (this.state.recipientAmounts.length > 0) {
            this.state.recipientAmounts.map( value => {
                if (!new RegExp('^\\d+\\.?\\d*$').test(value) || Number(value) <= 0) {
                    isValid = false;
                }
            });
        }
        if ((this.state.recipientAmount || this.state.recipientAddress) && (!new RegExp('^\\d+\\.?\\d*$').test(this.state.recipientAmount) || Number(this.state.recipientAmount) <= 0)) {
            isValid = false;
        }
        this.props.setValidRecipientAmountsSet(isValid);
    }

    validateForm () {
        this.validateAddresses();
        this.validateAmounts();
    }

    resetDetails () {
        this.setState ({
            recipientAddress: '',
            recipientAmount: '',
            recipientAddresses: [],
            recipientAmounts: []
        });
    }

    fetchTransferDetails () {
        if (this.state.recipientAddresses.length !== this.state.recipientAmounts.length) {
            return false;
        }
        const addresses = [].concat(this.state.recipientAddresses);
        const amounts = [].concat(this.state.recipientAmounts);
        if (this.props.isValidAddress(this.state.recipientAddress)) {
            addresses.push(this.state.recipientAddress);
            amounts.push(this.state.recipientAmount);
        }
        return {
            addresses,
            amounts
        };
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
        let value = typeof index === 'undefined' ? this.state.recipientAmount : this.state.recipientAmounts[index];
        value = this.props.parseTokenAmount(value || 0, false);
        if (new BigNumber(this.totalAmount).lte(this.props.balance)) {
            value = this.remainingBalance().plus(value);
        } else {
            const others = new BigNumber(this.totalAmount).minus(value);
            if (others.lte(this.props.balance)) {
                value = new BigNumber(this.props.balance).minus(others);
            } else {
                value = new BigNumber(0);
            }
        }
        if (typeof index === 'undefined') {
            this.setState({
                recipientAmount: this.props.parseTokenAmount(value).toNumber()
            }, () => {
                this.props.updateTotalAmount(this.props.parseTokenAmount(this.totalAmount));
                this.validateForm();
        });
        } else {
            this.setState({
                recipientAmounts: this.updateArray(this.state.recipientAmounts, index, this.props.parseTokenAmount(value).toNumber())
            }, () => {
                this.props.updateTotalAmount(this.props.parseTokenAmount(this.totalAmount));
                this.validateForm();
            });
        }
    }

    onChange = (property, index) => (event) => {
        const { target } = event;
        if (typeof index === 'undefined') {
            this.setState({ [property]: target.value }, () => {
                this.validateForm();
            });
        } else {
            this.setState({ [property]: this.updateArray(this.state[property], index, target.value) }, () => {
                this.validateForm();
            });
        }
        const amountFields = ['recipientAmount', 'recipientAmounts'];
        if (amountFields.includes(property)) {
            this.props.updateTotalAmount(this.props.parseTokenAmount(this.totalAmount));
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
                                <Grid.Column width={1} style={{ paddingLeft: '0' }}>
                                    <Button icon basic color='red' onClick={this.removeFromArray(index)} title='Remove address'>
                                        <Icon name='delete' style={contentStyle.iconButton}  />
                                    </Button>
                                </Grid.Column>
                            </Grid>
                        )}
                        <Grid columns={3} style={contentStyle.contentRow}>
                            <Grid.Column width={9}>
                                <Form.Field error={Boolean(this.state.recipientAddress) && (!this.props.isValidAddress(this.state.recipientAddress) || this.state.recipientAddresses.includes(this.state.recipientAddress))} >
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
                            <Grid.Column width={1} style={{ paddingLeft: '0' }}>
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
            </div>
        );
    }
}

Transactions.propTypes = {
    balance: PropTypes.string.isRequired,
    isValidAddress: PropTypes.func.isRequired,
    parseTokenAmount: PropTypes.func.isRequired,
    updateTotalAmount: PropTypes.func.isRequired,
    setResetDetails: PropTypes.func.isRequired,
    setTransferDetailsFetcher: PropTypes.func.isRequired,
    setValidRecipientAddressesSet: PropTypes.func.isRequired,
    setValidRecipientAmountsSet: PropTypes.func.isRequired,
    symbol: PropTypes.string.isRequired
};