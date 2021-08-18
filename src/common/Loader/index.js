import React from 'react';
import PropTypes from 'prop-types';

import Styles from './loader.module.css';

const Loader = ({
  show,
  error,
  backdrop,
  spinner,
  className = '',
  containerClassName
}) => {
  if (show) {
    if (error) {
      return null;
    }

    return (
      <div className={`${Styles.loaderAnimationContainer} ${className}`}>
        {backdrop && <div className={Styles.backdrop} />}
        {spinner && (
          <div className={`${Styles.spinnerContainer} ${containerClassName}`}>
            <div className={Styles.spinner} />
          </div>
        )}
      </div>
    );
  }
  return null;
};

Loader.propTypes = {
  show: PropTypes.bool.isRequired,
  backdrop: PropTypes.bool,
  spinner: PropTypes.bool,
  className: PropTypes.string
};

Loader.defaultProps = {
  show: false,
  spinner: true
};

export default Loader;
