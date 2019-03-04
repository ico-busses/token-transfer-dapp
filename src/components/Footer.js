import React, { Component } from 'react';
import { Divider, Grid, Header, Image } from 'semantic-ui-react';
import { footerStyle } from '../styles';
import { features } from '../config';

export default class Footer extends Component {

    render() {
        return (
            <div>
                <Divider />
                <Grid columns={2} divided>
                    <Grid.Column width={5} floated='left' verticalAlign='middle'>
                        <Header as='h3' >
                            Featured:
                        </Header>
                    </Grid.Column>
                    <Grid.Column width={11} >
                        <Grid.Row verticalAlign='middle' style={footerStyle.features_row}>
                            { features.map( featured =>
                                <Grid.Column key={featured.text} style={footerStyle.features_column}>
                                    <a target='_blank' title={featured.text} href={`${featured.link}?utm_source=token-transfer-dapp`} rel="noopener noreferrer" style={footerStyle.features}>
                                        <Image style={footerStyle.features_img} src={featured.image} />
                                    </a>
                                </Grid.Column>
                                )
                            }
                        </Grid.Row>
                    </Grid.Column>
                </Grid>
                <Divider />
                <Grid centered columns={2} style={footerStyle.base} >
                    <Grid.Column floated='left' >
                        Contributions ::
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