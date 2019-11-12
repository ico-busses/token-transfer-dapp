import React, { Component } from "react";
import PropTypes from "prop-types";
import { Divider, Grid, Header, Icon, Image } from "semantic-ui-react";
import { Address } from "./lib/";
import { footerStyle } from "../styles";
import { features } from "../config";
import "../styles/responsive.css";

import InfiniteCarousel from "react-leaf-carousel";

export default class Footer extends Component {
  render() {
    return (
      <div>
        <Grid columns={2} divided>
          <Grid.Column
            className="featured"
            floated="left"
            verticalAlign="middle"
          >
            <Header as="h3">Featured</Header>
          </Grid.Column>
          <Grid.Column className="stateOfDaps" style={footerStyle.noBoxShadow}>
            <Grid.Row verticalAlign="middle" style={footerStyle.features_row}>
              <InfiniteCarousel
                breakpoints={[
                  {
                    breakpoint: 350,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1
                    }
                  },
                  {
                    breakpoint: 500,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 2
                    }
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 3,
                      slidesToScroll: 3
                    }
                  }
                ]}
                dots={false}
                showSides={true}
                sidesOpacity={0.5}
                sideSize={0.1}
                slidesToScroll={4}
                slidesToShow={4}
                scrollOnDevice={true}
              >
                {features.map(featured => (
                  <div key={featured.text} style={footerStyle.features_column}>
                    <a
                      target="_blank"
                      title={featured.text}
                      href={`${featured.link}?utm_source=token-transfer-dapp`}
                      rel="noopener noreferrer"
                      style={footerStyle.features}
                    >
                      <Image src={featured.image} />
                    </a>
                  </div>
                ))}
              </InfiniteCarousel>
            </Grid.Row>
          </Grid.Column>
        </Grid>
        <Divider className="white-bordered-double" />
        {this.props.isMobile ? (
          <Grid rows={2} style={footerStyle.base}>
            <Grid.Row>
              <Grid.Column>
                Contributions :: <br />
                <div>
                  <b>
                    ETH -
                    <Address
                      address="0x965d1c9987bd2c34e151e63d60aff8e9db6b1561"
                      style={{ color: "inherit", height: "14px" }}
                    />
                  </b>
                </div>
                Powered by :
                <a
                  target="_blank"
                  href="https://github.com/ico-busses"
                  rel="noopener noreferrer"
                  style={footerStyle.footerLink}
                >
                  : ICO BUSSES
                </a>{" "}
                .
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <a
                  href="https://github.com/ico-busses/token-transfer-dapp"
                  style={footerStyle.source}
                >
                  Source code
                  <Icon
                    color="black"
                    size="large"
                    name="github"
                    style={footerStyle.sorceIcon}
                  />
                </a>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        ) : (
          <Grid columns={2} style={footerStyle.base}>
            <Grid.Column floated="left">
              Contributions :: <br />
              <div>
                <b>
                  ETH -
                  <Address
                    address="0x965d1c9987bd2c34e151e63d60aff8e9db6b1561"
                    style={{ color: "inherit", height: "14px" }}
                  />
                </b>
              </div>
              <br />
              Powered by :
              <a
                target="_blank"
                href="https://github.com/ico-busses"
                rel="noopener noreferrer"
                style={footerStyle.footerLink}
              >
                : ICO BUSSES
              </a>{" "}
              .
            </Grid.Column>
            <Grid.Column width={4}>
              <a
                href="https://github.com/ico-busses/token-transfer-dapp"
                style={footerStyle.source}
              >
                Source code
                <Icon
                  color="black"
                  size="large"
                  name="github"
                  style={footerStyle.sorceIcon}
                />
              </a>
            </Grid.Column>
          </Grid>
        )}
      </div>
    );
  }
}

Footer.propTypes = {
  isMobile: PropTypes.bool.isRequired
};
