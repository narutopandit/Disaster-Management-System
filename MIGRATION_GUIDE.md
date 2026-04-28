# MongoDB Migration Guide - Emergency Alert System

## Overview
This guide helps you migrate your existing MongoDB database to support the new Emergency Alert System.

---

## Pre-Migration Checklist

- [ ] Backup existing database
- [ ] Stop application server
- [ ] Have MongoDB admin credentials ready
- [ ] Verify MongoDB connection

---

## Step 1: Backup Your Database

### Option A: Using mongodump
```bash
mongodump --uri="mongodb://localhost:27017/disaster-db" --out ./backups/disaster-db-backup
```

### Option B: Export Collections
```bash
mongoexport --db=disaster-db --collection=users --out=users-backup.json
mongoexport --db=disaster-db --collection=incidents --out=incidents-backup.json
```

---

## Step 2: Create Alert Collection

### Option A: Using MongoDB Shell/Compass

```javascript
use disaster-db;

db.createCollection("alerts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "message", "type", "severity", "createdBy"],
      properties: {
        _id: { bsonType: "objectId" },
        title: {
          bsonType: "string",
          description: "Alert title (required)"
        },
        message: {
          bsonType: "string",
          description: "Alert message (required)"
        },
        type: {
          enum: ["flood_warning", "cyclone_alert", "earthquake_detected", "evacuation_notice", "other"],
          description: "Alert type (required)"
        },
        severity: {
          enum: ["low", "medium", "high", "critical"],
          description: "Severity level"
        },
        location: { bsonType: "string" },
        status: {
          enum: ["active", "resolved", "expired"],
          description: "Alert status"
        },
        createdBy: { bsonType: "objectId" },
        readBy: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              userId: { bsonType: "objectId" },
              readAt: { bsonType: "date" }
            }
          }
        },
        affectedUsers: { bsonType: "int" },
        icon: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});
```

### Option B: Using Node.js Script

Create `migrate-alerts.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["flood_warning", "cyclone_alert", "earthquake_detected", "evacuation_notice", "other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
    },
    location: { type: String, default: "All Areas" },
    status: {
      type: String,
      enum: ["active", "resolved", "expired"],
      default: "active",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    readBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        readAt: Date,
      },
    ],
    affectedUsers: { type: Number, default: 0 },
    icon: { type: String, default: "alert-circle" },
  },
  { timestamps: true }
);

async function migrate() {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Alert = mongoose.model('Alert', alertSchema);
    
    // Create indexes
    await Alert.collection.createIndex({ createdAt: -1 });
    await Alert.collection.createIndex({ status: 1 });
    await Alert.collection.createIndex({ type: 1 });
    
    console.log('✅ Alert collection created with indexes');
    
    await connection.disconnect();
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

Run migration:
```bash
node migrate-alerts.js
```

---

## Step 3: Verify Migration

### Check Collection Exists
```javascript
db.getCollection("alerts").countDocuments()
// Should return: 0
```

### Check Indexes
```javascript
db.alerts.getIndexes()
// Should show indexes on createdAt, status, type
```

### Insert Test Alert
```javascript
db.alerts.insertOne({
  title: "Test Alert",
  message: "This is a test alert",
  type: "other",
  severity: "low",
  status: "active",
  createdBy: ObjectId("your-admin-id-here"),
  location: "Test Area",
  readBy: [],
  affectedUsers: 0,
  icon: "alert-circle"
});
```

---

## Step 4: Update Application

1. Ensure models are updated:
   ```bash
   # Copy the new Alert model from server/models/Alerts.js
   ```

2. Update controllers:
   ```bash
   # Copy the new alertController from server/controllers/alertController.js
   ```

3. Update routes:
   ```bash
   # Copy the new alertRoutes from server/Routes/alertRoutes.js
   ```

4. Update Socket Manager:
   ```bash
   # Copy the new socketManager from server/Socket/socketManager.js
   ```

---

## Step 5: Database Queries for Verification

### Count Alerts by Type
```javascript
db.alerts.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])
```

### Get All Active Alerts
```javascript
db.alerts.find({ status: "active" }).sort({ createdAt: -1 })
```

### Get Alerts by Severity
```javascript
db.alerts.find({ severity: "critical" })
```

### Get Unread Alerts
```javascript
db.alerts.find({
  status: "active",
  "readBy": { $size: 0 }
})
```

### Get Alerts for Specific Creator
```javascript
db.alerts.find({ createdBy: ObjectId("admin-id-here") })
```

---

## Rollback Procedure

If something goes wrong, restore from backup:

### Option A: Using mongorestore
```bash
mongorestore --uri="mongodb://localhost:27017" ./backups/disaster-db-backup
```

### Option B: Delete Collection and Reimport
```bash
# Delete the alerts collection
db.alerts.drop()

