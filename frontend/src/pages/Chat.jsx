import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useSocket } from '../hooks/useSocket.js';
import {
    Send,
    Smile,
    MoreHorizontal,
    Reply,
    Edit3,
    Trash2,
    Users,
    MessageCircle,
    Clock
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import Button from '../components/common/Button.jsx';
import toast from 'react-hot-toast';

const Chat = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(user?.semester || 'general');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);

    const fetchMessages = async (semesterId) => {
        try {
            setLoading(true);
            const response = await chatService.getChatMessages(semesterId);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSemester) {
            fetchMessages(selectedSemester);
        }
    }, [selectedSemester]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (socket) {
            // Join semester chat room
            socket.emit('join-chat', selectedSemester);

            // Listen for new messages
            socket.on('new-message', (newMessage) => {
                setMessages(prev => [...prev, newMessage]);
            });

            // Listen for message updates
            socket.on('message-updated', (updatedMessage) => {
                setMessages(prev => prev.map(msg =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                ));
            });

            // Listen for message deletions
            socket.on('message-deleted', (messageId) => {
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId ? { ...msg, isDeleted: true, message: 'This message was deleted' } : msg
                ));
            });

            // Listen for online users
            socket.on('online-users', (users) => {
                setOnlineUsers(users);
            });

            return () => {
                socket.off('new-message');
                socket.off('message-updated');
                socket.off('message-deleted');
                socket.off('online-users');
            };
        }
    }, [socket, selectedSemester]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        try {
            const messageData = {
                message: message.trim(),
                messageType: 'text',
                replyTo: replyingTo
            };

            await chatService.sendMessage(selectedSemester, messageData);

            setMessage('');
            setReplyingTo(null);
            inputRef.current?.focus();
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send message');
        }
    };

    const handleEditMessage = async (messageId) => {
        if (!editContent.trim()) return;

        try {
            await chatService.editMessage(messageId, editContent.trim());
            setEditingMessage(null);
            setEditContent('');
            toast.success('Message updated');
        } catch (error) {
            console.error('Edit message error:', error);
            toast.error(error.response?.data?.message || 'Failed to edit message');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            await chatService.deleteMessage(messageId);
            toast.success('Message deleted');
        } catch (error) {
            console.error('Delete message error:', error);
            toast.error('Failed to delete message');
        }
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            await chatService.addReaction(messageId, emoji);
        } catch (error) {
            console.error('Reaction error:', error);
            toast.error('Failed to add reaction');
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(message => {
            const date = formatDate(message.createdAt);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        return groups;
    };

    const isConsecutiveMessage = (currentMsg, previousMsg) => {
        if (!previousMsg) return false;

        const timeDiff = new Date(currentMsg.createdAt) - new Date(previousMsg.createdAt);
        return currentMsg.sender._id === previousMsg.sender._id && timeDiff < 5 * 60 * 1000; // 5 minutes
    };

    if (loading) {
        return <LoadingSpinner text="Loading chat..." />;
    }

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="w-6 h-6 text-blue-600" />
                            <h1 className="text-xl font-semibold text-gray-900">
                                {selectedSemester === 'general' ? 'General Chat' : `Semester ${selectedSemester} Chat`}
                            </h1>
                        </div>

                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="general">General Chat</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                            <option value="3">Semester 3</option>
                            <option value="4">Semester 4</option>
                            <option value="5">Semester 5</option>
                            <option value="6">Semester 6</option>
                            <option value="7">Semester 7</option>
                            <option value="8">Semester 8</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{onlineUsers.length} online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(messageGroups).map(([date, dateMessages]) => (
                    <div key={date}>
                        {/* Date Separator */}
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {date}
                            </div>
                        </div>

                        {/* Messages for this date */}
                        {dateMessages.map((msg, index) => {
                            const isOwn = msg.sender._id === user?.id;
                            const previousMsg = index > 0 ? dateMessages[index - 1] : null;
                            const isConsecutive = isConsecutiveMessage(msg, previousMsg);
                            const showAvatar = !isConsecutive || !isOwn;

                            return (
                                <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                                        {/* Avatar */}
                                        {showAvatar && !isOwn && (
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                                {msg.sender.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {showAvatar && isOwn && <div className="w-8"></div>}
                                        {!showAvatar && <div className="w-8"></div>}

                                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                            {/* Sender name and time */}
                                            {!isConsecutive && (
                                                <div className={`flex items-center space-x-2 mb-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {isOwn ? 'You' : msg.sender.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Message bubble */}
                                            <div className={`relative group ${isOwn ? 'ml-8' : 'mr-8'}`}>
                                                {/* Reply indicator */}
                                                {msg.replyTo && (
                                                    <div className={`text-xs text-gray-600 mb-1 p-2 bg-gray-100 rounded-lg ${isOwn ? 'ml-4' : 'mr-4'}`}>
                                                        <div className="flex items-center space-x-1">
                                                            <Reply className="w-3 h-3" />
                                                            <span>Replying to {msg.replyTo.sender?.name}</span>
                                                        </div>
                                                        <p className="truncate">{msg.replyTo.message}</p>
                                                    </div>
                                                )}

                                                {editingMessage === msg._id ? (
                                                    <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500"
                                                            rows={2}
                                                        />
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="primary"
                                                                onClick={() => handleEditMessage(msg._id)}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingMessage(null);
                                                                    setEditContent('');
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`px-3 py-2 rounded-lg ${isOwn
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-gray-900 border border-gray-200'
                                                        }`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                        {msg.isEdited && (
                                                            <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                                                                (edited)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Message actions */}
                                                {!editingMessage && (
                                                    <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-sm p-1`}>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleReaction(msg._id, '👍')}
                                                            className="text-xs"
                                                        >
                                                            👍
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setReplyingTo(msg)}
                                                            icon={Reply}
                                                        >
                                                        </Button>
                                                        {isOwn && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setEditingMessage(msg._id);
                                                                        setEditContent(msg.message);
                                                                    }}
                                                                    icon={Edit3}
                                                                >
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                                    icon={Trash2}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Reactions */}
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {Object.entries(
                                                            msg.reactions.reduce((acc, reaction) => {
                                                                acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                                                return acc;
                                                            }, {})
                                                        ).map(([emoji, count]) => (
                                                            <span
                                                                key={emoji}
                                                                className="text-xs bg-gray-100 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-200"
                                                                onClick={() => handleReaction(msg._id, emoji)}
                                                            >
                                                                {emoji} {count}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply indicator */}
            {replyingTo && (
                <div className="bg-blue-50 border-t border-blue-200 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm">
                            <Reply className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-800">
                                Replying to <strong>{replyingTo.sender.name}</strong>
                            </span>
                            <span className="text-blue-600 truncate max-w-xs">
                                {replyingTo.message}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setReplyingTo(null)}
                        >
                            ✕
                        </Button>
                    </div>
                </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <div className="flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Message ${selectedSemester === 'general' ? 'everyone' : `semester ${selectedSemester}`}...`}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!message.trim()}
                        icon={Send}
                    >
                        Send
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
