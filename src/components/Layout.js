import React, { Component } from 'react'
import { Header, Container } from 'semantic-ui-react'

export default class Layout extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        return(
            <Container style={{ marginTop: '3em' }}>
                <Header as='h1'>Theming Examples</Header>
            </Container>
        );
    }

}