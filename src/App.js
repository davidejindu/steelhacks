import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Import the CSS file
import ReactMarkdown from 'react-markdown';
import Webcam from 'react-webcam';

function App() {
  const [chatHistory, setChatHistory] = useState([]); // Store chat history (user inputs and responses)
  const [responseData, setResponseData] = useState(null);

  // Create a ref for the chat window to enable auto-scrolling
  const chatWindowRef = useRef(null);

  // Function to handle pressing Enter
  const handleKeyPress = async (event) => {
    if (event.key === 'Enter' && event.target.value.trim()) {
      const inputValue = event.target.value;

      // Clear the input field
      event.target.value = '';

      // Add the user input to chat history
      const newChatHistory = [...chatHistory, { sender: 'user', message: inputValue }];
      setChatHistory(newChatHistory);

      // Send the text to the backend
      await sendDataToBackend(inputValue, newChatHistory);
    }
  };

  // Function to send data to the backend via POST request
  const sendDataToBackend = async (inputValue, updatedChatHistory) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Response from backend:', data);

        // Add the response to chat history
        const newChatHistory = [...updatedChatHistory, { sender: 'bot', message: data.result }];
        setChatHistory(newChatHistory);
        setResponseData(data.result); // Store response data, if needed elsewhere
      } else {
        console.error('Error: ', response.statusText);
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  // Auto-scroll to the bottom of the chat window whenever chatHistory changes
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="container">
      <div className="leftPane">
        <h2>Webcam Feed</h2>
        <Webcam className="webcam" />
      </div>
      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={chat.sender === 'user' ? 'user-message' : 'bot-message'}
            >
              {chat.sender === 'bot' ? (
                <ReactMarkdown>{chat.message}</ReactMarkdown>
              ) : (
                <p>{chat.message}</p>
              )}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            onKeyDown={handleKeyPress}
            placeholder="Send a message..."
            className="input-box"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
