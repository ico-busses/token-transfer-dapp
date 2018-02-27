import React, { Component } from 'react';
import { web3Service } from '../services';
import { Divider, Grid, Card, Form, Input, Label } from 'semantic-ui-react';
import { contentStyle } from '../styles';

export default class Layout extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    state = {
        fetchingContract: true,
        tokenLoaded: true,
        tokenAddress: '',
        contractDetails: {}
    }

    isValidAddress (){
        web3Service._web3
        return web3.isValidAddress(this.state.tokenAddress);
    }

    onChange = (property) => (event) => {
        console.log(property,event)
        const { target } = event;
        this.setState({ tokenAddress: target.value });
    }

    render() {
        return (
            <Card fluid >
                <Card.Header style={contentStyle.main}>
                    <Grid rows={2} stackable divided>
                        <Grid.Column stretched width={6} >
                            <Form.Field >
                                <Input 
                                    label = 'Address'
                                    loading = { this.state.fetchingContract }
                                    value = { this.state.tokenAddress }
                                    onChange = { this.onChange('tokenAddress') }
                                    color = { this.state.tokenAddress && !this.isValidAddress?'red':'' }
                                    placeholder = 'Contract Address' />
                            </Form.Field>
                        </Grid.Column>
                        <Grid.Column stretched >
                            <Form.Field>
                                <Input
                                    label='Address'
                                    loading={this.state.fetchingContract}
                                    value={this.state.tokenAddress}
                                    onChange={this.onChange('tokenAddress')}
                                    color={this.state.tokenAddress && !this.isValidAddress ? 'red' : ''}
                                    placeholder='Contract Address' />
                            </Form.Field>
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