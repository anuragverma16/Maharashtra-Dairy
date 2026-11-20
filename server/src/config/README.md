# ⚙️ Database Configuration - Single File Management

## 📄 `db.js` - Master Configuration File

Everything is consolidated into a **single `db.js` file** that manages:
- ✅ Environment variables
- ✅ Database constants & enums
- ✅ Mongoose configuration
- ✅ Database connection
- ✅ Database utilities
- ✅ Input validation
- ✅ Logging

---

## 🚀 Quick Start

### **Import Everything You Need**
```javascript
import {
  // Environment
  env,
  
  // Constants
  ADMIN_ROLES,
  PRODUCT_CATEGORIES,
  SITE_SECTIONS,
  ERROR_MESSAGES,
  
  // Database
  connectDB,
  setupConnectionEvents,
  isDBConnected,
  getDBInfo,
  pingDB,
  getDBStats,
  
  // Validation
  validateEmail,
  validateProduct,
  validateContactForm,
  
  // Logger
  logger
} from "./config/db.js";
```

---

## 📚 All Available Exports

### **Environment Variables**
```javascript
import { env } from "./config/db.js";

env.PORT              // 5002
env.MONGO_URI         // mongodb+srv://...
env.JWT_SECRET        // secret-key
env.JWT_EXPIRY        // 24h
env.CLIENT_URL        // http://localhost:5173
env.NODE_ENV          // development|production
env.LOG_LEVEL         // error|warn|info|debug
env.ADMIN_EMAIL       // admin@maharashtradairy.com
env.ADMIN_PASSWORD    // Admin@123456
env.ADMIN_NAME        // Administrator
```

### **Constants**
```javascript
import { 
  ADMIN_ROLES, 
  PRODUCT_CATEGORIES, 
  SITE_SECTIONS,
  ERROR_MESSAGES 
} from "./config/db.js";

// Admin Roles
ADMIN_ROLES.ADMIN          // "admin"
ADMIN_ROLES.SUPERADMIN     // "superadmin"

// Product Categories
PRODUCT_CATEGORIES.MILK      // "milk"
PRODUCT_CATEGORIES.BYPRODUCT // "byproduct"

// Site Sections
SITE_SECTIONS.HOME     // "home"
SITE_SECTIONS.ABOUT    // "about"
SITE_SECTIONS.QUALITY  // "quality"
SITE_SECTIONS.CONTACT  // "contact"

// Error Messages
ERROR_MESSAGES.UNAUTHORIZED       // "Unauthorized access"
ERROR_MESSAGES.INVALID_CREDENTIALS // "Invalid email or password"
ERROR_MESSAGES.NOT_FOUND          // "Resource not found"
ERROR_MESSAGES.INVALID_INPUT      // "Invalid input provided"
ERROR_MESSAGES.SERVER_ERROR       // "Internal server error"
```

### **Database Connection**
```javascript
import { connectDB, setupConnectionEvents } from "./config/db.js";

// In server.js
setupConnectionEvents();  // Setup listeners
await connectDB();        // Connect to MongoDB
```

### **Database Utilities**
```javascript
import { 
  isDBConnected, 
  getDBInfo, 
  pingDB, 
  getDBStats,
  reconnectDB,
  getConnectionStatus
} from "./config/db.js";

// Check connection
if (isDBConnected()) {
  console.log("✅ Connected");
}

// Get database info
const info = getDBInfo();
console.log(info);  
// {
//   name: "maharashtra_dairy",
//   host: "localhost",
//   port: 27017,
//   state: "Connected",
//   isConnected: true,
//   readyState: 1
// }

// Ping database
const pong = await pingDB();  // true or false

// Get database statistics
const stats = await getDBStats();
console.log(stats);
// { uptime: 1234, connections: {...}, operations: {...} }

// Reconnect to database
const result = await reconnectDB();
// { success: true, message: "Reconnected to database" }

// Get connection status
const status = getConnectionStatus();  // "Connected"
```

