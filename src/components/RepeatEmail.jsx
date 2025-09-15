import { useState } from "react"
import { toast } from "react-toastify"

export default function RepeatEmail({ defaultMessage, timerStartPoint, action, toastMessage }) {
    const [timer, setTimer] = useState(timerStartPoint)
    const [waiting, setWaiting] = useState(false)

    async function handleRepeat() {
        if (!waiting) {
            action.then(() => toast.warn(toastMessage))
            setTimer(timerStartPoint)

            setWaiting(true)

            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev === 0) {
                        clearInterval(interval)
                        setWaiting(false)
                        return 0
                    } else {
                        return prev - 1
                    }
                })
            }, 1000)
        } 

        return () => clearInterval(interval)  
    }

    return <p className="repeat" onClick={handleRepeat}>{waiting ? `Ожидайте ${timer} сек.` : defaultMessage}</p>
}