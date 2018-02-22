import React, { Component } from 'react'
import { Header } from 'semantic-ui-react'

export default class Layout extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        <Container style={{ marginTop: '3em' }}>
            <Header as='h1'>Theming Examples</Header>
        </Container>
    }

}