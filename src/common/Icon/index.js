import React from 'react';
import PropTypes from 'prop-types';
import Forward from "./svgIcon/forward";
import Backward from "./svgIcon/backward";
import Play from "./svgIcon/play";
import Search from "./svgIcon/search";
import Pause from "./svgIcon/pause";
import Speaker1 from "./svgIcon/speaker1";

/*
* import Icon from "./common/Icon";
* <Icon name="Search" className={<style class>} />
* */

const Components = {
  Forward,
  Backward,
  Play,
  Pause,
  Search,
  Speaker1,
};

const Icon = (props) => {
  let {className, name, ...attributes} = props;
  const SVGIcon = Components[name];

  return (
    SVGIcon ? <SVGIcon className={className || ''} {...attributes} /> : null
  )
}

Icon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Icon;
