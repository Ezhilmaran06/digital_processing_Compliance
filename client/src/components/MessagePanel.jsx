import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import { X, Send, ChevronLeft, MessageSquare, Check, RefreshCw, MessageCircle, Minus, Smile, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

/**
 * MessagePanel - Compact Floating Chat Widget (Instagram/Messenger Style)
 */
const MessagePanel = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // View States
    const [isMinimized, setIsMinimized] = useState(false);
    const [managerTab, setManagerTab] = useState('Employee'); // 'Employee', 'Auditor'
    const [availableUsers, setAvailableUsers] = useState([]);

    // Interaction States
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');

    const messagesEndRef = useRef(null);

    // Fetch dependencies when opened
    useEffect(() => {
        if (isOpen) {
            setIsMinimized(false); // Reset minimize state on open
            fetchMessages();
            if (user?.role === 'Manager') {
                fetchRecipients();
            }
        }
    }, [isOpen, user?.role]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (!isMinimized && activeChatUser) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeChatUser, isMinimized]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await messageService.getMessages();
            setMessages(res.data);

            // Mark as read unread messages in the currently active chat
            if (activeChatUser && res.data) {
                const unreadInActiveChat = res.data.filter(
                    m => m.senderId._id === activeChatUser._id && m.receiverId._id === user._id && !m.read
                );
                unreadInActiveChat.forEach(m => handleReadMessage(m._id));
            }

        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipients = async () => {
        try {
            const res = await messageService.getRecipients();
            setAvailableUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch recipients", error);
        }
    };

    const handleReadMessage = async (msgId) => {
        try {
            await messageService.markAsRead(msgId);
            setMessages(prev => prev.map(m => m._id === msgId ? { ...m, read: true } : m));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    // Derived states
    const getContactList = () => {
        if (user?.role === 'Manager') {
            return availableUsers.filter(u => u.role === managerTab);
        }

        // For non-managers, derive unique contacts from their message history
        const contactsMap = new Map();
        messages.forEach(m => {
            const otherUser = m.senderId._id === user._id ? m.receiverId : m.senderId;
            if (!contactsMap.has(otherUser._id)) {
                contactsMap.set(otherUser._id, otherUser);
            }
        });
        return Array.from(contactsMap.values());
    };

    const handleSelectChatUser = (targetUser) => {
        setActiveChatUser(targetUser);

        // Mark their unread messages as read upon clicking them
        const unread = messages.filter(m => m.senderId._id === targetUser._id && m.receiverId._id === user._id && !m.read);
        unread.forEach(m => handleReadMessage(m._id));
    };

    const handleSendMessage = async () => {
        if (!newMessageText.trim() || !activeChatUser) return;
        try {
            setLoading(true);
            const res = await messageService.sendMessage(activeChatUser._id, newMessageText);

            // Optimistic insert to avoid full reload delay
            setMessages([res.data, ...messages]);

            setNewMessageText('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const contacts = getContactList();

    // Filter messages for the currently selected chat user
    const activeChatHistory = activeChatUser
        ? messages.filter(m => {
            if (user?.role === 'Manager') {
                return m.senderId._id === activeChatUser._id || m.receiverId._id === activeChatUser._id;
            }
            return (m.senderId._id === activeChatUser._id && m.receiverId._id === user._id) ||
                (m.senderId._id === user._id && m.receiverId._id === activeChatUser._id);
        }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Chronological
        : [];

    return (
        <div className={`fixed top-20 right-4 lg:right-8 w-[360px] bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] z-[999999] flex flex-col border border-slate-200 dark:border-slate-800 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMinimized ? 'h-[64px]' : 'h-[500px] animate-fade-in origin-top-right'}`}>
            <div
                className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0 shadow-sm cursor-pointer transition-colors ${isMinimized ? 'rounded-[1.5rem]' : 'rounded-t-[1.5rem]'}`}
                onClick={() => isMinimized && setIsMinimized(false)}
            >
                <div className="flex items-center gap-3">
                    {activeChatUser && !isMinimized ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveChatUser(null); }}
                            className="p-1.5 -ml-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                                {activeChatUser && !isMinimized ? activeChatUser.name : 'Messages'}
                            </h2>
                            {(!activeChatUser || isMinimized) && (
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            {activeChatUser && !isMinimized ? (activeChatUser.auditorType || activeChatUser.role) : 'Online'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!isMinimized && (
                        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                            <Minus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 rounded-xl text-slate-400 transition-colors">
                        <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                </div>
            </div>

            {/* -------------------- BODY (Contacts vs Chat) -------------------- */}
            {!isMinimized && (
                <div className="flex flex-col flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">

                    {!activeChatUser ? (
                        /* --- CONTACT LIST VIEW --- */
                        <div className="flex flex-col h-full w-full absolute inset-0 animate-fade-in">
                            {user?.role === 'Manager' && (
                                <div className="flex p-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                    <button
                                        onClick={() => setManagerTab('Employee')}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${managerTab === 'Employee' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                    >
                                        Employees
                                    </button>
                                    <button
                                        onClick={() => setManagerTab('Auditor')}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${managerTab === 'Auditor' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                    >
                                        Auditors
                                    </button>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto absolute-scroll p-2 space-y-0.5">
                                {contacts.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500 font-medium">No contacts found</p>
                                    </div>
                                ) : (
                                    contacts.map(contact => {
                                        // Count unread for this specific contact
                                        const unreadCount = messages.filter(m => m.senderId._id === contact._id && m.receiverId._id === user._id && !m.read).length;
                                        // Get latest message preview
                                        const contactMessages = messages.filter(m => (m.senderId._id === contact._id && m.receiverId._id === user._id) || (m.senderId._id === user._id && m.receiverId._id === contact._id));
                                        const latestMessage = contactMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                                        return (
                                            <button
                                                key={contact._id}
                                                onClick={() => handleSelectChatUser(contact)}
                                                className="w-full p-3 rounded-xl text-left hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="relative shrink-0">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                                                            {contact.name.charAt(0)}
                                                        </div>
                                                        {unreadCount > 0 && (
                                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[8px] font-black text-white">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white truncate">{contact.name}</p>
                                                        <p className={`text-xs mt-0.5 truncate ${unreadCount > 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500'}`}>
                                                            {latestMessage ? latestMessage.message : <span className="text-[9px] uppercase tracking-widest opacity-70">New Contact</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ) : (
                        /* --- CHAT HISTORY VIEW --- */
                        <div className="flex flex-col h-full w-full absolute inset-0 bg-slate-50/30 dark:bg-slate-900/30 animate-fade-in">

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto absolute-scroll p-4 space-y-3">
                                {activeChatHistory.length === 0 ? (
                                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest my-10">Start of conversation</p>
                                ) : (
                                    activeChatHistory.map(msg => {
                                        let isSelf = msg.senderId._id === user._id;
                                        // Managers view messages sent by ANY manager as "self"
                                        if (user?.role === 'Manager' && msg.senderRole === 'Manager') {
                                            isSelf = true;
                                        }

                                        return (
                                            <div key={msg._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-[0.75rem] px-3.5 py-2 shadow-sm relative ${isSelf ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border-b border-black/10'}`}>
                                                    {user?.role === 'Manager' && msg.senderRole === 'Manager' && msg.senderId._id !== user._id && (
                                                        <p className="text-[10px] text-[#53bdeb] font-bold pb-0.5">{msg.senderId.name}</p>
                                                    )}
                                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium pb-1.5">{msg.message}</p>
                                                    <div className={`flex items-center gap-1 text-[10px] select-none ${isSelf ? 'text-white/60 justify-end' : 'text-white/50 justify-start'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isSelf && (
                                                            <span className="flex items-center ml-0.5">
                                                                <Check className={`w-[14px] h-[14px] ${msg.read ? 'text-[#53bdeb]' : 'opacity-70'}`} />
                                                                {msg.read && <Check className="w-[14px] h-[14px] -ml-[12px] text-[#53bdeb]" />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area (Hidden for Employees) */}
                            {user?.role !== 'Employee' && (
                                <div className="px-3 pb-3 pt-2 bg-transparent shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 flex items-end gap-2 bg-[#2a3942] pl-3 pr-1.5 py-1.5 rounded-[1.5rem] shadow-sm">
                                            <button className="p-1.5 text-[#8696a0] hover:text-[#d1d7db] transition-colors mb-0.5 shrink-0">
                                                <Smile className="w-[22px] h-[22px]" />
                                            </button>

                                            <textarea
                                                className="flex-1 bg-transparent border-none text-[14px] font-normal text-[#d1d7db] px-1 py-1.5 resize-none h-[38px] min-h-[38px] focus:ring-0 absolute-scroll max-h-[100px] placeholder-[#8696a0]"
                                                placeholder="Type a message"
                                                value={newMessageText}
                                                onChange={(e) => setNewMessageText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                            ></textarea>

                                            <button className="p-1.5 text-[#8696a0] hover:text-[#d1d7db] transition-colors mb-0.5 shrink-0">
                                                <Paperclip className="w-5 h-5 -rotate-45" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleSendMessage}
                                            disabled={loading || !newMessageText.trim()}
                                            className="w-[46px] h-[46px] rounded-full bg-[#00a884] hover:bg-[#06cf9c] disabled:opacity-50 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0"
                                        >
                                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Rule warning UI for Employee edge case */}
                            {user?.role === 'Employee' && activeChatHistory.length > 0 && (
                                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 text-center">
                                    <p className="text-[11px] text-slate-400 font-bold">Read-only broadcast</p>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MessagePanel;