### **Validation Functions**
```javascript
import { 
  validateEmail,
  validatePassword,
  validateObjectId,
  validateProductCategory,
  validateSiteSection,
  validateAdminRole,
  validateContactForm,
  validateProduct
} from "./config/db.js";

// Email validation
validateEmail("user@example.com");  // true

// Password validation
const pwd = validatePassword("Pass123");
// { valid: true, message: "Password is valid" }

// MongoDB ObjectId validation
validateObjectId("507f1f77bcf86cd799439011");  // true

// Category validation
validateProductCategory("milk");  // true

// Section validation
validateSiteSection("home");  // true

// Admin role validation
validateAdminRole("admin");  // true

// Contact form validation
const contact = { name: "John", email: "john@ex.com", message: "Hi" };
const result = validateContactForm(contact);
// { valid: true, errors: [] }

// Product validation
const product = { name: "Milk", category: "milk" };
const result = validateProduct(product);
// { valid: true, errors: [] }
```

### **Logger**
```javascript
import { logger } from "./config/db.js";

logger.info("Application started");
logger.debug("Debug info", { userId: 123 });
logger.warn("Warning message");
logger.error("Error occurred", new Error());
logger.success("Operation completed");
logger.request("GET", "/api/products", 200);
```

---

## 📋 Usage Examples

### **Example 1: Server Startup**
```javascript
// server.js
import { connectDB, env, setupConnectionEvents } from "./src/config/db.js";

setupConnectionEvents();
await connectDB();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
```

### **Example 2: Validate User Input**
```javascript
// In controller
import { validateEmail, validatePassword, logger } from "./config/db.js";

try {
  if (!validateEmail(email)) {
    throw new Error("Invalid email");
  }
  
  const pwd = validatePassword(password);
  if (!pwd.valid) {
    throw new Error(pwd.message);
  }
  
  logger.success("User validated");
} catch (err) {
  logger.error("Validation failed", err);
}
```

### **Example 3: Check Database Health**
```javascript
// In health check endpoint
import { isDBConnected, getDBInfo, pingDB } from "./config/db.js";

if (!isDBConnected()) {
  return res.status(503).json({ status: "Database offline" });
}

const info = getDBInfo();
const ping = await pingDB();

res.json({ status: "ok", database: info, ping });
```

### **Example 4: Use Constants**
```javascript
// In model validation
import { PRODUCT_CATEGORIES, ERROR_MESSAGES } from "./config/db.js";

if (!Object.values(PRODUCT_CATEGORIES).includes(category)) {
  throw new Error(ERROR_MESSAGES.INVALID_INPUT);
}
```

---

## 🔧 Configuration Best Practices

1. **Never hardcode values** - Use `env` from `db.js`
2. **Always validate input** - Use validation functions
3. **Log important events** - Use `logger` for debugging
4. **Check DB before queries** - Use `isDBConnected()`
5. **Use constants** - Avoid magic strings/numbers
6. **Handle errors properly** - Catch and log errors

---

## 📝 Environment Template

Create `.env` file in server root:

```env
NODE_ENV=development
PORT=5002
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/maharashtra_dairy?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-key-change-in-production
ADMIN_EMAIL=admin@maharashtradairy.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Administrator

LOG_LEVEL=info
```

---

## 📁 File Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js              ✅ Single master config file
│   ├── middleware/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── data/
│   ├── scripts/
│   └── app.js
├── server.js
├── package.json
└── .env
```

---

## ✨ Key Benefits

✅ **Single Source of Truth** - All config in one file  
✅ **Easy to Maintain** - No scattered configuration  
✅ **Clear Dependencies** - Import only what you need  
✅ **Type-Safe Constants** - Use predefined enums  
✅ **Built-in Validation** - Reusable validation functions  
✅ **Structured Logging** - Consistent log format  
✅ **Production Ready** - Enterprise-grade configuration  

---

## 🎉 Your Server Configuration is Complete!

All database, constants, validation, and logging is now managed from a single, clean `db.js` file!
