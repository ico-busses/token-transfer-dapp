import React, { Component } from 'react';
import { Divider, Grid } from 'semantic-ui-react';

const activePaths = [
    'transfer',
    'approve'
];

const pathColors = {
    'transfer': '#f9a510',
    'approve': '#1064f9'
};

export default class TabSelector extends Component {

    activePath = (path) => {
        return this.props.location.pathname.includes(path);
    }

    changeTab = (path) => ()  => {
        const { address } = this.props.match.params;
        this.props.history.push(`/${address}/${path}`);
    }

    render() {
        const columns = activePaths.length * 2 - 1;
        const tabNameWidth = 16 / 2 / activePaths.length;
        const dividerWidth = 16 / 2 / (activePaths.length - 1);

        return <div className="tabselector mt-48 mb-48" >
            <Grid className="mt-48 mb-48">
                <Grid.Row centered>
                    <Grid.Column width={this.props.isMobile ? 16 : 12} verticalAlign="middle">
                        <Grid columns={columns}>
                            <Grid.Row>
                                {
                                    (new Array(columns)).fill("").map( (cont, index) => {
                                        const indPath = activePaths[Math.ceil(index / 2)];
                                        return (
                                            index % 2 !== 0 ?
                                                <Grid.Column key={index} width={dividerWidth} verticalAlign="middle">
                                                    <Divider/>
                                                </Grid.Column> :
                                                <Grid.Column key={index} width={tabNameWidth} >
                                                    <h4 style={this.activePath(indPath) ? {color: pathColors[indPath]} : {cursor: "pointer"}} className={this.activePath(indPath) ? "font-orange": ""} onClick={this.changeTab(indPath)}>
                                                        <span>
                                                            {indPath.charAt(0).toUpperCase() + indPath.slice(1).toLowerCase()}
                                                            { this.activePath(indPath) &&
                                                                <Divider className="single-bottom-bordered" style={{borderTopColor: pathColors[indPath],borderBottomColor: pathColors[indPath]}}/>
                                                            }
                                                        </span>
                                                    </h4>
                                                </Grid.Column>
                                            )
                                    })
                                }
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    }
}