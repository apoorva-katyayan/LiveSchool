# MongoDB Atlas Connection Troubleshooting

## Current Error
```
MongoServerError: bad auth : authentication failed
```

## Steps to Fix

### 1. Verify Credentials in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Database Access** (left sidebar)
3. Find your database user (username: `My-self`)
4. Click **Edit** on the user
5. Verify the password is correct
6. If needed, reset the password:
   - Click **Edit Password**
   - Enter a new password
   - Click **Update User**

### 2. Get the Correct Connection String

1. In MongoDB Atlas, go to **Database** → **Connect**
2. Choose **Connect your application**
3. Select **Node.js** as driver
4. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/
   ```

5. Replace `<username>` and `<password>` with your actual credentials

### 3. Update .env File

Edit `backend/.env` and update `MONGODB_URI`:

```bash
# Format:
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@livecourses.3eepasl.mongodb.net/live-school?retryWrites=true&w=majority

# Example (with your credentials):
MONGODB_URI=mongodb+srv://My-self:YOUR_ACTUAL_PASSWORD@livecourses.3eepasl.mongodb.net/live-school?retryWrites=true&w=majority
```

**Important:** If your password contains special characters (`@`, `:`, `/`, `?`, `#`, `[`, `]`), you need to URL-encode them:

```javascript
// In Node.js console:
encodeURIComponent('your-password-with-special-chars')
```

### 4. Whitelist Your IP Address

1. In MongoDB Atlas, go to **Network Access**
2. Click **Add IP Address**
3. Either:
   - Add your current IP address, OR
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) for development

### 5. Verify Database User Permissions

1. Go to **Database Access**
2. Ensure your user has:
   - **Atlas Admin** role, OR
   - **Read and write to any database** role

### 6. Test Connection

After updating `.env`, test the connection:

```bash
cd backend
node test-connection.js
```

## Common Issues

### Password Contains Special Characters
If your password has `@`, `:`, `/`, etc., URL-encode them:
```bash
# Example: Password is "p@ss:w0rd"
# URL-encoded: p%40ss%3Aw0rd
```

### Wrong Username
Double-check the username in Atlas matches exactly (case-sensitive).

### Database User Not Created
If you don't see the user in Database Access, create one:
1. Click **Add New Database User**
2. Choose **Password** authentication
3. Set username and password
4. Assign **Atlas Admin** role (or Read/Write)
5. Click **Add User**

### Cluster is Paused
Free tier clusters pause after inactivity:
1. Go to **Database** in Atlas
2. If cluster shows "Paused", click **Resume**
3. Wait 1-2 minutes for it to restart
