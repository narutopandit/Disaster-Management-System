#!/usr/bin/env node
/**
 * 🚨 EMERGENCY ALERT SYSTEM - QUICK START GUIDE
 * 
 * This guide will help you get the Emergency Alert System up and running
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║       🚨 EMERGENCY ALERT SYSTEM - QUICK START                ║
║     Disaster Management Platform - Real-Time Alerts          ║
╚══════════════════════════════════════════════════════════════╝
`);

console.log(`
📋 IMPLEMENTATION CHECKLIST
═══════════════════════════════════════════════════════════════

✅ Backend Components
   ✓ Alert Model (Alerts.js)
   ✓ Alert Controller (alertController.js)
   ✓ Socket Manager (socketManager.js)
   ✓ Alert Routes (alertRoutes.js)
   ✓ Server Integration (server.js)

✅ Frontend Components
   ✓ AlertNotification.jsx
   ✓ AdminAlertPanel.jsx
   ✓ AlertHistory.jsx
   ✓ Dashboard Integration
   ✓ AdminPanel Integration
   ✓ NotificationContext
   ✓ Socket Configuration

✅ UI/UX
   ✓ Beautiful CSS Styling
   ✓ Responsive Design
   ✓ Animations & Transitions
   ✓ Real-time Updates
`);

console.log(`
🚀 DEPLOYMENT STEPS
═══════════════════════════════════════════════════════════════

1. Install Dependencies (if not already done)
   ---
   Backend:
   $ cd server
   $ npm install socket.io

   Frontend:
   $ cd frontend
   $ npm install

2. Environment Configuration
   ---
   Create .env file in server directory:
   
   PORT=5000
   MONGODB_URI=mongodb://localhost/disaster-db
   NODE_ENV=development

   Set REACT_APP_SOCKET_URL in frontend:
   
   REACT_APP_SOCKET_URL=http://localhost:5000

3. Start the Application
   ---
   Terminal 1 - Backend:
   $ cd server
   $ npm start

   Terminal 2 - Frontend:
   $ cd frontend
   $ npm run dev

4. Access the Application
   ---
   Frontend: http://localhost:5173 (or your Vite port)
   Backend API: http://localhost:5000

5. Test Real-Time Alerts
   ---
   a) Open browser and go to http://localhost:5173
   b) Login as Admin
   c) Go to Admin Panel → Emergency Alerts tab
   d) Create a test alert:
      - Title: "Test Flood Warning"
      - Message: "This is a test alert"
      - Type: Flood Warning
      - Severity: High
      - Location: Test Area
   e) Click "Broadcast Alert to All Users"
   f) Open another browser window
   g) You should see the alert notification appear instantly
`);

console.log(`
🎯 ALERT TYPES & EXAMPLES
═══════════════════════════════════════════════════════════════

1. 🌊 FLOOD WARNING
   Title: "Severe Flood Warning"
   Message: "Heavy rainfall expected in downtown area..."
   Severity: High
   Location: Downtown District

2. 🌪️ CYCLONE ALERT
   Title: "Cyclone Alert - Category 4"
   Message: "A powerful cyclone is approaching the coast..."
   Severity: Critical
   Location: Coastal Region

3. ⚡ EARTHQUAKE DETECTED
   Title: "Earthquake Detected - Magnitude 6.5"
   Message: "A significant earthquake has been recorded..."
   Severity: High
   Location: North Region

4. 🏃 EVACUATION NOTICE
   Title: "Mandatory Evacuation Order"
   Message: "All residents must evacuate immediately..."
   Severity: Critical
   Location: Downtown District

5. ⚠️ OTHER ALERTS
   Title: "Landslide Risk"
   Message: "Increased landslide risk due to heavy rain..."
   Severity: Medium
   Location: Mountain Areas
`);

console.log(`
🔌 API ENDPOINTS
═══════════════════════════════════════════════════════════════

Create Alert (Admin Only)
  POST /api/alerts
  Authorization: Bearer {token}
  Content-Type: application/json
  {
    "title": "Alert Title",
    "message": "Alert message",
    "type": "flood_warning",
    "severity": "high",
    "location": "Area Name"
  }

Get All Alerts
  GET /api/alerts?status=active&page=1&limit=10
  Authorization: Bearer {token}

Get Single Alert
  GET /api/alerts/{alertId}
  Authorization: Bearer {token}

Mark Alert as Read
  POST /api/alerts/{alertId}/read
  Authorization: Bearer {token}

Update Alert Status
  PATCH /api/alerts/{alertId}/status
  Authorization: Bearer {token}
  Content-Type: application/json
  { "status": "resolved" }

Delete Alert (Admin Only)
  DELETE /api/alerts/{alertId}
  Authorization: Bearer {token}

Get Statistics
  GET /api/alerts/stats
  Authorization: Bearer {token}
`);

console.log(`
🎨 UI FEATURES
═══════════════════════════════════════════════════════════════

AlertNotification Component:
  • Toast notification at top-right
  • Auto-dismisses after 8 seconds
  • Shows icon, severity, title, message
  • Animated entry/exit
  • Pulse effect for critical alerts
  • Fully responsive

AdminAlertPanel Component:
  • Beautiful form for creating alerts
  • Alert type selection with icons
  • Severity color picker
  • Location/affected area input
  • Real-time alert preview
  • Form validation with character count

AlertHistory Component:
  • List all alerts with real-time updates
  • Filter by status (active/resolved/expired)
  • Filter by alert type
  • Pagination (10 items per page)
  • Display creator and read count
  • Live socket updates
`);

console.log(`
🔐 SECURITY FEATURES
═══════════════════════════════════════════════════════════════

✅ Authentication
   • JWT token required for all endpoints
   • Token verified before processing

✅ Authorization
   • Only admins can create alerts
   • Only admins can update/delete alerts
   • Regular users can only read

✅ Input Validation
   • Alert type must be from valid enum
   • Severity level validated
   • Required fields enforced
   • Character limits applied

✅ Rate Limiting (Recommended)
   • Implement at /api/alerts POST endpoint
   • Prevent spam broadcasting
   • 20 alerts per 5 minutes per admin
`);

console.log(`
📊 DATABASE SCHEMA
═══════════════════════════════════════════════════════════════

alerts collection:
{
  _id: ObjectId,
  title: String (required),
  message: String (required),
  type: String (enum), // flood_warning, cyclone_alert, etc.
  severity: String (enum), // low, medium, high, critical
  location: String,
  status: String (enum), // active, resolved, expired
  createdBy: ObjectId (ref: Users),
  readBy: [
    { userId: ObjectId, readAt: Date }
  ],
  affectedUsers: Number,
  icon: String,
  createdAt: Date,
  updatedAt: Date
}

Recommended Indexes:
- db.alerts.createIndex({ "createdAt": -1 })
- db.alerts.createIndex({ "status": 1 })
- db.alerts.createIndex({ "type": 1 })
`);

console.log(`
🧪 TESTING SCENARIOS
═══════════════════════════════════════════════════════════════

1. Test Real-Time Broadcasting
   □ Open 2 browser windows
   □ Create alert from admin window
   □ Verify notification appears in other window instantly
   □ Check database for alert record

2. Test Alert Filtering
   □ Create 5 alerts of different types
   □ Use status filter to show only active
   □ Use type filter to show only floods
   □ Verify pagination works

3. Test Alert Read Tracking
   □ Receive an alert
   □ Verify readBy array is updated
   □ Check read count in history

4. Test Alert Deletion
   □ Create an alert
   □ Delete it from admin panel
   □ Verify it disappears for all users
   □ Check database is clean

5. Test Responsive Design
   □ View on desktop (1200px+)
   □ View on tablet (768px)
   □ View on mobile (375px)
   □ Verify all elements adjust properly
`);

console.log(`
⚙️ CONFIGURATION OPTIONS
═══════════════════════════════════════════════════════════════

Server (server.js):
  - PORT: 5000 (default)
  - CORS: Configure for your domain
  - Socket.IO: Configure reconnection settings

Client (socket.js):
  - SOCKET_URL: http://localhost:5000 (default)
  - Reconnection attempts: 5
  - Reconnection delay: 1000-5000ms

AdminAlertPanel (components):
  - Auto-dismiss time: 8 seconds
  - Notification position: top-right
  - Alert preview enabled: true

AlertHistory (components):
  - Items per page: 10
  - Default sort: newest first
  - Max notifications in memory: 50
`);

console.log(`
🚨 TROUBLESHOOTING
═══════════════════════════════════════════════════════════════

Issue: Alerts not received in real-time
  → Check Socket.IO connection in browser DevTools
  → Verify server is running on correct port
  → Check CORS configuration
  → Review console for connection errors

Issue: Alerts not persisting to database
  → Verify MongoDB connection
  → Check alert model schema
  → Verify write permissions to database
  → Check for validation errors in console

Issue: UI components not displaying
  → Verify CSS files are properly imported
  → Check for JavaScript errors in console
  → Verify component dependencies are installed
  → Clear browser cache and reload

Issue: Permission denied when creating alerts
  → Verify user has admin role
  → Check JWT token is valid and not expired
  → Verify authRole middleware is configured
  → Check user role in database
`);

console.log(`
📚 DOCUMENTATION & REFERENCES
═══════════════════════════════════════════════════════════════

Main Documentation:
  • EMERGENCY_ALERT_SYSTEM.md

API Documentation:
  • Find in EMERGENCY_ALERT_SYSTEM.md #API section

Socket.IO Events:
  • Find in EMERGENCY_ALERT_SYSTEM.md #Socket Events

Component Props:
  • AlertNotification: alert, onClose, onRead
  • AdminAlertPanel: onAlertCreated
  • AlertHistory: (internal state management)

Authentication:
  • Bearer token in Authorization header
  • Token format: "Bearer {jwt_token}"
`);

console.log(`
✨ NEXT STEPS
═══════════════════════════════════════════════════════════════

1. Deploy to production
2. Set up email/SMS notifications for critical alerts
3. Add alert scheduling feature
4. Implement push notifications for mobile
5. Create alert templates for quick broadcasting
6. Add analytics dashboard for alert effectiveness
7. Set up automated alert history archival
8. Integrate with external warning systems

═══════════════════════════════════════════════════════════════
             🎉 System Ready for Deployment! 🎉
═══════════════════════════════════════════════════════════════
`);
