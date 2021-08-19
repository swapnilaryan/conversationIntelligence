import React, {useContext, useEffect, useState} from 'react';
import {ConvIntContext} from "../../ConvIntContext";
import {ACTIONS} from "../../reducer";
import {formatSecondsAsTime} from "../../common/utils";
import Styles from './timer.module.css';

const Timer = () => {
  const {
    audioRef,
    dispatch,
    setTimer,
    timer
  } = useContext(ConvIntContext);

  const updateTimer = (time) => {
    time = formatSecondsAsTime(time + 's');
    setTimer(time);
  };

  useEffect(() => {
    dispatch({type: ACTIONS.SYNC_TIMER, payload: {
        updateTimer
      }});
  }, []);

  return (
      <div className={Styles.container}>
        <div className={Styles.block}>
          <span className={Styles.currTime}>{timer}</span>
          <span className={Styles.duration}>{' '}/ {formatSecondsAsTime(audioRef.current.duration+"s")}</span>
        </div>
      </div>
  )
}

export default Timer;