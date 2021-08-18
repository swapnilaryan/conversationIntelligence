import React, {useState} from 'react';
import Player from "./components/Player";
import {transcriptJson} from "./transcript";
import Transcript from "./components/Transcript";
import Waveform from "./components/Waveform";
import Loader from "./common/Loader";
import ConvIntProvider from "./ConvIntContext";
import Timer from "./components/Timer";

const audioUrl = "https://zenprospect-production.s3.amazonaws.com/uploads/phone_call/uploaded_content/59e106639d79684277df770d.wav";

const audio = new Audio(audioUrl);

function App() {
  const [loading, setLoading] = useState(true)
  return (
    <div>
      <ConvIntProvider audio={audio} setLoading={setLoading}>
        {
          !loading && (
            <>
              <Player/>
              <Timer />
              <Waveform/>
              <Transcript transcriptJson={transcriptJson}/>
            </>
          )
        }
      </ConvIntProvider>
      <Loader show={loading} backdrop={true} spinner={true}/>
    </div>
  );
}

export default App;
