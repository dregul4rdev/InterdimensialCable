"use client";
import { useState, useEffect } from "react";

import { useGobalDispatch, useGobalStorage } from './storage/GlobalProvider'
import { generateProgramming } from './utils/prammingGenerartor'

import VideoScreen from './components/organisms/Screen'
import DetailBar from './components/organisms/DetailBar';
import { IProgramming, IChannel } from './programming'

import { calculateCurrentVideoIndexDuration } from './utils/util'
import NoiseEffect from "./components/molecules/NoiseEffect";


export default function Home() {
  const DEV_MODE = false;
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideoSeconds, setCurrentVideoSeconds] = useState(0);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [noiseVisible, setNoiseVisible] = useState(false);
  const { programming } = useGobalStorage();
  const GlobalDispatchContext = useGobalDispatch();
  const currentChannel: IChannel = programming.channelList[currentChannelIndex]

  const displayNoise = () => {
    setNoiseVisible(true)
  }

  const removeNoiseFromScreen = () => {
    setTimeout(function () {
      setNoiseVisible(false)
    }, 1000);
  }

  const nextChannelHandler = () => {
    displayNoise()

    let nextIndex = currentChannelIndex + 1
    nextIndex = nextIndex > (programming.channelList.length - 1) ? 0 : nextIndex;
    setCurrentChannelIndex(nextIndex)
    let newCurrentChannel = programming.channelList[nextIndex]

    const { videoIndex, currentSecondOfTheVideo } = calculateCurrentVideoIndexDuration(newCurrentChannel.totalDuration, newCurrentChannel.videos);
    setCurrentVideoIndex(videoIndex);
    setCurrentVideoSeconds(currentSecondOfTheVideo);

  }


  const previusChannelHandler = () => {
    displayNoise()

    let nextIndex = currentChannelIndex - 1
    nextIndex = nextIndex < 0 ? (programming.channelList.length - 1) : nextIndex;
    setCurrentChannelIndex(nextIndex)
    let newCurrentChannel = programming.channelList[nextIndex]

    const { videoIndex, currentSecondOfTheVideo } = calculateCurrentVideoIndexDuration(newCurrentChannel.totalDuration, newCurrentChannel.videos);
    setCurrentVideoIndex(videoIndex);
    setCurrentVideoSeconds(currentSecondOfTheVideo);
  }

  const gnerateProgramingHandler = (onlyNewChannels = true) => {
    (async () => {
      try {
        const newProgramming = await generateProgramming(onlyNewChannels, programming);
        localStorage.setItem('programming', JSON.stringify(newProgramming));
        console.log("programmign from generator:", newProgramming)
        GlobalDispatchContext({ type: "LOAD_PROGRAMMING", payload: newProgramming });
      }
      catch (err) {
        console.log(err)
      }
    })()
  }

  if (DEV_MODE) {
    useEffect(() => {
      (async () => {
        const programming: IProgramming = JSON.parse(localStorage.getItem('programming') || "null");
        if (programming) {
          console.log("programmign from local storage:", programming)
          GlobalDispatchContext({ type: "LOAD_PROGRAMMING", payload: programming });
        } else {
          try {
            const programming = await generateProgramming();
            localStorage.setItem('programming', JSON.stringify(programming));
            console.log("programmign from generator:", programming)
            GlobalDispatchContext({ type: "LOAD_PROGRAMMING", payload: programming });
          }
          catch (err) {
            console.log(err)
          }
        }
      })()

    }, [GlobalDispatchContext]);
  }

  return (

    <main className="container flex flex-col h-screen  min-w-full max-h-screen   min-h-screen bg-indigo-500">

      {currentChannel && currentChannel.videos ?
        <>
         <NoiseEffect visible ={noiseVisible }/>
          <VideoScreen
            key={currentChannel.name}
            videos={currentChannel.videos}
            currentVideoIndex={currentVideoIndex}
            currentSecond={currentVideoSeconds}
            onVideoLoaded={removeNoiseFromScreen}
          />
          <DetailBar
            channel={currentChannel}
            video={currentChannel.videos[currentVideoIndex]}
            nextCallback={nextChannelHandler}
            previusCallback={previusChannelHandler} />
        </> : <></>}
      {DEV_MODE ?
        <button className="m-4 z-50 absolute bottom-0 right-0 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={()=>gnerateProgramingHandler()}>Regenerar programacion</button> :
        <></>}
    </main>
  )
}






