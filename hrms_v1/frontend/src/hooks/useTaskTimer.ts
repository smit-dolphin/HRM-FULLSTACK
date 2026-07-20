import { activeTaskSessionQueryOptions, useCurrentElepsedTimeTaskSession } from '@/querryOptions/taskSessionOptions'
import { useTaskStore } from '@/store/useTaskStore'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

const useTaskTimer = () => {



  // now what custom logi i want??
  // i want timer opreations 
  //as one list we add task in active timer but task not start it self auto metically
  //unti; status is started so check status all allong then start timer 

  // first i need to hold states for that 
  // there is states current time from server  

  // i have to sync server time to local time 
  // now i have to sync with store status ,
  //if timer is stopped timer get 00
  //if play then current synced time increment 
  // if paused then paused at current time 
  //and also need incremental logic 
  //


  const [elepsedTimer, setElepsedTime] = useState<number>(0)



  const TimerFormateHourMinutSecondHelper = (sec: number) => {

    const hours = Math.floor(sec / 3600)
    const minutes = Math.floor((sec % 3600) / 60)
    const seconds = sec % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const currenttimeres = useQuery(useCurrentElepsedTimeTaskSession)
 


  // what want to do ?? if task fetched now is is running then autometically start timer
  // and add to store i can do this in header it self so hook not get cahnge 
  const serverElapsedSeconds =
    currenttimeres.data?.data.totalElepsedTimeSeconds ?? 0

  useEffect(() => {
    setElepsedTime(serverElapsedSeconds)
  }, [serverElapsedSeconds])


  const {
    currentStatus,
  } = useTaskStore(
    useShallow((state) => ({
      currentStatus: state.currentStatus,
    }))
  )

  //now my goal is to increment timer based on task staus ,and return ,other thing will bemanaged by store externely and it is fully sync with store
  useEffect(() => {
    if (currentStatus !== "play") return
    const intervel = setInterval(() => {
      setElepsedTime((state) => state + 1)
    }, 1000)
    return () => clearInterval(intervel)

  }, [currentStatus])

  useEffect(() => {
    if (currentStatus === "pause") {
      return setElepsedTime(serverElapsedSeconds)
    }
    else if (currentStatus === "stop") {
      return setElepsedTime(0)
    }
  }, [currentStatus, serverElapsedSeconds])

  const currentrCalculatedTimer = useMemo(() => {
    return TimerFormateHourMinutSecondHelper(elepsedTimer)
  }, [elepsedTimer])





  return { currentrCalculatedTimer }
}

export default useTaskTimer