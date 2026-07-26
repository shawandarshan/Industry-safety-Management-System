import React, { useState, useEffect } from 'react';
import { Drawer, IconButton, Badge, Typography, List, ListItem, ListItemText, Divider, Box } from '@mui/material';
import { Bell, X, AlertTriangle } from 'lucide-react';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Predictive Alert', message: 'Worker 2 approaching Conveyor B (Danger Zone).', time: 'Just now', unread: true, severity: 'high' },
    { id: 2, type: 'Violation', message: 'Missing Helmet detected at Assembly Line A.', time: '5m ago', unread: true, severity: 'medium' }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // In a real app, this would listen to WebSocket events
  // useEffect(() => {
  //   const ws = new WebSocket('ws://localhost:8000/ws');
  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     if (data.event === 'NEW_ALERT') {
  //       setNotifications(prev => [data.data, ...prev]);
  //     }
  //   };
  //   return () => ws.close();
  // }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Mark all as read when closing
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <Bell />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 350, p: 2, bgcolor: 'background.paper', height: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Notifications</Typography>
            <IconButton onClick={handleClose}>
              <X />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {notifications.map((notif) => (
              <ListItem key={notif.id} sx={{ 
                  mb: 1, 
                  bgcolor: notif.unread ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderRadius: 1,
                  borderLeft: `4px solid ${notif.severity === 'high' ? '#ef4444' : '#f59e0b'}`
                }}>
                <ListItemText 
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {notif.severity === 'high' && <AlertTriangle size={16} color="#ef4444" />}
                      <Typography variant="subtitle2">{notif.type}</Typography>
                    </Box>
                  } 
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                      <Typography variant="caption" color="text.secondary">{notif.time}</Typography>
                    </>
                  } 
                />
              </ListItem>
            ))}
            {notifications.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" mt={4}>
                No new notifications
              </Typography>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
