import React from "react";

function Speaker1(props) {
  const {
    x1,
    x2,
    y1,
    y2,
    linestyle,
    className,
    width,
    height
  } = props;
  return (
    <svg
      width={width}
      height={height || 25}
      className={className}
    >
      <line className={linestyle} x1={x1 || 0} x2={x2 || 0} y1={y1||0} y2={y2||0}/>
      <line className={linestyle} x1={x1} x2={0} y1={y1||0} y2={y2||0}/>
    </svg>
  )
}

export default Speaker1;
