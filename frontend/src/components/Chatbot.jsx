import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, RefreshCw, Phone, Mail, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useAuth } from '@/context/AuthContext';

const BOT_AVATAR = "/bot-avatar.png";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! 👋 I am VaquaH. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    message: userMessage.content,
                    history: messages.slice(-5), // Send last 5 messages for context
                    user: user ? { name: user.name, email: user.email, id: user.uid } : null
                })
            });

            const data = await response.json();

            const botMessage = {
                role: 'assistant',
                content: data.response,
                type: data.type,
                options: data.options
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionClick = (option) => {
        if (option.action === 'end_chat') {
            setMessages([{ role: 'assistant', content: 'Hello! 👋 I am VaquaH. How can I help you today?' }]);
            setIsOpen(false);
        } else if (option.action === 'new_chat') {
            setMessages([{ role: 'assistant', content: 'Thank you for using VaquaH services! 🙏' }]);
            setTimeout(() => {
                setMessages([{ role: 'assistant', content: 'Hello! 👋 I am VaquaH. How can I help you today?' }]);
            }, 5000);
        } else if (option.action === 'link') {
            window.open(option.url, '_blank');
        }
    };

    if (isAuthPage) return null;

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-8 z-[100] rounded-full w-16 h-16 p-0 shadow-xl hover:scale-110 transition-all duration-300 animate-in fade-in zoom-in overflow-hidden border-2 border-white"
                    aria-label="Open Chat"
                >
                    <Avatar className="w-full h-full">
                        <AvatarImage src={BOT_AVATAR} className="object-cover" />
                        <AvatarFallback className="bg-vaquah-blue text-white"><MessageCircle className="w-8 h-8" /></AvatarFallback>
                    </Avatar>
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-24 right-8 z-[100] w-[350px] h-[500px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 border-vaquah-blue border-2 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-vaquah-blue text-white p-4 flex flex-row justify-between items-center space-y-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white/20">
                                <AvatarImage src={BOT_AVATAR} />
                                <AvatarFallback className="bg-white/10 text-white"><Bot className="w-6 h-6" /></AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-lg">VaquaH</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 h-8 w-8" onClick={() => setMessages([{ role: 'assistant', content: 'Hello! 👋 I am VaquaH. How can I help you today?' }])}>
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 h-8 w-8" onClick={() => setIsOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-grow p-4 overflow-y-auto bg-gray-50" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <Avatar className="w-8 h-8 mt-1">
                                            {msg.role === 'user' ? (
                                                <>
                                                    <AvatarImage src={user?.photoURL} />
                                                    <AvatarFallback className="bg-gray-300"><User className="w-4 h-4" /></AvatarFallback>
                                                </>
                                            ) : (
                                                <>
                                                    <AvatarImage src={BOT_AVATAR} />
                                                    <AvatarFallback className="bg-vaquah-blue text-white"><Bot className="w-4 h-4" /></AvatarFallback>
                                                </>
                                            )}
                                        </Avatar>
                                        <div className={`p-3 rounded-lg text-sm ${msg.role === 'user'
                                            ? 'bg-vaquah-blue text-white rounded-tr-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                            }`}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>

                                            {/* Options / Buttons */}
                                            {msg.options && (
                                                <div className="mt-3 flex flex-col gap-2">
                                                    {msg.options.map((opt, i) => (
                                                        <Button
                                                            key={i}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full justify-start text-xs border-vaquah-blue text-vaquah-blue hover:bg-blue-50"
                                                            onClick={() => handleOptionClick(opt)}
                                                        >
                                                            {opt.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2 max-w-[80%]">
                                        <Avatar className="w-8 h-8 mt-1">
                                            <AvatarImage src={BOT_AVATAR} />
                                            <AvatarFallback className="bg-vaquah-blue text-white"><Bot className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="p-3 bg-white border-t">
                        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-grow"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-vaquah-blue hover:bg-blue-700">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </>
    );
};

export default Chatbot;
