import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import { X, Send, ChevronLeft, MessageSquare, Check, RefreshCw, MessageCircle, Minus, Smile, Paperclip, Search, Camera, Eye, Users } from 'lucide-react';
import profileService from '../services/profileService';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

export const MessagePanel = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // View States
    const [isMinimized, setIsMinimized] = useState(false);
    const [managerTab, setManagerTab] = useState(user?.role === 'Admin' ? 'Manager' : 'Employee');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);

    // Interaction States
    const [activeChat, setActiveChat] = useState(null); // replaces activeChatUser { ...data, isGroup }
    const [newMessageText, setNewMessageText] = useState('');

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [viewingProfile, setViewingProfile] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        if (isOpen && user) {
            const backendUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
            socketRef.current = io(backendUrl, { withCredentials: true });
            
            socketRef.current.emit('setup', user);
            
            socketRef.current.on('receiveMessage', (message) => {
                setMessages((prev) => {
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [message, ...prev];
                });
            });
        }
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [isOpen, user]);

    // Fetch dependencies when opened
    useEffect(() => {
        if (isOpen) {
            setIsMinimized(false);
            fetchMessages();
            fetchRecipients();
        }
    }, [isOpen, user?.role]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (!isMinimized && activeChat) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeChat, isMinimized]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await messageService.getMessages();
            setMessages(res.data || []);

            // Mark read if active chat is personal
            if (activeChat && !activeChat.isGroup && res.data) {
                const unread = res.data.filter(
                    m => m.senderId?._id === activeChat._id && m.receiverId?._id === user._id && !m.read
                );
                unread.forEach(m => handleReadMessage(m._id));
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
            setAvailableUsers(res.data?.users || []);
            setAvailableGroups(res.data?.groups || []);
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
        let contacts = [];
        let groups = [];
        
        if (user?.role === 'Manager' || user?.role === 'Admin') {
            contacts = availableUsers.filter(u => u.role === managerTab);
            groups = availableGroups.filter(g => {
                if (managerTab === 'Employee') return g.name === 'Employees';
                if (managerTab === 'Auditor') return g.name === 'Auditors';
                return false;
            });
        } else {
            groups = availableGroups;
            const contactsMap = new Map();
            messages.forEach(m => {
                if (m.groupId) return;
                const otherUser = m.senderId?._id === user._id ? m.receiverId : m.senderId;
                if (otherUser && !contactsMap.has(otherUser._id)) {
                    contactsMap.set(otherUser._id, otherUser);
                }
            });
            contacts = Array.from(contactsMap.values());
            
            // Add managers if they haven't sent a message yet
            const managers = availableUsers.filter(u => u.role === 'Manager' || u.role === 'Admin');
            managers.forEach(mgr => {
                if (!contactsMap.has(mgr._id)) contacts.push(mgr);
            });
        }
        return { contacts, groups };
    };

    const handleSelectChat = (target, isGroup = false) => {
        setActiveChat({ ...target, isGroup });
        if (isGroup && socketRef.current) {
            socketRef.current.emit('join chat', target._id);
        }

        // Mark unread for personal chat
        if (!isGroup) {
            const unread = messages.filter(m => !m.groupId && m.senderId?._id === target._id && m.receiverId?._id === user._id && !m.read);
            unread.forEach(m => handleReadMessage(m._id));
        }
    };

    const handleViewProfile = (e, obj, isGroup = false) => {
        e.stopPropagation();
        setViewingProfile({ ...obj, isGroup });
    };

    const handleSendMessage = async () => {
        if (!newMessageText.trim() || !activeChat) return;
        try {
            setLoading(true);
            const isGroup = activeChat.isGroup;
            let res;
            if (isGroup) {
                res = await messageService.sendMessage(null, activeChat._id, newMessageText);
            } else {
                res = await messageService.sendMessage(activeChat._id, null, newMessageText);
            }

            setMessages(prev => {
                if (prev.find(m => m._id === res.data._id)) return prev;
                return [res.data, ...prev];
            });

            setNewMessageText('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    const addEmoji = (emoji) => {
        setNewMessageText(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const commonEmojis = ['😊', '😂', '👍', '❤️', '🔥', '✨', '🙌', '🙏', '🎉', '💡', '🤔', '✅', '⚠️', '❌', '🚀', '⭐'];

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const uploadRes = await profileService.uploadFile(file);
            const filename = uploadRes.data.filename;

            const updateRes = await profileService.updateProfile({ avatar: filename });
            if (updateRes.success) {
                updateUser({ avatar: filename });
                toast.success("Profile photo updated");
                fetchMessages();
            }
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            toast.error("Failed to update profile photo");
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '').replace(/\/$/, '') || '';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const timestamp = new Date().getTime();
        return `${baseUrl}${cleanPath}?t=${timestamp}`;
    };

    if (!isOpen) return null;

    const { contacts, groups } = getContactList();
    
    const filteredContacts = contacts.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeChatHistory = activeChat
        ? messages.filter(m => {
            if (activeChat.isGroup) return m.groupId?._id === activeChat._id;
            if (user?.role === 'Manager') {
                return !m.groupId && (m.senderId?._id === activeChat._id || m.receiverId?._id === activeChat._id);
            }
            return !m.groupId && (
                (m.senderId?._id === activeChat._id && m.receiverId?._id === user._id) ||
                (m.senderId?._id === user._id && m.receiverId?._id === activeChat._id)
            );
        }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : [];

    return (
        <div className={`fixed top-20 right-4 lg:right-8 w-[360px] bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] z-[999999] flex flex-col border border-slate-200 dark:border-slate-800 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMinimized ? 'h-[64px]' : 'h-[500px] animate-fade-in origin-top-right'}`}>
            <div
                className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0 shadow-sm cursor-pointer transition-colors ${isMinimized ? 'rounded-[1.5rem]' : 'rounded-t-[1.5rem]'}`}
                onClick={() => isMinimized && setIsMinimized(false)}
            >
                <div className="flex items-center gap-3">
                    {activeChat && !isMinimized ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveChat(null); }}
                                className="p-1.5 -ml-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div
                                className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden cursor-pointer border border-indigo-100 dark:border-indigo-500/20"
                                onClick={(e) => handleViewProfile(e, activeChat, activeChat.isGroup)}
                            >
                                {activeChat.isGroup ? <Users className="w-4 h-4" /> : (
                                    activeChat.avatar ? (
                                        <img src={getAvatarUrl(activeChat.avatar)} alt={activeChat.name} className="w-full h-full object-cover" />
                                    ) : activeChat.name.charAt(0)
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="relative group/avatar">
                            <div
                                className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden cursor-pointer hover:ring-2 ring-indigo-500/30 transition-all"
                                onClick={(e) => handleViewProfile(e, user, false)}
                            >
                                {user?.avatar ? (
                                    <img src={getAvatarUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                                ) : <MessageCircle className="w-4 h-4" />}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                            <button
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                className="absolute -top-1 -left-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-100 dark:border-slate-700 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-slate-500 hover:text-indigo-500"
                                title="Change profile photo"
                            >
                                <Camera className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col cursor-pointer group" onClick={(e) => { e.stopPropagation(); if (activeChat) handleViewProfile(e, activeChat, activeChat.isGroup); }}>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none group-hover:text-indigo-600 transition-colors">
                                {activeChat && !isMinimized ? activeChat.name : 'Messages'}
                            </h2>
                            {(!activeChat || isMinimized) && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            {activeChat && !isMinimized ? (activeChat.isGroup ? 'Group Chat' : (activeChat.auditorType || activeChat.role)) : 'Online'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!activeChat && !isMinimized && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchQuery(''); }}
                            className={`p-2 rounded-xl transition-colors ${isSearchOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    )}
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

            {/* Profile Overview */}
            {viewingProfile && (
                <div className="absolute inset-0 z-[100] bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300 rounded-[1.5rem] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button onClick={() => setViewingProfile(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{viewingProfile.isGroup ? 'Group Info' : 'User Profile'}</h3>
                        <div className="w-8" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-black overflow-hidden border-2 border-indigo-100 dark:border-indigo-500/20 shadow-xl">
                                {viewingProfile.isGroup ? <Users className="w-10 h-10" /> : (
                                    viewingProfile.avatar ? <img src={getAvatarUrl(viewingProfile.avatar)} alt={viewingProfile.name} className="w-full h-full object-cover" /> : viewingProfile.name.charAt(0)
                                )}
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">{viewingProfile.name}</h2>
                        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 mb-6">
                            {viewingProfile.isGroup ? 'Group Conversation' : (viewingProfile.auditorType || viewingProfile.role)}
                        </span>
                        
                        {!viewingProfile.isGroup && (
                            <div className="w-full space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col items-start px-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewingProfile.email || 'No email available'}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => { handleSelectChat(viewingProfile, viewingProfile.isGroup); setViewingProfile(null); }}
                            className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                        >
                            Open Chat
                        </button>
                    </div>
                </div>
            )}

            {/* Main Body */}
            {!isMinimized && (
                <div className="flex flex-col flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
                    
                    {isSearchOpen && !activeChat && (
                        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-300">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 dark:text-white placeholder-slate-400 font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {!activeChat ? (
                        <div className="flex flex-col h-full w-full absolute inset-0 animate-fade-in">
                            {(user?.role === 'Manager' || user?.role === 'Admin') && (
                                <div className="flex p-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                    <button onClick={() => setManagerTab('Employee')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${managerTab === 'Employee' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>Employees</button>
                                    <button onClick={() => setManagerTab('Auditor')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${managerTab === 'Auditor' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>Auditors</button>
                                    <button onClick={() => setManagerTab('Admin')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${managerTab === 'Admin' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>Admins</button>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto absolute-scroll p-2 space-y-0.5">
                                {/* GROUPS */}
                                {groups.length > 0 && groups.map(group => {
                                    const latestMsg = messages.filter(m => m.groupId?._id === group._id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                                    return (
                                        <button key={`g-${group._id}`} onClick={() => handleSelectChat(group, true)} className="w-full p-3 rounded-xl text-left bg-indigo-50/50 hover:bg-indigo-100/50 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 mb-2 transition-all flex items-center justify-between border border-indigo-100/50 dark:border-indigo-500/20">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-black leading-tight text-indigo-900 dark:text-indigo-200 truncate">{group.name} Group</p>
                                                    <p className="text-xs mt-0.5 truncate text-indigo-700/80 dark:text-indigo-300/80">
                                                        {latestMsg ? <><span className="font-bold">{latestMsg.senderId?.name}: </span>{latestMsg.message}</> : 'Tap to open group chat'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/30 text-[9px] font-bold text-indigo-600 dark:text-indigo-300 rounded-md shrink-0">GROUP</span>
                                        </button>
                                    );
                                })}

                                {/* CONTACTS */}
                                {filteredContacts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-xs text-slate-500 font-medium">No contacts found</p>
                                    </div>
                                ) : (
                                    filteredContacts.map(contact => {
                                        const unread = messages.filter(m => !m.groupId && m.senderId?._id === contact._id && m.receiverId?._id === user._id && !m.read).length;
                                        const contactMsgs = messages.filter(m => !m.groupId && ((m.senderId?._id === contact._id && m.receiverId?._id === user._id) || (m.senderId?._id === user._id && m.receiverId?._id === contact._id)));
                                        const latest = contactMsgs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                                        return (
                                            <button key={`c-${contact._id}`} onClick={() => handleSelectChat(contact, false)} className="w-full p-2.5 rounded-xl text-left hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="relative shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-sm overflow-hidden">
                                                        {contact.avatar ? <img src={getAvatarUrl(contact.avatar)} alt={contact.name} className="w-full h-full object-cover" /> : contact.name.charAt(0)}
                                                        {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[8px] font-black text-white">{unread}</span>}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{contact.name}</p>
                                                        <p className={`text-xs truncate ${unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                                                            {latest ? latest.message : <span className="text-[9px] uppercase tracking-widest opacity-70">Personal Chat</span>}
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
                        <div className="flex flex-col h-full w-full absolute inset-0 bg-slate-50/30 dark:bg-slate-900/30 animate-fade-in">
                            <div className="flex-1 overflow-y-auto absolute-scroll p-4 space-y-3">
                                {activeChatHistory.length === 0 ? (
                                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest my-10">Start of conversation</p>
                                ) : (
                                    activeChatHistory.map(msg => {
                                        const isSelf = msg.senderId?._id === user._id || (user?.role === 'Manager' && msg.senderRole === 'Manager' && !activeChat.isGroup);
                                        return (
                                            <div key={msg._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-[0.75rem] px-3.5 py-2 shadow-sm relative ${isSelf ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border-b border-black/10'}`}>
                                                    {!isSelf && activeChat.isGroup && (
                                                        <p className="text-[10px] text-[#53bdeb] font-bold pb-0.5">{msg.senderId?.name} ({msg.senderRole})</p>
                                                    )}
                                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium pb-1.5">{msg.message}</p>
                                                    <div className={`flex items-center gap-1 text-[10px] select-none ${isSelf ? 'text-white/60 justify-end' : 'text-white/50 justify-start'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isSelf && !activeChat.isGroup && (
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

                            <div className="px-3 pb-3 pt-2 bg-transparent shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 flex items-end gap-2 bg-[#2a3942] pl-3 pr-1.5 py-1.5 rounded-[1.5rem] shadow-sm relative">
                                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-1.5 transition-colors mb-0.5 shrink-0 ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                                            <Smile className="w-[22px] h-[22px]" />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-full left-0 mb-4 bg-[#233138] border border-white/10 rounded-2xl p-2 z-[110] grid grid-cols-4 gap-1 w-[190px]">
                                                {commonEmojis.map(emoji => (
                                                    <button key={emoji} onClick={() => addEmoji(emoji)} className="w-10 h-10 hover:bg-white/10 rounded-xl">{emoji}</button>
                                                ))}
                                            </div>
                                        )}

                                        <textarea
                                            className="flex-1 bg-transparent border-none text-[14px] text-[#d1d7db] px-1 py-1.5 resize-none h-[38px] min-h-[38px] focus:ring-0 placeholder-[#8696a0] absolute-scroll"
                                            placeholder="Type a message"
                                            value={newMessageText}
                                            onChange={(e) => setNewMessageText(e.target.value)}
                                            onFocus={() => setShowEmojiPicker(false)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                        ></textarea>
                                    </div>
                                    <button onClick={handleSendMessage} disabled={loading || !newMessageText.trim()} className="w-[46px] h-[46px] rounded-full bg-[#00a884] shadow-md flex items-center justify-center shrink-0 disabled:opacity-50">
                                        {loading ? <RefreshCw className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 ml-1 text-white" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        </div>
    );
};

export default MessagePanel;
