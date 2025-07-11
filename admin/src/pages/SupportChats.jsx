import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

const SupportChats = () => {
  const { token, admin } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const scrollRef = useRef();

  useEffect(() => {
    fetch('https://lashwa.com/admin/support/chats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setChats(data.chats || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch support chats');
        setLoading(false);
      });
  }, [token]);

  const openChat = chat => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);
    setChatDialogOpen(true);
    if (socketRef.current) socketRef.current.disconnect();
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_support_chat', chat._id);
    socketRef.current.on('support_message', ({ chatId, message: msg }) => {
      if (chatId === chat._id) {
        setMessages(prev => [...prev, msg]);
      }
    });
  };
  const closeChat = () => {
    setChatDialogOpen(false);
    setSelectedChat(null);
    setMessages([]);
    if (socketRef.current) socketRef.current.disconnect();
  };
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    setSending(true);
    await fetch('https://lashwa.com/admin/support/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ chatId: selectedChat._id, text: message, adminId: admin?.adminId }),
    });
    setMessage('');
    setSending(false);
  };
  const formatTime = time => {
    const options = { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' };
    return new Date(time).toLocaleString('en-US', options);
  };
  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  return (
    <Box>
      <Typography variant="h4" mb={2}>Support Chats</Typography>
      <List sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        {chats.length === 0 && <ListItem><ListItemText primary="No support chats yet." /></ListItem>}
        {chats.map(chat => {
          const lastMsg = chat.messages?.[chat.messages.length - 1];
          return (
            <ListItemButton key={chat._id} onClick={() => openChat(chat)}>
              <ListItemText
                primary={chat.userId?.email || 'Unknown user'}
                secondary={
                  <>
                    <span>Status: <b>{chat.status}</b></span>
                    {lastMsg && (
                      <>
                        {' — '}
                        <span>{lastMsg.sender}: {lastMsg.text.slice(0, 40)}</span>
                        {' — '}
                        <span>{formatTime(lastMsg.timestamp)}</span>
                      </>
                    )}
                  </>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
      <Dialog open={chatDialogOpen} onClose={closeChat} maxWidth="sm" fullWidth>
        <DialogTitle>Support Chat with {selectedChat?.userId?.email}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ minHeight: 300, maxHeight: 400, overflowY: 'auto' }} ref={scrollRef}>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor: msg.sender === 'admin' ? 'primary.main' : 'grey.700',
                    color: '#fff',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: 320,
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                  <Typography variant="caption" sx={{ color: '#e0e0e0' }}>{formatTime(msg.timestamp)}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <TextField
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
            fullWidth
            size="small"
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          />
          <Button onClick={sendMessage} variant="contained" disabled={sending || !message.trim()}>Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportChats; 