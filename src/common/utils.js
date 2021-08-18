const formatSecondsAsTime = (secs) => {
  secs = parseFloat(secs.replace('s', '')).toFixed(2);
  let hr  = Math.floor(secs / 3600);
  let min = Math.floor((secs - (hr * 3600))/60);
  let sec = Math.floor(secs - (hr * 3600) -  (min * 60));

  if (min < 10){
    min = "0" + min;
  }
  if (sec < 10){
    sec  = "0" + sec;
  }
  return hr ? `${hr}:${min}:${sec}` : `${min}:${sec}`;
}

const parseTime = (time) => {
  return parseFloat(time.replace("s", ""));
}

export {
  parseTime,
  formatSecondsAsTime
}