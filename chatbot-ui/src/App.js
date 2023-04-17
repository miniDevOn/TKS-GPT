import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MessageContent from './MessageContent';
import Prompts from './Prompts';
import SavedChats from './SavedChats';


function App() {
  const [message, setMessage] = useState('');
  const processAIResponse = (response) => {
    // Remove any leading "1." from the response, but not if it's part of a list or if there's a newline immediately after the "1."
    return response.replace(/^(?<!\n)1\.(?!\s*\n)\s*/, "");
  }; 
  const [chatHistory, setChatHistory] = useState([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showSavedChats, setShowSavedChats] = useState(false);
  const [savedChats, setSavedChats] = useState([]);


  const handlePromptSelect = (prompt) => {
    setMessage(prompt);
    setShowPrompts(false);
  };

  const togglePrompts = () => {
    setShowPrompts(!showPrompts);
  };

  const toggleSavedChats = () => {
    setShowSavedChats(!showSavedChats);
  };  

  const apiUrl = process.env.NODE_ENV === "production" ? `${window.location.protocol}//${window.location.hostname}/chat` : "http://0.0.0.0:5000/chat";

  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [chatHistory]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const sendMessage = async () => {
    try {
      // Include the entire conversation history in the API call
      const conversation = chatHistory.map((chat) => ({
        from: chat.from,
        message: chat.message,
      }));
  
      const response = await axios.post(apiUrl, { message, chat_history: conversation });
  
      console.log('Response:', response);
  
      let aiMessage = response.data.message;
  
      console.log('AI Message:', aiMessage);
  
      if (!aiMessage) {
        aiMessage = processAIResponse(aiMessage);
      }
  
      setChatHistory([...chatHistory, { message, from: 'user' }, { message: processAIResponse(aiMessage), from: 'bot' }]);
      setMessage('');
    } catch (error) {
      console.log('Error:', error);
      console.log('Error response:', error.response);
      console.log('Error request:', error.request);
    }
  };

  return (
    <div className="App">
      <button onClick={toggleSavedChats} className="saved-chats-btn">
        Saved Chats
      </button>
      <div className="banner">
        <h1>GPT Ai Chat</h1>
      </div>
      <div className="chat-container">
        {chatHistory.map((chat, index) => (
          <div key={index} className={chat.from === 'user' ? 'user-message' : 'bot-message'}>
            <MessageContent from={chat.from} message={chat.message} /> {/* Use the component here */}
          </div>
        ))}
      </div>
      <form onSubmit={handleFormSubmit} className="input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="form-control chat-input"
          placeholder="Got questions? I've got bytes of knowledge!...."
          id="userMessage"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          style={{ fontSize: "16px" }}
        />
        <button type="submit">Send it!</button>
      </form>
      <Prompts
        onSelect={handlePromptSelect}
        showPrompts={showPrompts}
        togglePrompts={togglePrompts}
      />
      <SavedChats
       showSavedChats={showSavedChats}
       toggleSavedChats={toggleSavedChats}
       setCurrentChat={setChatHistory}
       clearCurrentChat={() => setChatHistory([])}
       currentChat={chatHistory}
      />
    </div>
  );
}

export default App;