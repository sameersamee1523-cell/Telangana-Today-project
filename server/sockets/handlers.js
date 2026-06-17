/**
 * Socket.io Event Handlers
 * Real-time communication for the Pipeline Server
 * Telangana Today Newspaper
 */

/**
 * initSocket - Initialises all Socket.io event handlers.
 * Called once in server.js after io is created.
 *
 * Room strategy:
 *   - Each authenticated user joins a personal room: "user_<userId>"
 *   - This allows targeted notifications via io.to('user_<id>').emit(...)
 *   - Editors/admin can also join a shared "dashboard" room for live refreshes
 *
 * @param {import('socket.io').Server} io - The Socket.io server instance
 */
const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // ----------------------------------------------------------
    // Event: join
    // Client sends their userId to join their personal room
    // ----------------------------------------------------------
    socket.on('join', (userId) => {
      if (!userId) return;

      const userRoom = `user_${userId}`;
      socket.join(userRoom);
      console.log(`[Socket] User ${userId} joined room: ${userRoom}`);

      // Acknowledge join
      socket.emit('joined', {
        room: userRoom,
        message: `Connected to pipeline server. Room: ${userRoom}`
      });
    });

    // ----------------------------------------------------------
    // Event: join:dashboard
    // Editors, chief_editors, admins join the shared dashboard room
    // to receive real-time analytics/dashboard refresh signals
    // ----------------------------------------------------------
    socket.on('join:dashboard', (role) => {
      const allowedRoles = ['admin', 'chief_editor', 'editor'];
      if (allowedRoles.includes(role)) {
        socket.join('dashboard');
        console.log(`[Socket] ${role} joined dashboard room`);
      }
    });

    // ----------------------------------------------------------
    // Event: story:update
    // Broadcast story status changes to all connected dashboard users
    // Payload: { storyId, title, oldStatus, newStatus, updatedBy }
    // ----------------------------------------------------------
    socket.on('story:update', (data) => {
      // Broadcast to the dashboard room (editors/admins)
      socket.to('dashboard').emit('story:update', {
        ...data,
        timestamp: new Date().toISOString()
      });

      // Also notify the assigned reporter if reporter_id is provided
      if (data.reporterId) {
        socket.to(`user_${data.reporterId}`).emit('story:update', {
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    });

    // ----------------------------------------------------------
    // Event: notification:new
    // Sent by server to a user's personal room
    // (This event is emitted from sendNotification helper, not from clients)
    // ----------------------------------------------------------
    // Client-side listener example:
    //   socket.on('notification:new', (notification) => { ... })

    // ----------------------------------------------------------
    // Event: dashboard:refresh
    // Trigger a full dashboard data refresh for all dashboard users
    // Payload: { reason } e.g., 'story_published', 'user_added'
    // ----------------------------------------------------------
    socket.on('dashboard:refresh', (data) => {
      io.to('dashboard').emit('dashboard:refresh', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // ----------------------------------------------------------
    // Event: typing
    // Indicate a user is typing a comment on a story
    // Payload: { storyId, userId, userName }
    // ----------------------------------------------------------
    socket.on('typing', (data) => {
      if (data.storyId) {
        socket.to(`story_${data.storyId}`).emit('typing', data);
      }
    });

    // ----------------------------------------------------------
    // Event: join:story
    // Join a story-specific room for collaborative viewing
    // ----------------------------------------------------------
    socket.on('join:story', (storyId) => {
      if (storyId) {
        socket.join(`story_${storyId}`);
        console.log(`[Socket] Socket ${socket.id} joined story room: story_${storyId}`);
      }
    });

    // ----------------------------------------------------------
    // Event: leave:story
    // Leave a story-specific room
    // ----------------------------------------------------------
    socket.on('leave:story', (storyId) => {
      if (storyId) {
        socket.leave(`story_${storyId}`);
      }
    });

    // ----------------------------------------------------------
    // Event: disconnect
    // ----------------------------------------------------------
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} | Reason: ${reason}`);
    });

    // ----------------------------------------------------------
    // Event: error
    // ----------------------------------------------------------
    socket.on('error', (err) => {
      console.error(`[Socket Error] ${socket.id}:`, err.message);
    });
  });

  console.log('[Socket.io] Event handlers initialized');
};

module.exports = { initSocket };
