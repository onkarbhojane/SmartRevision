// src/components/chat/ChatInterface/ChatInterface.jsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../common/UI/Button/Button";
import axios from "axios";
import "./ChatInterface.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ChatInterface = ({
  documentId,
  accessToken,
  onPageNavigate,
  onPageHighlight,
  currentPage // Add currentPage prop to get the current page from parent
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [highlightedPages, setHighlightedPages] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Fetch chat history when component mounts
  useEffect(() => {
    fetchChatHistory();
  }, [documentId, accessToken]);

  // Reset highlighting when document changes
  useEffect(() => {
    setSelectedPage(null);
    setHighlightedPages(new Set());
  }, [documentId]);


  const fetchChatHistory = async () => {
    if (!documentId) return;

    setIsLoadingHistory(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://smartrevision.onrender.com/api/chat/${documentId}/history`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.chatHistory && response.data.chatHistory.length > 0) {
        const formattedMessages = response.data.chatHistory.map((msg, idx) => ({
          id: msg._id || idx + Date.now(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp || Date.now()),
          citations: msg.citations || [],
        }));

        setMessages(formattedMessages);

        // Extract all page numbers from citations and content for highlighting
        const allPageNumbers = new Set();
        formattedMessages.forEach((message) => {
          // Extract from citations
          if (message.citations && message.citations.length > 0) {
            message.citations.forEach((citation) => {
              if (citation.pageNumber) {
                allPageNumbers.add(citation.pageNumber);
              }
            });
          }

          // Extract from content (page references like [page 7])
          if (message.content && typeof message.content === "string") {
            const pageRefRegex = /\[page\s+(\d+)\]/gi;
            let match;
            while ((match = pageRefRegex.exec(message.content)) !== null) {
              const pageNumber = parseInt(match[1]);
              allPageNumbers.add(pageNumber);
            }
          }
        });

        if (allPageNumbers.size > 0) {
          setHighlightedPages(allPageNumbers);
          // Set the first page as selected by default
          const firstPage = Array.from(allPageNumbers)[0];
          setSelectedPage(firstPage);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setError("Failed to load chat history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages, isLoading]);

  // Handle page navigation and highlighting
  const handlePageNavigation = (pageNumber) => {
    console.log("Navigating to page:", pageNumber);

    // Update selected page
    setSelectedPage(pageNumber);

    // Add to highlighted pages if not already there
    setHighlightedPages((prev) => new Set([...prev, pageNumber]));

    // Call parent component's navigation function if provided
    if (onPageNavigate) {
      onPageNavigate(pageNumber);
    }

    // Call parent component's highlight function if provided
    if (onPageHighlight) {
      onPageHighlight(pageNumber);
    }
  };

  // Fixed summary function that displays the summary in chat
  const handleSummaryCurrentPage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://smartrevision.onrender.com/api/chat/${documentId}/${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const summary = response.data.summary;
      console.log("Summary of current page:", summary);

      // Create a summary message and add it to the chat
      const summaryMessage = {
        id: Date.now() + "summary",
        role: "assistant",
        content: `**Summary of Page ${currentPage}:**\n\n${summary}`,
        timestamp: new Date(),
        isSummary: true,
        pageNumber: currentPage
      };

      setMessages(prev => [...prev, summaryMessage]);

      // Add the page to highlighted pages
      setHighlightedPages(prev => new Set([...prev, selectedPage]));

    } catch (error) {
      console.error("Error in getting the summary of current page:", error);
      setError("Failed to get page summary");
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + "error",
        role: "assistant",
        content: "⚠️ Sorry, I couldn't generate a summary for this page. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Add user's message locally immediately for better UX
    const userMessage = {
      id: Date.now() + "user",
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = inputMessage;
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://smartrevision.onrender.com/api/chat/${documentId}`,
        { question },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { answer, chatHistory, citations } = response.data;
      console.log("AI Response:", answer);

      // Update chat messages with backend chatHistory
      const formattedMessages = chatHistory.map((msg, idx) => ({
        id: msg._id || idx + Date.now(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()),
        citations: msg.citations || [],
      }));

      console.log("Formatted messages:", response.data);
      setMessages(formattedMessages);

      // Extract page numbers from citations and content for highlighting
      const pageNumbers = new Set();

      // From citations
      if (citations && citations.length > 0) {
        citations.forEach((citation) => {
          if (citation.pageNumber) {
            pageNumbers.add(citation.pageNumber);
          }
        });
      }

      // From answer content
      if (answer && typeof answer === "string") {
        const pageRefRegex = /\[page\s+(\d+)\]/gi;
        let match;
        while ((match = pageRefRegex.exec(answer)) !== null) {
          const pageNumber = parseInt(match[1]);
          pageNumbers.add(pageNumber);
        }
      }

      if (pageNumbers.size > 0) {
        setHighlightedPages((prev) => new Set([...prev, ...pageNumbers]));

        // Set the first page as selected
        const firstPage = Array.from(pageNumbers)[0];
        setSelectedPage(firstPage);

        // Also navigate to the first page
        if (onPageNavigate) {
          onPageNavigate(firstPage);
        }
      }
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      setError("Failed to get response from AI");

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "error",
          role: "assistant",
          content: "⚠️ Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => {
      const input = document.querySelector(".message-input");
      if (input) input.focus();
    }, 0);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearChat = async () => {
    if (window.confirm("Are you sure you want to clear this chat?")) {
      try {
        await axios.delete(
          `https://smartrevision.onrender.com/api/chat/${documentId}/clear`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setMessages([]);
        setSelectedPage(null);
        setHighlightedPages(new Set());
      } catch (error) {
        console.error("Failed to clear chat:", error);
        setError("Failed to clear chat history");
      }
    }
  };

  const handleTextSelection = (text, pageNumber) => {
    setInputMessage(`About this text from page ${pageNumber}: "${text}"`);
    setTimeout(() => {
      const input = document.querySelector(".message-input");
      if (input) input.focus();
    }, 0);
  };

  // Function to check if a page should be highlighted
  const isPageHighlighted = (pageNumber) => {
    return highlightedPages.has(pageNumber);
  };

  // Function to process text and make page numbers clickable
  const processTextWithPageLinks = (text) => {
    if (!text) return text;

    // Regex to match page references like [page 7], [page 10], etc. (case insensitive)
    const pageRefRegex = /\[page\s+(\d+)\]/gi;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = pageRefRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const pageNumber = parseInt(match[1]);
      const isHighlighted = isPageHighlighted(pageNumber);
      const isSelected = selectedPage === pageNumber;

      // Create clickable page reference - show "Page 7" instead of "[page 7]"
      parts.push(
        <span
          key={match.index}
          className={`page-reference clickable ${isHighlighted ? "page-reference-highlighted" : ""} ${isSelected ? "page-reference-selected" : ""}`}
          onClick={() => handlePageNavigation(pageNumber)}
          title={`Go to page ${pageNumber}`}
        >
          Page {pageNumber}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Custom components for ReactMarkdown with clickable page references
  const MarkdownComponents = {
    p: ({ children }) => {
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === "string") {
          return processTextWithPageLinks(child);
        }
        // Handle arrays of strings (like from markdown parsing)
        if (Array.isArray(child)) {
          return child.map((item, index) =>
            typeof item === "string" ? processTextWithPageLinks(item) : item
          );
        }
        return child;
      });

      return <p className="markdown-paragraph">{processedChildren}</p>;
    },
    h1: ({ children }) => (
      <h1 className="markdown-heading markdown-h1">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="markdown-heading markdown-h2">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="markdown-heading markdown-h3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="markdown-heading markdown-h4">{children}</h4>
    ),
    ul: ({ children }) => (
      <ul className="markdown-list markdown-ul">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="markdown-list markdown-ol">{children}</ol>
    ),
    li: ({ children }) => {
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === "string") {
          return processTextWithPageLinks(child);
        }
        if (Array.isArray(child)) {
          return child.map((item, index) =>
            typeof item === "string" ? processTextWithPageLinks(item) : item
          );
        }
        return child;
      });

      return <li className="markdown-list-item">{processedChildren}</li>;
    },
    strong: ({ children }) => (
      <strong className="markdown-strong">{children}</strong>
    ),
    em: ({ children }) => <em className="markdown-emphasis">{children}</em>,
    code: ({ children, className }) => {
      const isInline = !className;
      if (isInline) {
        return <code className="markdown-inline-code">{children}</code>;
      }
      return (
        <pre className="markdown-code-block">
          <code className={className}>{children}</code>
        </pre>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="markdown-blockquote">{children}</blockquote>
    ),
    table: ({ children }) => (
      <div className="markdown-table-container">
        <table className="markdown-table">{children}</table>
      </div>
    ),
  };

  // Expose function to parent component
  useEffect(() => {
    window.chatInterfaceRef = {
      handleTextSelection,
      handlePageNavigation,
    };
  }, []);

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="ai-tutor-info">
            <div className="status-indicator">
              <div className="status-dot"></div>
            </div>
            <div className="tutor-text">
              <h3 className="tutor-title">AI Tutor</h3>
              <span className="tutor-status">• Ready to help</span>
            </div>
          </div>
          <div className="chat-actions">
            <button
              className="action-btn refresh-btn"
              onClick={fetchChatHistory}
              title="Refresh chat"
            >
              🔄
            </button>
            <button
              className="action-btn clear-btn"
              onClick={clearChat}
              title="Clear chat"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container with Fixed Height */}
      <div ref={messagesContainerRef} className="messages-container">
        {isLoadingHistory ? (
          <div className="loading-history">
            <div className="loading-spinner"></div>
            <p>Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-content">
              <div className="ai-avatar">
                <span className="avatar-emoji">🤖</span>
              </div>
              <h3 className="welcome-title">Welcome to AI Tutor!</h3>
              <p className="welcome-subtitle">
                Ask me anything about your course material. I can explain
                concepts, help with homework, and test your understanding.
              </p>

              <div className="quick-questions">
                <h4 className="quick-questions-title">Try asking:</h4>
                <div className="quick-questions-grid">
                  <button
                    onClick={() =>
                      handleQuickQuestion("Explain Newton's laws of motion")
                    }
                    className="quick-question-btn"
                  >
                    <span className="quick-question-emoji">🤔</span>
                    <span className="quick-question-text">
                      Explain Newton's laws of motion
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        "What are the key points from chapter 3?"
                      )
                    }
                    className="quick-question-btn"
                  >
                    <span className="quick-question-emoji">📖</span>
                    <span className="quick-question-text">
                      What are the key points from chapter 3?
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleQuickQuestion("Give me a quiz about thermodynamics")
                    }
                    className="quick-question-btn"
                  >
                    <span className="quick-question-emoji">🎯</span>
                    <span className="quick-question-text">
                      Give me a quiz about thermodynamics
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        "Can you summarize the main concepts?"
                      )
                    }
                    className="quick-question-btn"
                  >
                    <span className="quick-question-emoji">📝</span>
                    <span className="quick-question-text">
                      Can you summarize the main concepts?
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-wrapper ${message.role === "user" ? "user-message" : "assistant-message"} ${message.isError ? "error-message" : ""} ${message.isSummary ? "summary-message" : ""}`}
              >
                <div className="message-bubble">
                  {message.role === "assistant" && (
                    <div className="assistant-avatar">
                      <span>🤖</span>
                    </div>
                  )}

                  <div className="message-content">
                    <div className="message-text">
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>

                    {/* Show page number for summary messages */}
                    {message.isSummary && message.pageNumber && (
                      <div className="summary-source">
                        <span className="summary-page-badge">
                          📄 Page {message.pageNumber}
                        </span>
                      </div>
                    )}

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="citations-section">
                        <p className="citations-title">📚 Sources:</p>
                        <div className="citations-list">
                          {message.citations.map((citation, index) => (
                            <div
                              key={index}
                              className={`citation-item clickable ${isPageHighlighted(citation.pageNumber) ? "citation-highlighted" : ""}`}
                              onClick={() =>
                                handlePageNavigation(citation.pageNumber)
                              }
                              title={`Go to page ${citation.pageNumber}`}
                            >
                              <span className="citation-page">
                                Page {citation.pageNumber}:
                              </span>
                              <span className="citation-content">
                                {" "}
                                {citation.content}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="message-footer">
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.role === "assistant" && (
                        <span className="message-role">
                          {message.isSummary ? "AI Summary" : "AI Tutor"}
                        </span>
                      )}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="user-avatar">
                      <span>👤</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message-wrapper assistant-message">
                <div className="message-bubble">
                  <div className="assistant-avatar">
                    <span>🤖</span>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <div className="message-footer">
                      <span className="message-time">
                        {formatTime(new Date())}
                      </span>
                      <span className="message-role">AI Tutor</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="scroll-anchor" />
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span className="error-text">{error}</span>
            <button className="error-dismiss" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="input-area">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question..."
            className="message-input"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? <div className="button-spinner"></div> : "Send"}
          </Button>

          {/* Summarize Page Button */}
          <Button
            type="button"
            className="summarize-button"
            onClick={handleSummaryCurrentPage}
            disabled={isLoading || !selectedPage}
            title={`Summarize page ${selectedPage}`}
          >
            📝
          </Button>
        </div>

        <div className="input-footer">
          <span className="disclaimer">AI may make mistakes. Verify info.</span>
          <span className="shortcut-hint">Press Enter to send</span>
          {selectedPage && (
            <span className="current-page-hint">Current page: {selectedPage}</span>
          )}
        </div>
      </form>
    </div>
  );
};