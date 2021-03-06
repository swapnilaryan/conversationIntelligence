import React, {useContext, useMemo} from "react";
import Styles from "./transcript.module.css";
import {formatSecondsAsTime, parseTime} from "../../common/utils";
import {ConvIntContext} from "../../ConvIntContext";

const Transcript = (props) => {
  const {
    syncTime,
    wordBlockRefList
  } = useContext(ConvIntContext);

  const {
    transcriptJson: {
      word_timings
    }
  } = props;

  const setRef = (el) => {
    el && wordBlockRefList.current.push(el)
  }

  const onTextClick = (event) => {
    const dataTimeAttr = event.target.getAttribute("data-time");
    if (dataTimeAttr) {
      const time = parseFloat(dataTimeAttr).toFixed(1);
      syncTime(parseFloat(time), event);
    }
  }

  return useMemo(() =>
    <div className={Styles.transcript}>
      {
        word_timings.map((wordsArr, index) => {
            return (
              <div key={index} className={Styles.container} ref={setRef}>
                <div className={Styles.time}>{formatSecondsAsTime(wordsArr[0].startTime)}</div>
                <div className={Styles.text} onClick={onTextClick}>
                  {
                    wordsArr.map((item, index) => {
                      const startTime = parseFloat(item.startTime.replace("s", ""));
                      const cname = `${startTime.toFixed(3)}`
                      return <span key={index} className={cname} data-time={item.startTime}
                                   data-word={item.word}>{item.word}{' '}</span>
                    })
                  }
                </div>
              </div>
            )
          }
        )
      }
    </div>, [word_timings]
  )
}

export default Transcript