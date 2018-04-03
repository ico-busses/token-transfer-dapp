import React, { Component } from 'react';
import { Divider, Grid } from 'semantic-ui-react';
import { footerStyle } from '../styles';

export default class Footer extends Component {

    render() {
        return (
            <div>
                <Divider />
                <Grid centered columns={2} style={footerStyle.base} >
                    <Grid.Column floated='left' >
                        Contribute :: 
                        <b>
                            ETH - 0x965d1c9987bd2c34e151e63d60aff8e9db6b1561
                        </b>
                    </Grid.Column>
                    <Grid.Row >
                        Powered by :
                        <a target='_blank' href='https://github.com/ico-busses' rel="noopener noreferrer">: ICO BUSSES</a> .
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}