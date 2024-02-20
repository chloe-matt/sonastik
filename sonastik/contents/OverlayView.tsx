import cssText from "data-text:~/contents/overlay.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const OverlayView = () => {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const messageListener = (message) => {
      setMessage(message)
    }

    chrome.runtime.onMessage.addListener(messageListener)

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  if (!message || message.action !== "openPopover") {
    return null
  }

  return (
    <span
      className="hw-top"
      style={{
        padding: 12
      }}>
      CSUI OVERLAY FIXED POSITION
    </span>
  )
}

export default OverlayView
