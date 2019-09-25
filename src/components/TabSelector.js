import React, { Component } from 'react';
import { Divider, Grid } from 'semantic-ui-react';

const activePaths = [
    'transfer',
    'approve'
];

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
                                    (new Array(columns)).fill("").map( (cont, index) =>
                                        index % 2 !== 0 ?
                                            <Grid.Column key={index} width={dividerWidth} verticalAlign="middle">
                                                <Divider/>
                                            </Grid.Column> :
                                            <Grid.Column key={index} width={tabNameWidth} >
                                                <h4 style={this.activePath(activePaths[Math.ceil(index / 2)]) ? {} : {cursor: "pointer"}} className={this.activePath(activePaths[Math.ceil(index / 2)]) ? "font-orange": ""} onClick={this.changeTab(activePaths[Math.ceil(index / 2)])}>
                                                    <span>
                                                        {activePaths[Math.ceil(index / 2)].charAt(0).toUpperCase() + activePaths[Math.ceil(index / 2)].slice(1).toLowerCase()}
                                                        { this.activePath(activePaths[Math.ceil(index / 2)]) &&
                                                            <Divider className="orange single-bottom-bordered"/>
                                                        }
                                                    </span>
                                                </h4>
                                            </Grid.Column>
                                    )
                                }
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    }
}