# Deployment Guide

This guide covers deploying the AgentX backend to various platforms.

## Table of Contents

- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Deployment Platforms](#deployment-platforms)
  - [Heroku](#heroku)
  - [Railway](#railway)
  - [Render](#render)
  - [AWS EC2](#aws-ec2)
  - [DigitalOcean](#digitalocean)
- [Post-deployment](#post-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Pre-deployment Checklist

Before deploying to production:

- [ ] Update all dependencies to latest stable versions
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong, unique JWT secrets
- [ ] Configure production MongoDB instance
- [ ] Review and update CORS settings
- [ ] Enable HTTPS/SSL
- [ ] Set up environment variables on hosting platform
- [ ] Test all endpoints in production-like environment
- [ ] Review security settings
- [ ] Set up error logging and monitoring
- [ ] Configure backup strategy for database
- [ ] Document deployment process

## Environment Configuration

### Required Environment Variables

Create these on your hosting platform:

```env
# Server
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas recommended)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agentx?retryWrites=true&w=majority

# JWT Secrets (Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_production_jwt_secret_here
JWT_REFRESH_SECRET=your_production_refresh_secret_here

# CORS (Your frontend URL)
FRONTEND_URL=https://your-frontend-domain.com
```

### Generating Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### MongoDB Atlas (Recommended)

MongoDB Atlas provides free tier and is the easiest option for production.

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select region closest to your app server
   - Click "Create Cluster"

3. **Configure Security**
   - **Database Access**: Create database user with password
   - **Network Access**: Add IP addresses (or `0.0.0.0/0` for any IP)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Add to your environment variables as `MONGO_URI`

### Self-hosted MongoDB

If hosting MongoDB yourself:

1. Install MongoDB on your server
2. Configure authentication
3. Set up firewall rules
4. Enable SSL/TLS
5. Configure backups
6. Use connection string: `mongodb://username:password@host:port/agentx`

## Deployment Platforms

### Heroku

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set JWT_REFRESH_SECRET="your_refresh_secret"
   heroku config:set FRONTEND_URL="https://your-frontend.com"
   ```

4. **Add Procfile** (in backend directory)
   ```
   web: npm start
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

7. **View Logs**
   ```bash
   heroku logs --tail
   ```

---

### Railway

Railway offers simple deployment with generous free tier.

1. **Sign Up**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Railway auto-detects Node.js
   - Add environment variables in Settings
   - Set root directory to `backend` if needed

4. **Environment Variables**
   - Go to project → Variables
   - Add all required environment variables

5. **Deploy**
   - Railway automatically deploys on push to main
   - View deployment logs in dashboard

6. **Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add custom domain or use Railway's provided domain

---

### Render

Render provides free tier with automatic deployments.

1. **Sign Up**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **New Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository

3. **Configure Service**
   ```
   Name: agentx-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment Variables**
   - Add all environment variables in "Environment" section
   - Use "Environment Groups" for reusable configs

5. **Deploy**
   - Click "Create Web Service"
   - Render auto-deploys on git push

6. **Free Tier Notes**
   - Free services spin down after inactivity
   - First request after inactivity may be slow (cold start)
   - Upgrade to paid tier for always-on service

---

### AWS EC2

For full control over your deployment.

#### Prerequisites
- AWS account
- Basic knowledge of Linux/SSH

#### Steps

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS or Amazon Linux 2
   - Instance type: t2.micro (free tier)
   - Configure security group:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (5000) - Anywhere (or use reverse proxy)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install MongoDB** (or use Atlas)
   ```bash
   # Follow MongoDB installation guide for Ubuntu
   # Or use MongoDB Atlas cloud database
   ```

5. **Clone Repository**
   ```bash
   git clone https://github.com/Vashishta-Mithra-Reddy/agentx.git
   cd agentx/backend
   ```

6. **Install Dependencies**
   ```bash
   npm install --production
   ```

7. **Create .env File**
   ```bash
   nano .env
   # Add environment variables
   ```

8. **Build Application**
   ```bash
   npm run build
   ```

9. **Install PM2** (Process Manager)
   ```bash
   sudo npm install -g pm2
   ```

10. **Start Application**
    ```bash
    pm2 start dist/index.js --name agentx-backend
    pm2 startup
    pm2 save
    ```

11. **Configure Nginx** (Reverse Proxy - Optional)
    ```bash
    sudo apt-get install nginx
    sudo nano /etc/nginx/sites-available/agentx
    ```
    
    Add configuration:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;
        
        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    
    Enable site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/agentx /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

12. **SSL with Let's Encrypt** (Optional but recommended)
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

### DigitalOcean

Similar to AWS EC2 but with simpler interface.

1. **Create Droplet**
   - Choose Ubuntu 20.04
   - Basic plan ($5/month)
   - Add SSH key

2. **Follow EC2 steps 2-12**
   - DigitalOcean droplets work similarly to EC2

3. **Alternative: App Platform**
   - Use DigitalOcean App Platform for easier deployment
   - Similar to Heroku
   - Automatic deployments from GitHub

## Post-deployment

### Verify Deployment

1. **Test Basic Endpoint**
   ```bash
   curl https://your-domain.com/
   ```

2. **Test Authentication**
   ```bash
   curl -X POST https://your-domain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","password":"test123","mobileNumber":"1234567890","countryCode":"+1"}'
   ```

3. **Check Logs**
   - Review application logs for errors
   - Verify database connectivity

### Security Hardening

1. **Enable HTTPS**
   - Use Let's Encrypt for free SSL
   - Configure automatic renewal

2. **Set Secure Cookie Flags**
   - Ensure cookies use `secure: true` in production
   - Verify `sameSite` is set

3. **Configure CORS Properly**
   - Restrict to specific frontend domains
   - Don't use wildcards in production

4. **Database Security**
   - Use strong passwords
   - Enable authentication
   - Restrict network access
   - Enable encryption at rest

5. **Rate Limiting** (Recommended)
   - Install express-rate-limit
   - Protect authentication endpoints
   - Prevent brute force attacks

### Performance Optimization

1. **Enable Compression**
   ```bash
   npm install compression
   ```
   
   In `index.ts`:
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Database Indexes**
   ```javascript
   db.users.createIndex({ email: 1 }, { unique: true });
   db.distributedtasks.createIndex({ agentId: 1 });
   ```

3. **Connection Pooling**
   - Mongoose handles this by default
   - Monitor connection pool usage

## Monitoring and Maintenance

### Logging

1. **Application Logs**
   - Use Winston or similar
   - Log to file and/or external service

2. **Error Tracking**
   - Use Sentry or similar
   - Track exceptions and errors

3. **Access Logs**
   - Use Morgan for HTTP request logging
   - Review regularly for issues

### Monitoring Services

- **Uptime**: UptimeRobot, Pingdom
- **Performance**: New Relic, DataDog
- **Errors**: Sentry, Rollbar
- **Logs**: Papertrail, Loggly

### Backup Strategy

1. **Database Backups**
   - MongoDB Atlas: Automatic backups enabled
   - Self-hosted: Configure daily backups
   - Test restore process regularly

2. **Code Backups**
   - Use Git (already done)
   - Tag releases
   - Document deployment states

### Updates and Maintenance

1. **Regular Updates**
   ```bash
   npm outdated
   npm update
   npm audit fix
   ```

2. **Security Patches**
   - Monitor security advisories
   - Apply patches promptly
   - Test before deploying

## Troubleshooting

### Common Issues

**1. Connection to MongoDB fails**
```
Error: connect ECONNREFUSED
```
Solution: Check MONGO_URI, network access rules, and database credentials

**2. Port already in use**
```
Error: listen EADDRINUSE
```
Solution: Change PORT environment variable or kill process using the port

**3. JWT errors**
```
Invalid or expired token
```
Solution: Verify JWT_SECRET matches between deployments

**4. CORS errors**
```
Access-Control-Allow-Origin error
```
Solution: Add frontend domain to CORS configuration

**5. 502 Bad Gateway (Nginx)**
```
502 Bad Gateway
```
Solution: Check if application is running, verify proxy configuration

### Debug Checklist

- [ ] Check environment variables are set correctly
- [ ] Verify database connectivity
- [ ] Review application logs
- [ ] Test endpoints with curl/Postman
- [ ] Check firewall/security group rules
- [ ] Verify SSL certificate is valid
- [ ] Test from different networks
- [ ] Check server resources (CPU, memory, disk)

### Getting Help

- Check application logs first
- Review platform-specific documentation
- Search GitHub issues
- Ask in discussions or open new issue

---

**Congratulations on deploying AgentX!** 🎉

Remember to:
- Monitor your application regularly
- Keep dependencies updated
- Review logs for issues
- Maintain backups
- Document any customizations
