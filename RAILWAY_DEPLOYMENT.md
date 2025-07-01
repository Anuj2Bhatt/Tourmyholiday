# 🚀 Railway Deployment Guide for TourMyHoliday

## 📋 Prerequisites
- GitHub account with your project
- Railway account (free at [railway.app](https://railway.app))

## 🚀 Quick Deployment Steps

### **1. Connect to Railway**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `tourmyholiday` repository

### **2. Configure Environment Variables**
In Railway dashboard, add these environment variables:

```env
# Database Configuration
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=tourmyholiday
DB_PORT=3306

# Node Environment
NODE_ENV=production
PORT=5000

# JWT Secret (if using authentication)
JWT_SECRET=your-secret-key
```

### **3. Add MySQL Database**
1. In Railway dashboard, click "New"
2. Select "Database" → "MySQL"
3. Railway will automatically provide connection details
4. Copy the connection details to your environment variables

### **4. Deploy Backend**
1. Railway will automatically detect your Node.js app
2. Set the **Root Directory** to `backend`
3. Set the **Start Command** to `npm start`
4. Railway will auto-deploy on every push to main branch

### **5. Run Migrations**
After deployment, run migrations:
```bash
# Connect to Railway shell
railway shell

# Run migrations
npm run migrate
```

## 🔧 Configuration Files

### **railway.json** (already created)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🌐 Frontend Deployment

### **Option 1: Deploy Frontend to Railway**
1. Create another service in Railway
2. Set Root Directory to `frontend`
3. Set Start Command to `npm start`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app`

### **Option 2: Deploy to Vercel/Netlify**
1. Connect your GitHub repo to Vercel/Netlify
2. Set build directory to `frontend`
3. Set build command to `npm run build`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app`

## 📊 Monitoring & Logs

### **View Logs**
```bash
railway logs
```

### **Check Status**
```bash
railway status
```

### **Health Check**
Visit: `https://your-app.railway.app/api/health`

## 💰 Cost Estimation

### **Monthly Costs (Estimated)**
- **Backend Service:** $5-10/month
- **MySQL Database:** $5-15/month
- **Total:** $10-25/month

### **Free Tier Limits**
- $5 credit/month (enough for small projects)
- 500 hours of runtime
- 1GB storage

## 🔄 Auto-Deployment

Railway automatically deploys when you:
- Push to main branch
- Create a pull request
- Manually trigger deployment

## 🛠️ Troubleshooting

### **Common Issues:**

1. **Database Connection Failed**
   - Check environment variables
   - Ensure MySQL service is running
   - Verify database credentials

2. **Build Failed**
   - Check `package.json` scripts
   - Verify Node.js version
   - Check for missing dependencies

3. **Health Check Failing**
   - Verify `/api/health` endpoint exists
   - Check server logs
   - Ensure port configuration

### **Useful Commands:**
```bash
# Connect to Railway shell
railway shell

# View logs
railway logs

# Check status
railway status

# Restart service
railway restart

# Open in browser
railway open
```

## 🎯 Benefits of Railway

✅ **Cost-Effective:** Pay-as-you-use pricing  
✅ **Easy Setup:** One-click deployment  
✅ **Auto-Scaling:** Handles traffic spikes  
✅ **Database Integration:** MySQL included  
✅ **GitHub Integration:** Auto-deploy on push  
✅ **Custom Domains:** Free SSL certificates  
✅ **Global CDN:** Fast worldwide access  

## 🚀 Next Steps

1. Deploy backend to Railway
2. Set up MySQL database
3. Run migrations
4. Deploy frontend
5. Configure custom domain (optional)
6. Set up monitoring

**Your TourMyHoliday app will be live at: `https://your-app.railway.app`** 