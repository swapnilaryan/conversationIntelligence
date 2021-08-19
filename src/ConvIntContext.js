import React, {useEffect, useReducer, useRef, useState} from "react";
import reducer, {ACTIONS} from "./reducer";
import TransformTranscript from "./common/transformTranscript";
import {transcriptJson} from "./transcript";
import TranscriptStyles from "./components/Transcript/transcript.module.css";

const NORMAL_PLAYBACK_RATE = 100
const SECONDS = 5;
export const PLAY_BACK_RATE_LIST = [0.5, 1.0,1.5, 2.0, 2.5, 3.0];

const {
  wordObj,
  timeRange,
  word_timings
} = TransformTranscript(transcriptJson);

export const ConvIntContext = React.createContext();

let elapsedTime = 0;
let timerInterval = null;
let parentContainerIdx = 0;
let prevElem = null;

const ConvIntProvider = ({children, audio, setLoading}) => {
  const [playing, setPlaying] = useState(false);
  const wordBlockRefList = useRef([]);
  const canvasRef = useRef(null);
  const [playBackRate, setPlayBackRate] = useState(PLAY_BACK_RATE_LIST[1]);
  const [showDropDown, setShowDropDown] = useState(false);
  const [convInt, dispatch] = useReducer(reducer, {});
  const [timer, setTimer] = useState("00:00");

  const getElapsedTime = () => {
    return elapsedTime;
  }

  const setParentIndex = (time) => {
    let i;
    for(i=0;i<timeRange.length;i++) {
      const {
        startTime,
        endTime
      } = timeRange[i];
      if (i === 0 && time < startTime) {
        return 0;
      }
      if (time >= startTime && time <= endTime) {
        return i;
      }
    }

    if (i >= timeRange.length) {
      return i - 1;
    }
    return -1;
  }

  const syncTime = (time, event) => {
    const {
      audioRef
    } = value;
    elapsedTime = (+time) - 0.1;
    audioRef.current.currentTime = elapsedTime;
    parentContainerIdx = setParentIndex(time);
    event ? syncWordAudio(event) : syncWordAudio(getWordEl(time));
    syncWords(time);
    dispatch({type:ACTIONS.UPDATE_TIMER, payload: {time}});
    dispatch({type:ACTIONS.SYNC_BAR, payload: {time}});
  }

  const getWordEl = (time) => {
    const index = timeRange.findIndex((item) => {
      return item.startTime <= time && time <= item.endTime
    });
    if (index !== -1) {
      const keys = Object.keys(wordObj);
      let wordTime = null;
      for(let i= 0;i<keys.length;i++) {
        if (parseFloat(keys[i]) >= parseFloat(time.toFixed(3))) {
          wordTime = keys[i];
          break;
        }
      }

      return {
        target: document.getElementsByClassName(wordTime)[0]
      }
    }
  }

  const syncWordAudio = (event) => {
    removePrevElClass();
    removeParentBg();
    if (event && event.target && event.target.nodeName.toLowerCase() === "span") {
      let el = event.target;
      // const time = el.getAttribute("data-time").replace("s", "");
      el.classList.add(TranscriptStyles.highlight);
      prevElem = el;
      while(!el.parentNode.classList.contains(TranscriptStyles.transcript)) {
        el = el.parentNode;
      }
      el.classList.add(TranscriptStyles.containerHighlight);
      // syncTime(time);
    }
  }

  const resetPrevEl = () => {
    prevElem = null;
  }

  const resetIndex = () => {
    parentContainerIdx = 0;
    elapsedTime = 0;
  }

  const removePrevElClass = () => {
    // remove the last word highlight
    prevElem && prevElem.classList.remove(TranscriptStyles.highlight);
  }

  const removeParentBg = () => {
    // remove the container bg od last transcript
    if(wordBlockRefList.current.length) {
      wordBlockRefList.current.forEach(refList => {
        refList && refList.classList.remove(TranscriptStyles.containerHighlight);
      });
    }
  }

  const backward = () => {
    const {
      audioRef
    } = value;
    if(audioRef && audioRef.current && elapsedTime) {
      const time = parseFloat(Math.round(audioRef.current.currentTime).toFixed(1)) - SECONDS
      audioRef.current.currentTime = time < 0 ? 0 : time;
      elapsedTime = audioRef.current.currentTime;
      parentContainerIdx = setParentIndex(time);
      removeParentBg();
      syncTime(elapsedTime);
      if (audioRef.current.currentTime <= 0) {
        resetIndex();
        removePrevElClass();
        removeParentBg();
      }
    }
  }

  const forward = () => {
    const {
      audioRef
    } = value;
    if(audioRef && audioRef.current && elapsedTime < audioRef.current.duration) {
      const time = parseFloat(Math.round(elapsedTime).toFixed(1)) + SECONDS
      elapsedTime = time <= audioRef.current.duration ? time : audioRef.current.duration;
      audioRef.current.currentTime = elapsedTime;
      syncTime(elapsedTime);
    }
  }

  const highlightParentBg = (index) => {
    const parentEl = wordBlockRefList.current[index];
    if(index > 0) {
      const prevParent = wordBlockRefList.current[index - 1];
      prevParent && prevParent.classList.remove(TranscriptStyles.containerHighlight);
    }
    if (parentEl && !parentEl.classList.contains(TranscriptStyles.containerHighlight)) {
      parentEl.classList.add(TranscriptStyles.containerHighlight);
    }
  }

  const syncWords = (elapsedTime) => {
    const keyTime = elapsedTime.toFixed(3);
    const highlightWord = wordObj[keyTime];

    if(highlightWord) {
      highlightParentBg(parentContainerIdx);
      if(parentContainerIdx > wordBlockRefList.current.length) {
        parentContainerIdx = setParentIndex(keyTime);
      }
      const wordTiming = word_timings[parentContainerIdx];
      let spanEl = null;
      if(wordBlockRefList.current.length && parentContainerIdx < wordBlockRefList.current.length) {
        spanEl = wordBlockRefList.current[parentContainerIdx].getElementsByClassName(keyTime)[0];
      }

      if(spanEl && !spanEl.classList.contains(TranscriptStyles.highlight)) {
        prevElem && prevElem.classList.remove(TranscriptStyles.highlight);
        spanEl.classList.add(TranscriptStyles.highlight);
        prevElem = spanEl;
      }
      if (highlightWord === wordTiming[wordTiming.length - 1].word) {
        parentContainerIdx++;
      }
    }
  }

  const playAudio = () => {
    elapsedTime += 0.1;
    convInt.syncWaveform(elapsedTime);
    convInt.updateTimer(elapsedTime);
    syncWords(elapsedTime);
  }

  const play = () => {
    const {
      audioRef
    } = value;
    audioRef.current.play();
    timerInterval = setInterval(playAudio, NORMAL_PLAYBACK_RATE / playBackRate);
  }
  const pause = () => {
    const {
      audioRef
    } = value;
    clearInterval(timerInterval);
    audioRef.current.pause();
  }

  const reset = () => {
    dispatch({type: ACTIONS.RESET_WAVEFORM, payload: {}});
    dispatch({type: ACTIONS.RESET_TIMER, payload: {}});
    dispatch({type: ACTIONS.PAUSE, payload: {pause}});
    setPlaying(false);
    resetIndex();
    removePrevElClass();
    resetPrevEl();
    removeParentBg();
    clearInterval(timerInterval);
  }

  useEffect(() => {
    const {
      audioRef
    } = value;
    audioRef.current.addEventListener('ended', reset);
    audioRef.current.addEventListener("canplaythrough", () => {
      setLoading(false);
    });
    // return () => {
    //   audioRef.current.removeEventListener('ended', reset);
    // };

  }, [audio]);

  useEffect(() => {
    const {
      audioRef
    } = value;
    clearInterval(timerInterval);
    if(audioRef && audioRef.current) {
      audioRef.current.playbackRate = playBackRate;
      if (playing) {
        timerInterval = setInterval(playAudio, NORMAL_PLAYBACK_RATE / playBackRate);
      }
    }
  }, [playBackRate]);

  const value = {
    canvasRef,
    audioRef: {
      current: audio
    },
    playing,
    setPlaying,
    play,
    pause,
    dispatch,
    wordBlockRefList,
    playBackRate,
    setPlayBackRate,
    showDropDown,
    setShowDropDown,
    forward,
    backward,
    syncWordAudio,
    syncTime,
    getElapsedTime,
    timer,
    setTimer
  };


  return (
    <ConvIntContext.Provider value={{...value}}>
      {children}
    </ConvIntContext.Provider>
  )
};

export default ConvIntProvider