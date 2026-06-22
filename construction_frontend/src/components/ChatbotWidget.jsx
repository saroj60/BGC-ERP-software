import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'model', content: "Hello! I am your AI Construction Assistant. How can I help you today?" }]);
        }
    }, [isOpen, messages.length]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // We pass the previous history (excluding the very first greeting if we want, or pass everything)
            const response = await axios.post('/api/chat/', {
                message: userMsg.content,
                history: messages
            });
            
            setMessages([...newMessages, { role: 'model', content: response.data.reply }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'model', content: "⚠️ Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    border: '1px solid #e2e8f0'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-soft, #6366f1))',
                        color: 'white',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '600'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🤖</span>
                            AI Assistant
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : 'white',
                                color: msg.role === 'user' ? 'white' : '#334155',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                                borderBottomLeftRadius: msg.role === 'model' ? '2px' : '12px',
                                maxWidth: '85%',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}>
                                {/* Extremely basic markdown rendering for bold text and line breaks */}
                                {msg.content.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line.replace(/\*\*(.*?)\*\*/g, '$1')} 
                                        <br/>
                                    </span>
                                ))}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', backgroundColor: 'white', padding: '10px 14px', borderRadius: '12px', color: '#94a3b8', fontSize: '0.9rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ display: 'flex', padding: '12px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', gap: '8px' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                        />
                        <button type="submit" disabled={loading || !input.trim()} style={{ 
                            padding: '10px 16px', 
                            backgroundColor: 'var(--primary-color)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: (loading || !input.trim()) ? 0.6 : 1
                        }}>
                            Send
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    fontSize: '1.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'scale(0.9)' : 'scale(1)'
                }}
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default ChatbotWidget;