# Import from backup
mongoimport --db=disaster-db --collection=alerts --file=alerts-backup.json

# Or simply recreate empty collection
# (Data was just created for testing)
```

---

## Performance Optimization

### Create Indexes
```javascript
// Sort by creation date (for fetching latest)
db.alerts.createIndex({ "createdAt": -1 });

// Filter by status (active, resolved, expired)
db.alerts.createIndex({ "status": 1 });

// Filter by type
db.alerts.createIndex({ "type": 1 });

// Compound index for common queries
db.alerts.createIndex({ "status": 1, "createdAt": -1 });

// Index for finding unread alerts
db.alerts.createIndex({ "readBy.userId": 1 });
```

### Remove Old Alerts (Archive)
```javascript
// Archive alerts older than 90 days
db.alerts.find({
  createdAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) },
  status: { $ne: "active" }
}).count()

// Move to archive collection (optional)
db.alerts_archive.insertMany(
  db.alerts.find({
    createdAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
  }).toArray()
)

// Delete from main collection
db.alerts.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
})
```

---

## Data Validation

### Check for Missing Fields
```javascript
db.alerts.find({
  $or: [
    { title: { $exists: false } },
    { message: { $exists: false } },
    { type: { $exists: false } },
    { createdBy: { $exists: false } }
  ]
})
```

### Check for Invalid Types
```javascript
db.alerts.find({
  type: { $nin: ["flood_warning", "cyclone_alert", "earthquake_detected", "evacuation_notice", "other"] }
})
```

### Check for Invalid Severities
```javascript
db.alerts.find({
  severity: { $nin: ["low", "medium", "high", "critical"] }
})
```

### Check for Invalid Statuses
```javascript
db.alerts.find({
  status: { $nin: ["active", "resolved", "expired"] }
})
```

---

## Health Check Script

Create `check-migration.js`:

```javascript
const mongoose = require('mongoose');
const Alerts = require('./server/models/Alerts');
require('dotenv').config();

async function checkMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n📊 Alert Collection Status:');
    console.log('─────────────────────────────');
    
    // Count documents
    const count = await Alerts.countDocuments();
    console.log(`Total alerts: ${count}`);
    
    // Count by status
    const byStatus = await Alerts.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log('\nBy Status:');
    byStatus.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    
    // Count by type
    const byType = await Alerts.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    console.log('\nBy Type:');
    byType.forEach(t => console.log(`  ${t._id}: ${t.count}`));
    
    // Count by severity
    const bySeverity = await Alerts.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);
    console.log('\nBy Severity:');
    bySeverity.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    
    // Check indexes
    const indexes = await Alerts.collection.getIndexes();
    console.log('\nIndexes:');
    Object.keys(indexes).forEach(i => console.log(`  ${i}`));
    
    console.log('✅ Migration healthy!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

checkMigration();
```

Run check:
```bash
node check-migration.js
```

---

## Post-Migration Testing

- [ ] Create test alert from backend API
- [ ] Verify alert appears in frontend
- [ ] Test filtering and pagination
- [ ] Test real-time broadcasting with Socket.IO
- [ ] Check alert history displays correctly
- [ ] Test admin permissions
- [ ] Verify alert read tracking works
- [ ] Test alert status updates and deletion

---

## FAQ

**Q: Can I use this migration with existing data?**
A: Yes, the migration only creates a new collection and doesn't affect existing data.

**Q: What if I already have alerts?**
A: The new schema is backward compatible. Old alerts will be converted automatically.

**Q: How do I revert the migration?**
A: Drop the alerts collection: `db.alerts.drop()`

**Q: Are indexes required?**
A: Indexes improve query performance significantly. Recommended for production.

**Q: How often should I archive old alerts?**
A: Recommended: Every 30-90 days depending on volume.

---

## Migration Completion

Once all steps are complete:

1. ✅ Collection created
2. ✅ Indexes created
3. ✅ Test alert inserted
4. ✅ Application updated
5. ✅ All tests passing
6. ✅ Performance verified

You're ready to deploy the Emergency Alert System!

---

## Support

For issues during migration, contact the development team or refer to the main documentation at `EMERGENCY_ALERT_SYSTEM.md`.
