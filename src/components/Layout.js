import React, { Component } from 'react';
import { Header, Container, Card } from 'semantic-ui-react';
import Footer from './Footer';
import Content from './Content';

export default class Layout extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        return(
            <Container style={{ marginTop: '3em' }}>
                <Header as='h3' dividing >Token Transfer Dapp</Header>
                <Card fluid header=''>
                    <Content/>
                </Card>
                <Footer/>
            </Container>
        );
    }

}