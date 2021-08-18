const TransformTranscript = (transcriptJson) => {
//   Assuming the conversation is between two people
  const {
    word_timings,
    transcript_text,
  } = transcriptJson;

  const timeRange = [];
  const wordObj = {};
  word_timings.forEach((word_timing) => {
    word_timing.reduce((accum, currVal, index ) => {
      let {
        startTime,
        word
      } = currVal;
      if(index === word_timing.length - 1) {
        timeRange.push({
          startTime: 0,
          endTime: parseFloat(word_timing[index].endTime.replace("s", "")),
        });
      }
      startTime = parseFloat(startTime.replace("s", "")).toFixed(3);
      wordObj[startTime] = word;
      return wordObj
    }, wordObj)
  });

  return {
    word_timings,
    wordObj,
    timeRange,
    transcript_text
  }
};

export default TransformTranscript;