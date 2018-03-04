import React, { Component } from 'react';
import { web3Service } from '../services';
import { Divider, Grid, Card, Form, Label, List } from 'semantic-ui-react';
import { contentStyle } from '../styles';

export default class Layout extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    state = {
        fetchingContract: false,
        tokenLoaded: false,
        tokenAddress: '',
        contractDetails: {}
    }

    isValidTokenAddressSet (){
        return web3Service._web3.isAddress(this.state.tokenAddress);
    }

    next () {


    }

    onChange = (property) => (event) => {
        console.log(property,event)
        const { target } = event;
        this.setState({ tokenAddress: target.value });
        this.next();
    }

    render() {
        return (
            <Card fluid >
                <Card.Header style={contentStyle.main}>
                    <Grid rows={2} stackable divided padded='horizontally'>
                        <Grid.Column width={8} verticalAlign='middle'>
                            <Form.Input fluid
                                    loading={this.state.fetchingContract}
                                    value={this.state.tokenAddress}
                                    onChange={this.onChange('tokenAddress')}
                                    error={Boolean(this.state.tokenAddress) && !this.isValidTokenAddressSet()}
                                    placeholder='Contract Address' />
                        </Grid.Column>
                        <Grid.Column width={8}>
                            {
                                (this.state.fetchingContract || this.state.tokenLoaded ) &&
                            <List>
                                <List.Item>
                                    <Label pointing='right'>Token Address</Label>
                                        {this.state.tokenAddress}
                                </List.Item>
                                <List.Item>
                                    <Label pointing='right'>Name</Label>
                                        {this.state.contractDetails.name}
                                </List.Item>
                                <List.Item>
                                    <Label pointing='right'>Symbol</Label>
                                        {this.state.contractDetails.symbol}
                                </List.Item>
                                <List.Item>
                                    <Label pointing='right'>Decimals</Label>
                                        {this.state.contractDetails.decimals}
                                </List.Item>
                            </List>
                            }
                        </Grid.Column>
                    </Grid>
                    {
                        this.state.tokenLoaded && 
                        <div>
                            <Divider />
                            
                        </div>
                    }
                </Card.Header>
                
            </Card>
        );
    }

}