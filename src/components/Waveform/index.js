import React, {useContext, useEffect, useRef} from 'react';
import Styles from './waveform.module.css';
import {parseTime} from "../../common/utils";
import {transcriptJson} from "../../transcript";
import {ConvIntContext} from "../../ConvIntContext";
import Icon from "../../common/Icon";
import {ACTIONS} from "../../reducer";
const {
  word_timings
} = transcriptJson;

const timeDiff = (startTime, endTime) => {
  return +(parseTime(startTime) - parseTime(endTime).toFixed(1));
}

const calDiffDuration = (diff, duration) => {
  return diff / duration * 100;
}

const calPlayedPercentageTime = (elapsedTime, duration) => {
  return elapsedTime / duration * 100;
}

const calBlockPercentage = (percentage, playedPercentage, prevPercentage) => {
  return 100 / percentage * (playedPercentage - prevPercentage)
}
let playingIndex = 0;
let percentage = 0;
let prevPercentage = 0;
let person1Percent;
let person2Percent;

const Waveform = () => {
  const {
    audioRef,
    dispatch,
    syncTime
  } = useContext(ConvIntContext);

  const waveformRef = useRef(null);
  const waveformRefList = useRef([]);
  const graphRef = useRef(null);
  const personRef = useRef(null);

  const resetWaveform = () => {
    playingIndex = 0;
    percentage = 0;
    prevPercentage = 0;
    resetX2LineSvg();
  }

  const resetX2LineSvg = () => {
    const svgList = waveformRef.current.getElementsByTagName("svg");
    for(let i = 0;i<svgList.length;i++) {
      const el = svgList[i].getElementsByTagName("line")[1];
      el.setAttribute("x2", 0);
    }
  }

  const grayLine = (svgObj, elapsedTime, percentage, playedPercentage, prevPercentage, svgList) => {
    if(svgObj) {
      const lineEl = svgObj.getElementsByTagName("line")[1];
      const blockPercentage = Math.ceil(calBlockPercentage(percentage, playedPercentage, prevPercentage));
      if(blockPercentage >= 100 ) {
        playingIndex++;
        if(playingIndex > svgList.length) {
          playingIndex = svgList.length
        }
        prevPercentage += parseFloat(svgList[playingIndex-1].getAttribute("width").replace("%"));
      }
      if(blockPercentage < 0) {
        lineEl.setAttribute("x2", 0+"%");
      } else if (blockPercentage > 100 ) {
        lineEl.setAttribute("x2", 100+"%");
      } else {
        lineEl.setAttribute("x2", blockPercentage+"%");
      }
      lineEl.style.stroke = "#D3DAE3";
    }
    return prevPercentage;
  }

  const calcPlayingIndex = (elapsedTime, duration) => {
    const percentageWidth = waveformRefList.current.reduce((accum, currVal, index) => {
      if(index > 0) {
        accum.push(accum[index - 1] + parseFloat(currVal.getAttribute("width").replace("%")));
      } else {
        accum.push(parseFloat(currVal.getAttribute("width").replace("%")));
      }
      return accum;
    }, []);
    const playedPercent = calPlayedPercentageTime(elapsedTime, duration);
    const index = percentageWidth.findIndex(item => item > playedPercent);
    return index === -1 ? 0 : index;
  }

  const syncWaveform = (elapsedTime) => {
    if(elapsedTime <= 0.1) {
      resetWaveform();
    }
    const playedPercentage = calPlayedPercentageTime(elapsedTime, audioRef.current.duration);
    const svgList = waveformRefList.current;

    if (playingIndex < svgList.length) {
      const svgEl = svgList[playingIndex];
      percentage = parseFloat(svgEl.getAttribute("width").replace("%"));
      prevPercentage = grayLine(svgEl, elapsedTime, percentage, playedPercentage, prevPercentage, svgList);
    }
  };

  const setRef = (el) => {
    if(el) {
      const svg = el.getElementsByTagName("svg")[0]
      if (waveformRefList.current.indexOf(svg) === -1 ) {
        waveformRefList.current.push(svg);
      }
    }
  }

  const calculatePercentage = () => {
    person1Percent = 0;
    person2Percent = 0;
    word_timings.forEach((word_timing, index) => {
      const lastIdx = word_timing.length - 1;
      if(index % 2 === 0) {
        person1Percent += timeDiff(word_timing[lastIdx].endTime, word_timing[0].startTime);
      } else {
        person2Percent += timeDiff(word_timing[lastIdx].endTime, word_timing[0].startTime);
      }
    });
    person1Percent = calPlayedPercentageTime(person1Percent, audioRef.current.duration).toFixed(1);
    person2Percent = calPlayedPercentageTime(person2Percent, audioRef.current.duration).toFixed(1);
  }

  const setAttributes = (svgEl, x2Val) => {
    const el = svgEl.getElementsByTagName("line")[1];
    el.setAttribute("x2", x2Val);
    el.style.stroke = "#D3DAE3";
  }
  const syncWaveformClick = (clickedTime, playingIndex) => {
    resetX2LineSvg();
    prevPercentage = 0;
    for(let i=0;i<playingIndex;i++) {
      const svgEl = waveformRefList.current[i];
      setAttributes(svgEl, "100%");
      prevPercentage += parseFloat(svgEl.getAttribute("width").replace("%"))
    }
    const playedPercentage = calPlayedPercentageTime(clickedTime, audioRef.current.duration);
    const svgEl = waveformRefList.current[playingIndex];
    const percentage = parseFloat(svgEl.getAttribute("width").replace("%"))
    const blockPercentage = Math.floor(calBlockPercentage(percentage, playedPercentage, prevPercentage));

    setAttributes(svgEl, blockPercentage+"%");
    syncTime(clickedTime);
  }

  const handleSync = (time, event) => {
    while(event &&  ( (event.target && event.target.nodeName) || event.tagName )!== "svg") {
      event = event.target ? event.target.parentNode : event.parentNode;
    }
    if(event) {
      playingIndex = Math.max(waveformRefList.current.indexOf(event), waveformRefList.current.indexOf(event.target))
      syncWaveformClick(time, playingIndex);
    }
  };

  const handleClick = (event) => {
    const time = Math.abs(audioRef.current.duration / graphRef.current.offsetWidth * (event.pageX - personRef.current.offsetWidth))
    const clickedTime = parseFloat(time.toFixed(1));
    syncTime(clickedTime);
    handleSync(clickedTime, event)
  }

  useEffect(() => {
    calculatePercentage();
    dispatch({type: ACTIONS.SYNC_WAVEFORM, payload: {
        syncWaveform,
        resetWaveform,
      }});
  }, []);

  const formJsx = (index, width, strokeIdx = 0) => {
    let height = 50;
    let coordinate = -1;
    if(index % 2 !==0 ) {
      height = 25;
      coordinate = 1;
    }

    return (
      <span ref={setRef} key={width}>
        <Icon name="Speaker1" className={Styles.svgClass}
              linestyle={Styles[`stroke${strokeIdx === -1 ? 0 : index+1}`]}
              height={height}
              width={`${width}%`}
              x1={0} y1={25 * coordinate}
              x2={`100%`} y2={25 * coordinate}
        />
      </span>
    )
  }

  // 0 to 1st word
  const beforeCommunication = () => {
    const diff = timeDiff(word_timings[0][0].startTime, '0s')
    const width = calDiffDuration(diff, audioRef.current.duration);
    return formJsx(0, width, 0);
  }

  // last word to end of audio
  const afterCommunication = () => {
    const prevEl = word_timings[word_timings.length -1];
    const diff = timeDiff(audioRef.current.duration+"s" , prevEl[prevEl.length -1].endTime);
    const width = calDiffDuration(diff, audioRef.current.duration);
    return formJsx(1, width, 1);
  }


  return (
    <div className={Styles.container} onClick={handleClick} ref={waveformRef}>
      <div className={Styles.person}  ref={personRef}>
        <div className={Styles.firstPerson}><span>{person1Percent}%</span><span> Person 1</span></div>
        <div className={Styles.secondPerson}><span>{person2Percent}%</span><span> Person 2</span></div>
      </div>
      <div className={Styles.graph} ref={graphRef}>
        {beforeCommunication()}
        {
          word_timings.map((word_timing, index) => {
            const duration = audioRef.current.duration;
            let diff = 0;
            let width = 0;
            let svgArr = [];

            if(index > 0) {
              const lastIdx = word_timings[index - 1].length - 1;
              diff = timeDiff(word_timing[0].startTime, word_timings[index - 1][lastIdx].endTime);
              width = calDiffDuration(diff, duration);
              svgArr.push(formJsx(index, width, index));
            }

            const lastIdx = word_timing.length - 1;
            diff = timeDiff(word_timing[lastIdx].endTime, word_timing[0].startTime);
            width = calDiffDuration(diff, duration);
            svgArr.push(formJsx(index, width));
            return svgArr;
          })
        }
        {afterCommunication()}
      </div>
    </div>
  );

}

export default Waveform;
