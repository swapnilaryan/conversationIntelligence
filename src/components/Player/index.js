import React, {useContext} from 'react';
import Styles from './player.module.css';
import Icon from "../../common/Icon";
import {ConvIntContext, PLAY_BACK_RATE_LIST} from "../../ConvIntContext";
import {ACTIONS} from "../../reducer";

const Player = () => {
  const {
    setPlaying,
    playing,
    playBackRate,
    setPlayBackRate,
    showDropDown,
    setShowDropDown,
    forward,
    backward,
    dispatch,
    play,
    pause
  } = useContext(ConvIntContext);

  const setRate = (rate) => {
    setPlayBackRate(rate);
    toggleDropDown();
  };

  const toggleDropDown = () => {
    setShowDropDown((prevShowDropDown) => !prevShowDropDown);
  }

  const toggle = () => {
    if (!playing) {
      dispatch({type: ACTIONS.PLAY, payload: {
          play
        }});
    } else {
      dispatch({type: ACTIONS.PAUSE, payload: {
          pause
        }});
    }
    setPlaying((prevPlaying) => !prevPlaying);
  }

  return (
    <>
      <div className={Styles.container}>
        <Icon name="Backward" className={Styles.icon} onClick={backward}/>
        <div className={Styles.playPause}>
          <Icon name={ !playing ? "Play" : "Pause"} className={Styles.icon} onClick={toggle}/>
        </div>
        <Icon name="Forward" className={Styles.icon} onClick={forward}/>
        <div className={Styles.dropdownContainer}>
          <div onClick={toggleDropDown} className={`${Styles.currRate} ${!showDropDown && Styles.border}`}>{playBackRate}x</div>
          {showDropDown ?
            <div className={Styles.dropdown}>
              {
                PLAY_BACK_RATE_LIST.map(rate => {
                  return <div key={rate} className={Styles.rate} onClick={() => setRate(rate)}>{rate}x</div>
                })
              }
            </div> : null
          }
        </div>
      </div>
    </>
  );
}

export default Player;