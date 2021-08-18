import {useEffect, useReducer, useRef, useState} from "react";
import {transcriptJson} from "../transcript";
import Styles from "../components/Transcript/transcript.module.css"
import TransformTranscript from "./transformTranscript";
import reducer from "../reducer";

const NORMAL_PLAYBACK_RATE = 100
const SECONDS = 5;
export const PLAY_BACK_RATE_LIST = [0.5, 1.0,1.5, 2.0, 2.5, 3.0];

// const audioUrl = "https://zenprospect-production.s3.amazonaws.com/uploads/phone_call/uploaded_content/59e106639d79684277df770d.wav";
// const audio = new Audio(audioUrl);

let transcriptArr = [];
let audioRefEl = null;
let canvasRef = null;
let timerInterval = null;
let elapsedTime = 0;
let prevElem = null;
let parentContainerIdx = 0;

const {
  wordObj,
  timeRange,
  word_timings
} = TransformTranscript(transcriptJson);

const useConvInt = () => {
  const audioRef = useRef(null);
  const wordBlockRefList = useRef([]);
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [playBackRate, setPlayBackRate] = useState(PLAY_BACK_RATE_LIST[1]);
  const [loading, setLoading] = useState(true);
  const [convInt, dispatch] = useReducer(reducer, {audioRef : useRef(null)});

  const getAudioRef = () => {
    if(!audioRef.current) {
      audioRef.current = audioRefEl;
    }
    return audioRef.current;
  }

  const setAudioRef = (audio) => {
    audioRef.current = audio;
    audioRefEl = audio;
  }

  const getWordBlockListRef = () => {
    if(!wordBlockRefList.current.length) {
      wordBlockRefList.current = transcriptArr;
    }
    return wordBlockRefList.current;
  }

  const syncWordAudio = (event) => {
    if(!audioRef.current) {
      audioRef.current = getAudioRef();
    }
    const time = event.target.getAttribute("data-time").replace("s", "");
    audioRef.current.currentTime = +time;
    audioRef.current.currentTime -= 0.5
    elapsedTime = +time;
    parentContainerIdx = setParentIndex(time);
  }

  const forward = () => {
    if(audioRef && audioRef.current) {
      audioRef.current.currentTime = parseFloat(Math.round(audioRef.current.currentTime).toFixed(1)) + SECONDS;
      elapsedTime = audioRef.current.currentTime;
    }
  }

  const backward = () => {
    if(audioRef && audioRef.current) {
      const time = parseFloat(Math.round(audioRef.current.currentTime).toFixed(1)) - SECONDS
      audioRef.current.currentTime = time < 0 ? 0 : time;
      elapsedTime = audioRef.current.currentTime;
      parentContainerIdx = setParentIndex(time);
      removeParentBg();
      if (audioRef.current.currentTime <= 0) {
        resetIndex();
        removePrevElClass();
        removeParentBg();
      }
    }
  }

  const setParentIndex = (time) => {
    return timeRange.findIndex(item => {
      const {
        startTime,
        endTime
      } = item
      return time >= startTime && time <= endTime
    })
  }

  const resetIndex = () => {
    parentContainerIdx = 0;
    elapsedTime = 0;
  }

  const removeParentBg = () => {
    // remove the container bg od last transcript
    if(wordBlockRefList.current.length) {
      wordBlockRefList.current.forEach(refList => {
        refList && refList.classList.remove(Styles.containerHighlight);
      });
    }
  }

  const removePrevElClass = () => {
    // remove the last word highlight
    prevElem && prevElem.classList.remove(Styles.highlight);
    prevElem = null;
  }

  const reset = () => {
    resetIndex();
    setPlaying(false);
    removePrevElClass();
    removeParentBg();
    clearInterval(timerInterval);
  }

  const highlightParentBg = (index) => {
    const parentEl = wordBlockRefList.current[index];
    if(index > 0) {
      const prevParent = wordBlockRefList.current[index - 1];
      prevParent && prevParent.classList.remove(Styles.containerHighlight);
    }
    if (parentEl && !parentEl.classList.contains(Styles.containerHighlight)) {
      parentEl.classList.add(Styles.containerHighlight);
    }
  }

  const playAudio = () => {
    elapsedTime += 0.1;
    const keyTime = elapsedTime.toFixed(3);
    const highlightWord = wordObj[keyTime];

    if(highlightWord) {
      wordBlockRefList.current = getWordBlockListRef();
      highlightParentBg(parentContainerIdx);
      if(parentContainerIdx > wordBlockRefList.current.length) {
        parentContainerIdx = setParentIndex(keyTime);
      }
      const wordTiming = word_timings[parentContainerIdx];
      // const wordTiming = word_timings[parentContainerIdx];
      // const spanEl = wordBlockRefList.current.length && wordBlockRefList.current[parentContainerIdx].getElementsByClassName(keyTime)[0];
      const spanEl = wordBlockRefList.current.length && wordBlockRefList.current[parentContainerIdx].getElementsByClassName(keyTime)[0];
      if(spanEl && !spanEl.classList.contains(Styles.highlight)) {
        prevElem && prevElem.classList.remove(Styles.highlight);
        spanEl.classList.add(Styles.highlight);
        prevElem = spanEl;
      }
      if (highlightWord === wordTiming[wordTiming.length - 1].word) {
        parentContainerIdx++;
      }
    }
  }

  const play = () => {
    audioRef.current = getAudioRef();
    audioRef.current.play();
    wordBlockRefList.current = getWordBlockListRef();
    timerInterval = setInterval(playAudio, NORMAL_PLAYBACK_RATE / playBackRate);
  }

  const pause = () => {
    audioRef.current = getAudioRef();
    audioRef.current && audioRef.current.pause();
    clearInterval(timerInterval);
  }

  useEffect(() => {
      playing ? play() : pause();
    }, [playing]);

  useEffect(() => {
    if(audioRef && audioRef.current) {
      audioRefEl = audioRef.current;
      audioRef.current.addEventListener('ended', reset);

      audioRef.current.addEventListener("canplaythrough", event => {
        setLoading(false);
      });
    }

    // return () => {
    //   audioRef.current.removeEventListener('ended', reset);
    // };
  }, [audioRef]);

  useEffect(() => {
    if(wordBlockRefList && wordBlockRefList.current.length) {
      transcriptArr = wordBlockRefList.current;
    }
  }, [wordBlockRefList]);

  useEffect(() => {
    clearInterval(timerInterval);
    if(audioRef && audioRef.current) {
      audioRef.current.playbackRate = playBackRate;
      if (playing) {
        timerInterval = setInterval(playAudio, NORMAL_PLAYBACK_RATE / playBackRate);
      }
    }
  }, [playBackRate]);

  return {
    convInt,
    dispatch,
    setAudioRef,
    getAudioRef,
    syncWordAudio,
    forward,
    backward,
    loading,
    setLoading,
    canvasRef,
    audioRef,
    wordBlockRefList,
    playing,
    setPlaying,
    showDropDown,
    setShowDropDown,
    playBackRate,
    setPlayBackRate
  };
};

export default useConvInt;