import React, { Fragment } from "react";
import { Col, Row } from "react-bootstrap";

const Footer = () => (
  <Fragment>
    <footer className="footer mt-3">
      <div className="container">
        <Row className="align-items-center flex-row-reverse">
          <Col md={12} sm={12} className="text-center">
            {/* Copyright © 2024 GAJRAJ JWELLERS.{" "} */}
            {/* <span className="fa fa-heart text-danger"></span> by Scalefull
            Technology. All rights reserved. */}
          </Col>
        </Row>
      </div>
    </footer>
  </Fragment>
);

export default Footer;

// Designed with
