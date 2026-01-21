import * as React from "react";
import {Fragment} from "react";

import "./css/ParentComponent.css";

const ParentComponent = (props) => {
  return (
    <Fragment>
    {props.children}
    </Fragment>
  );
};

export default ParentComponent;