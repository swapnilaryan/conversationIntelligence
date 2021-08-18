export const ACTIONS = {
  PLAY: 'play',
  PAUSE: 'pause',
  RESET_WAVEFORM: 'resetWaveform',
  SYNC_WAVEFORM: 'syncWaveform',
  SYNC_TIMER: "syncTimer",
  RESET_TIMER: "resetTimer"
}
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.PLAY:
      action.payload.play();
      return {...state, ...action.payload}

    case ACTIONS.PAUSE:
      action.payload.pause();
      return {...state, ...action.payload}

    case ACTIONS.SYNC_WAVEFORM:
      return {...state, ...action.payload}

    case ACTIONS.SYNC_TIMER:
      return {...state, ...action.payload}

    case ACTIONS.RESET_TIMER:
      const timerObj = {...state, ...action};
      timerObj.updateTimer(0);
      return timerObj;

    case ACTIONS.RESET_WAVEFORM:
      const obj = {...state, ...action};
      obj.resetWaveform();
      return obj;
    default:
      return state
  }
}
export default reducer;