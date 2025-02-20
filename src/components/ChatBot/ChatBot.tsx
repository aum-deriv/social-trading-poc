import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import AILoader from '../AILoader';
import { useAuth } from '@/context/AuthContext';
import { useViewport } from '@/hooks';

interface Message {
  text: string;
  isUser: boolean;
}

interface BotInfo {
  name: string;
  avatar: string;
  role: string;
}

const botInfo: BotInfo = {
  name: 'Champion AI  Assistant',
  avatar: '/champion_logo-blue.svg',
  role: '',
};

const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const { isMobile } = useViewport();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: `Hi ${user?.displayName || 'there'}! 👋 Welcome to our social trading platform's support. How can I help you today? I'd be happy to tell you about our copy trading features.`,
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatContainerRef.current &&
        toggleButtonRef.current &&
        !chatContainerRef.current.contains(event.target as Node) &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (isMobile) {
          document.body.style.overflow = 'auto';
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_LLM_SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message:
            userMessage +
            '\n\nPlease structure your response with:\n• Bullet points for lists\n• Numbers (1., 2., etc.) for steps\n• Clear sections and formatting',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.answer, isUser: false }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          text: 'Sorry, I encountered an error. Please try again later.',
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      scrollToBottom();
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (isMobile) {
        document.body.style.overflow = 'auto';
      }
    }
  };

  // Cleanup overflow style when component unmounts
  useEffect(() => {
    return () => {
      if (isMobile) {
        document.body.style.overflow = 'auto';
      }
    };
  }, [isMobile]);

  return (
    <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
      <button
        ref={toggleButtonRef}
        onClick={toggleChat}
        className={`chatbot-toggle ${isOpen ? '' : 'show-sparkles'}`}
        aria-label="Toggle chat"
      >
        <div className="toggle-background">
          <span className="sparkle sparkle-1">✦</span>
          <span className="sparkle sparkle-2">✧</span>
          <span className="sparkle sparkle-3">✦</span>
        </div>
        <span className="toggle-content">
          <span className="toggle-icon">✦</span>
        </span>
      </button>
      <button onClick={toggleChat} className="close-button mobile-only" aria-label="Close chat">
        ×
      </button>
      <div ref={chatContainerRef} className="chatbot-container">
        <div className="chatbot-header">
          <img src={botInfo.avatar} alt={botInfo.name} className="bot-avatar" />
          <div className="bot-info">
            <h3>{botInfo.name}</h3>
            <span>{botInfo.role}</span>
          </div>
        </div>
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
            >
              {!message.isUser && (
                <img src={botInfo.avatar} alt={botInfo.name} className="message-avatar" />
              )}
              <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="message-content">
                <AILoader />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
            {isLoading ? '...' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
