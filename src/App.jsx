"use client"

import { useEffect, useRef, useState } from "react"
import ChatbotIcon from "../components/ChatbotIcon"
import ChatForm from "../components/ChatForm"
import ChatMessage from "../components/ChatMessage"
import { companyInfo } from "./companyInfo"
import { IoIosArrowDown } from "react-icons/io"
import { IoClose } from "react-icons/io5"
import { TbMessageChatbotFilled } from "react-icons/tb"

// ✅ Updated API URL with key included
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAbcHL-k-scLVnZ9vSWixsnW_z5kafvMbo"

const App = () => {
  const chatBodyRef = useRef()
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ])

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [...prev.filter((msg) => msg.text !== "Thinking..."), { role: "model", text, isError }])
    }

    // Format history for Gemini API
    const formattedHistory = history.map(({ role, text }) => ({
      role: role === "user" ? "user" : "model",
      parts: [{ text }],
    }))

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: formattedHistory,
      }),
    }

    try {
      const response = await fetch(API_URL, requestOptions)
      const data = await response.json()

      if (!response.ok) throw new Error(data?.error?.message || "Something went wrong!")

      // Extract response text from Gemini API format
      const apiResponseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."

      // Clean up formatting and add to chat
      const cleanedResponse = apiResponseText.replace(/\*\*(.*?)\*\*/g, "$1").trim()
      updateHistory(cleanedResponse)
    } catch (error) {
      updateHistory(error.message, true)
    }
  }

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [chatHistory])

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatbot((prev) => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">
          <TbMessageChatbotFilled />
        </span>
        <span className="material-symbols-rounded">
          <IoClose />
        </span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button onClick={() => setShowChatbot((prev) => !prev)} className="material-symbols-rounded">
            <IoIosArrowDown />
          </button>
        </div>
        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there <br /> How can I help you today?
            </p>
          </div>
          {/* Render the chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  )
}

export default App

