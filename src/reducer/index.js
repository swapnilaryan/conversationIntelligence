export const ACTIONS = {
  PLAY: 'play',
  PAUSE: 'pause',
  RESET_WAVEFORM: 'resetWaveform',
  SYNC_WAVEFORM: 'syncWaveform',
  SYNC_TIMER: "syncTimer",
  RESET_TIMER: "resetTimer",
  UPDATE_TIMER: "updateTimer",
  SYNC_BAR: "syncBar"
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

    case ACTIONS.UPDATE_TIMER:
      const objTime = {...state, ...action};
      objTime.updateTimer(objTime.payload.time);
      return objTime;

    case ACTIONS.SYNC_BAR:
      const objBar = {...state, ...action};
      objBar.syncWaveform(objBar.payload.time);
      return objBar;

    case ACTIONS.RESET_WAVEFORM:
      const obj = {...state, ...action};
      obj.resetWaveform();
      return obj;
    default:
      return state
  }
}
export default reducer;