import {useEffect, useRef} from "react";
import useConvInt from "./useConvInt";
import {transcriptJson} from "../transcript";
import {parseTime} from "./utils";

const {
  word_timings
} = transcriptJson;

let ctx = null;
const useWaveform = () => {
  const {
    getAudioRef,
    playing,
    canvasRef
  } = useConvInt();
  let duration = null;
  // const canvasRef = useRef(null);

  const drawBarLines2 = (diff, xPos, index, isSpeech) => {
    let i = 0;
    console.log("diff", diff, index)
    while(i < diff) {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.moveTo(xPos, index % 2 ? 10 : 0);
      ctx.lineTo(xPos, index % 2 ? 50 : -50);

      // console.log("xPos, index % 2 ? 10 : 0", xPos, index % 2 ? 10 : 0)
      // console.log("xPos, index % 2 ? 10 : 0", xPos, index % 2 ? 50 : -50)
      if(isSpeech) {
        ctx.strokeStyle = index % 2 ? '#02C797' : '#ff0000';
      }
      ctx.stroke();
      xPos += + 0.1 + 6
      i = i + 0.1 //parseFloat((i+0.1).toFixed(1));
    }
    return xPos;
  }

  const drawBarLines = (diff, xPos, index, isSpeech) => {
    let i = 0;
    const lineWidth = 2;
    console.log("diff", diff, index)
    while(i < diff/2) {
      console.log(i)
      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.moveTo(xPos, index % 2 ? 10 : 0);
      ctx.lineTo(xPos, index % 2 ? 50 : -50);

      // console.log("xPos, index % 2 ? 10 : 0", xPos, index % 2 ? 10 : 0)
      // console.log("xPos, index % 2 ? 10 : 0", xPos, index % 2 ? 50 : -50)
      if(isSpeech) {
        ctx.strokeStyle = index % 2 ? '#02C797' : '#ff0000';
      }
      ctx.stroke();
      xPos += 3
      i = i + 1;
    }
    return xPos;
  }

  const draw = () => {
    const audioRef = getAudioRef();
    let xPos = 10;
    console.log(canvasRef.current.width);
    word_timings.forEach((word_timing, index) => {
      word_timing.forEach((data, idx) => {
        let diff = +(parseTime(data.endTime) - parseTime(data.startTime)).toFixed(1);
        if (idx > 0) {
          // this is to account the delay between next word and current word
          // diff = +(parseTime(data.startTime) - parseTime(word_timing[idx -1].endTime).toFixed(1));
        }
        const diffArea = parseInt((diff / duration) * canvasRef.current.width, 10)
        // console.log("diff / duration * canvasRef.current.width", diff, duration, canvasRef.current.width, diff2)
        xPos = drawBarLines(diffArea, xPos, index, true);
      });
    });
  }

  const canvasInit = () => {
    console.log("init", canvasRef);
    canvasRef.current.width = document.documentElement.offsetWidth - 40;
    canvasRef.current.height = 100;
    ctx = canvasRef.current.getContext('2d');
    ctx.translate(0, 50);
    requestAnimationFrame(draw);
  }

  // useEffect(() => {
  //   duration = 16.1 //getAudioRef().duration; // TODO
  //   console.log(duration, playing)
  //   console.log(canvasRef, getAudioRef());
  //   canvasRef.current.width = document.documentElement.offsetWidth - 40;
  //   canvasRef.current.height = 100;
  //   init();
  // }, [canvasRef, playing]);

  return {
    canvasRef,
    canvasInit
  }
};


export default useWaveform;