import React, { useState } from 'react'
import Countup from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';

import "./ResultCard.scss";

export default function Counter(props) {
  const [shown, setShown] = useState();

  const trySetShown = (isVisible) => isVisible && setShown(true);

  if(!shown) {
    return (
      <VisibilitySensor onChange={trySetShown}>
        <span>0</span>
      </VisibilitySensor>
    );
  }

  return (<Countup {...props} />);

}
