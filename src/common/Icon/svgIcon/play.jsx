import React from "react";

function Play(props) {
  return (
    <svg
      width={10}
      height={12}
      viewBox="0 0 10 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1.175.612a.484.484 0 01.522.02l7.159 4.91c.146.1.235.272.235.458a.555.555 0 01-.235.459l-7.159 4.909a.484.484 0 01-.522.02.552.552 0 01-.266-.479V1.091c0-.2.102-.383.266-.479zm.757 1.478v7.82L7.634 6 1.932 2.09z"
        fill="#fff"
      />
    </svg>
  )
}

export default Play
