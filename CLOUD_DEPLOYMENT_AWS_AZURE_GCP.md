# DevApply - AWS, Azure & GCP Deployment Guide

Complete guide for deploying DevApply to major cloud providers.

---

## 🎯 Cloud Provider Comparison

| Feature | AWS | Azure | GCP |
|---------|-----|-------|-----|
| **Free Tier** | 12 months free | 12 months free | $300 credit (90 days) |
| **Setup Difficulty** | Medium | Easy | Medium |
| **Best For** | Enterprise, scalable | Microsoft integration | Data/AI focus |
| **Cold Start** | Fast | Fast | Fast |
| **Database** | RDS, DynamoDB | SQL Server, PostgreSQL | Cloud SQL |
| **Pricing** | Pay-as-you-go | Pay-as-you-go | Pay-as-you-go |
| **Documentation** | Extensive | Excellent | Good |

---

## 🏗️ ARCHITECTURE OPTIONS

### Option 1: Simple Deployment (Recommended for beginners)
```
GitHub → Cloud → App Service/EC2 → Database
(Simple but less control)
```

### Option 2: Container Deployment (Recommended)
```
GitHub → Docker → Container Registry → Kubernetes/App Service → Database
(Professional, scalable)
```

### Option 3: Infrastructure as Code (Enterprise)
```
GitHub → Terraform → Cloud Resources → Database
(Full control, reproducible)
```

---

# 🌐 AWS Deployment

## Prerequisites
- AWS account (free tier eligible)
- GitHub repository
- Terminal/command line

## Services Used
- **App Server:** EC2 or Elastic Beanstalk
- **Database:** RDS PostgreSQL
- **Frontend:** S3 + CloudFront or Elastic Beanstalk
- **Container:** ECR (Elastic Container Registry)

---

## Step 1: Create RDS PostgreSQL Database

### 1.1 Go to AWS RDS Console
1. Login to: https://console.aws.amazon.com/
2. Search for "RDS"
3. Click "Create Database"

### 1.2 Configure Database
- **Database Engine:** PostgreSQL
- **Version:** 15
- **Template:** Free tier eligible
- **DB Instance Identifier:** `devapply-db`
- **Master Username:** `dbadmin`
- **Master Password:** Create strong password
- **Instance Class:** `db.t3.micro` (free tier)
- **Storage:** `20 GB` (free tier)
- **Public Accessibility:** Yes (for now)
- **Initial Database Name:** `devapply_prod`

### 1.3 Create Database
- Click "Create Database"
- Wait 5-10 minutes for database to be created
- Go to database details page
- Copy **Endpoint** (looks like: `devapply-db.xxxxx.us-east-1.rds.amazonaws.com`)

### 1.4 Allow Inbound Traffic
1. Click on database
2. Go to "Connectivity & security"
3. Click on Security Group
4. Add inbound rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: 0.0.0.0/0 (allow all for now, restrict later)
5. Save

---

## Step 2: Create IAM User (Security)

### 2.1 Create User
1. Go to IAM dashboard
2. Click "Users"
3. Click "Create user"
4. Name: `devapply-app`
5. Attach policy: `AmazonEC2FullAccess` + `RDSFullAccess`

### 2.2 Create Access Keys
1. Click on user
2. Go to "Security credentials"
3. Click "Create access key"
4. Save Access Key ID and Secret Access Key

---

## Step 3: Deploy Backend on EC2

### 3.1 Create EC2 Instance
1. Go to EC2 dashboard
2. Click "Instances"
3. Click "Launch Instance"
4. **Name:** `devapply-backend`
5. **AMI:** Ubuntu 22.04 LTS (free tier eligible)
6. **Instance Type:** `t2.micro` (free tier)
7. **Key Pair:** Create new or select existing
8. **Security Group:** Create new
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
   - Allow Custom (port 8000) from anywhere
9. Click "Launch Instance"

### 3.2 Connect to Instance
```bash
# Download key pair (if new)
chmod 400 your-key.pem

# Connect via SSH
ssh -i "your-key.pem" ubuntu@your-instance-public-ip
```

### 3.3 Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install -y python3.11 python3-pip python3-venv

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Install Git
sudo apt install -y git

# Install Supervisor (for process management)
sudo apt install -y supervisor

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

### 3.4 Clone and Deploy Code
```bash
# Clone repository
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/devapply-app.git
cd devapply-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
sudo nano .env
```

### 3.5 Configure Environment Variables
```env
ENVIRONMENT=production
SECRET_KEY=your-random-32-char-key
DATABASE_URL=postgresql://dbadmin:password@devapply-db.xxxxx.us-east-1.rds.amazonaws.com:5432/devapply_prod
FRONTEND_URL=https://yourfrontend-domain.com
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

### 3.6 Setup Supervisor for Auto-Restart
```bash
# Create supervisor config
sudo nano /etc/supervisor/conf.d/devapply.conf
```

Add:
```ini
[program:devapply]
directory=/home/ubuntu/devapply-app
command=/home/ubuntu/devapply-app/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
autostart=true
autorestart=true
user=ubuntu
redirect_stderr=true
stdout_logfile=/var/log/devapply.log
```

Start:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start devapply
```

### 3.7 Setup Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/default
```

Replace with:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 4: Deploy Frontend on S3 + CloudFront

### 4.1 Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 4.2 Create S3 Bucket
1. Go to S3 console
2. Click "Create bucket"
3. Name: `devapply-frontend-prod`
4. Uncheck "Block all public access"
5. Create bucket

### 4.3 Upload Frontend
1. Click on bucket
2. Upload all files from `frontend/dist/` folder
3. Set public read permission

### 4.4 Enable Static Hosting
1. Click "Properties"
2. Go to "Static website hosting"
3. Enable "Use this bucket to host a website"
4. Index document: `index.html`
5. Save

### 4.5 Create CloudFront Distribution
1. Go to CloudFront console
2. Click "Create distribution"
3. **Origin Domain:** Your S3 bucket
4. **Viewer protocol:** Redirect HTTP to HTTPS
5. **Cache policy:** CachingOptimized
6. Create distribution

---

## Step 5: Connect Domain (Optional)

### 5.1 Route 53 Setup
1. Go to Route 53
2. Create hosted zone
3. Add A record pointing to:
   - Backend: EC2 Elastic IP
   - Frontend: CloudFront distribution

### 5.2 SSL Certificate
1. Go to ACM (AWS Certificate Manager)
2. Request public certificate
3. Validate domain
4. Attach to CloudFront

---

## AWS Cost Estimate (Free Tier)

| Service | Free Tier | Cost |
|---------|-----------|------|
| **EC2** | 750 hrs/month | Free (first year) |
| **RDS** | 750 hrs/month | Free (first year) |
| **S3** | 5GB storage | Free (first year) |
| **CloudFront** | 1TB outbound | Free (first year) |
| **Route 53** | $0.50/zone | ~$0.50 |
| **Total** | | ~$0.50/month (year 1) |

After free tier: ~$20-50/month depending on usage

---

# 🔵 AZURE Deployment

## Prerequisites
- Azure account (free trial with $200 credit)
- GitHub repository
- Azure CLI installed

## Services Used
- **App Service:** Web App (backend)
- **Database:** Azure Database for PostgreSQL
- **Frontend:** Static Web App
- **Container:** Container Registry (optional)

---

## Step 1: Create Azure Database for PostgreSQL

### 1.1 Create via Azure Portal
1. Go to: https://portal.azure.com/
2. Click "+ Create a resource"
3. Search "Azure Database for PostgreSQL"
4. Click "Create"

### 1.2 Configure Database
- **Subscription:** Your subscription
- **Resource Group:** Create new: `devapply-rg`
- **Server Name:** `devapply-db-server`
- **Location:** East US
- **PostgreSQL Version:** 15
- **Compute + Storage:** Basic, B1s
- **Admin Username:** `dbadmin`
- **Admin Password:** Strong password

### 1.3 Networking
- **Public Access:** Allow access from any Azure service
- **Firewall Rules:** Add your IP

### 1.4 Review and Create
- Click "Create"
- Wait 5-10 minutes
- Get connection string from "Overview"

---

## Step 2: Deploy Backend on App Service

### 2.1 Create App Service
1. Click "+ Create a resource"
2. Search "App Service"
3. Click "Create"

### 2.2 Configure App Service
- **Name:** `devapply-backend-api`
- **Runtime Stack:** Python 3.11
- **Operating System:** Linux
- **Region:** East US
- **App Service Plan:** Create new (Free F1)
- **GitHub Details:** Connect your repo

### 2.3 Configure Deployment
1. Go to "Deployment Center"
2. Connect GitHub account
3. Select repository and branch (`main`)
4. Choose "GitHub Actions"

### 2.4 Add Environment Variables
1. Go to "Configuration"
2. Add Application Settings:
   ```
   ENVIRONMENT=production
   SECRET_KEY=your-random-key
   DATABASE_URL=postgresql://dbadmin:password@devapply-db-server.postgres.database.azure.com:5432/devapply_prod
   FRONTEND_URL=https://yourfrontend.azurestaticapps.net
   SMTP_USER=your@gmail.com
   SMTP_PASS=your-app-password
   ```
3. Save

### 2.5 Configure Startup Command
1. Go to "Configuration" → "General settings"
2. **Startup Command:**
   ```
   gunicorn --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 app.main:app
   ```

---

## Step 3: Deploy Frontend on Static Web App

### 3.1 Create Static Web App
1. Click "+ Create a resource"
2. Search "Static Web App"
3. Click "Create"

### 3.2 Configure
- **Name:** `devapply-frontend`
- **Resource Group:** `devapply-rg`
- **Repository:** Select your GitHub repo
- **Build Presets:** Vite
- **App location:** `frontend`
- **Build output location:** `frontend/dist`

### 3.3 Complete Setup
- Azure will auto-configure GitHub Actions
- Deployment happens automatically on push
- Get URL from "Overview" tab

---

## Step 4: Update CORS

### 4.1 Update Backend Configuration
1. Go to App Service
2. Configuration → Application Settings
3. Update `FRONTEND_URL` with your Static Web App URL
4. Save (auto-redeploy)

---

## Azure Cost Estimate

| Service | Tier | Cost |
|---------|------|------|
| **App Service** | Free F1 | $0 (limited) |
| **PostgreSQL** | Basic B1s | ~$25/month |
| **Static Web App** | Free | $0 |
| **Total** | | ~$25/month |

Free trial: $200 credit (lasts several months)

---

# 🟠 GCP Deployment

## Prerequisites
- Google Cloud account (free trial with $300 credit)
- GitHub repository
- Google Cloud CLI installed

## Services Used
- **App Engine or Cloud Run:** Backend
- **Cloud SQL:** PostgreSQL Database
- **Cloud Storage + CDN:** Frontend
- **Container Registry:** Docker images

---

## Step 1: Create Cloud SQL PostgreSQL

### 1.1 Create Instance
1. Go to: https://console.cloud.google.com/
2. Search "Cloud SQL"
3. Click "Create Instance"
4. Choose "PostgreSQL"

### 1.2 Configure
- **Instance ID:** `devapply-db`
- **Password:** Strong password
- **Database Version:** PostgreSQL 15
- **Location:** us-east1
- **Configuration:** Development (cheaper)
- **Public IP:** Add (allow anywhere temporarily)
- **Backup:** Enabled

### 1.3 Create Database
1. Click on instance
2. Go to "Databases"
3. Create database: `devapply_prod`

### 1.4 Get Connection String
- Connection name: `project:region:instance`
- Private IP: `10.x.x.x`
- Public IP: Your IP address

---

## Step 2: Deploy Backend on Cloud Run

### 2.1 Create Dockerfile (if not exists)
Already provided in your project!

### 2.2 Enable APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### 2.3 Deploy to Cloud Run
```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy devapply-backend \
  --source . \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --set-env-vars="ENVIRONMENT=production,SECRET_KEY=your-key,DATABASE_URL=postgresql://...,FRONTEND_URL=https://..."
```

---

## Step 3: Deploy Frontend on Cloud Storage + CDN

### 3.1 Create Storage Bucket
```bash
gsutil mb -l us-east1 gs://devapply-frontend-prod
```

### 3.2 Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 3.3 Upload to Cloud Storage
```bash
gsutil -m cp -r frontend/dist/* gs://devapply-frontend-prod/
```

### 3.4 Set Permissions
```bash
gsutil iam ch serviceAccount:allUsers:objectViewer gs://devapply-frontend-prod
```

### 3.5 Enable Static Hosting
```bash
gsutil web set -m index.html -e 404.html gs://devapply-frontend-prod
```

### 3.6 Create Cloud CDN
1. Go to Cloud CDN
2. Create backend bucket pointing to your storage
3. Create HTTP load balancer
4. Get public IP

---

## Step 4: Environment Variables

### GCP Configuration File (app.yaml)
```yaml
runtime: python311

env: standard
instance_class: F1

env_variables:
  ENVIRONMENT: "production"
  SECRET_KEY: "your-random-key"
  DATABASE_URL: "postgresql://user:pass@cloudsql-ip/db"
  FRONTEND_URL: "https://your-frontend.com"
  SMTP_USER: "your@gmail.com"
  SMTP_PASS: "your-app-password"

beta_settings:
  cloud_sql_instances: "PROJECT:REGION:INSTANCE"
```

---

## GCP Cost Estimate

| Service | Tier | Cost |
|---------|------|------|
| **Cloud Run** | Free tier | Free (2M requests/month) |
| **Cloud SQL** | db-f1-micro | ~$10/month |
| **Cloud Storage** | 5GB | ~$0.10/month |
| **Cloud CDN** | | ~$0.12/GB |
| **Total** | | ~$10-15/month |

Free trial: $300 credit (3 months)

---

# 📊 QUICK COMPARISON TABLE

| Aspect | AWS | Azure | GCP |
|--------|-----|-------|-----|
| **Setup Time** | 45 min | 30 min | 45 min |
| **Difficulty** | Medium | Easy | Medium |
| **Free Tier Duration** | 12 months | 12 months | 3 months |
| **Cheapest Backend** | EC2 t2.micro ($0/yr) | App Service F1 ($0/yr) | Cloud Run (free) |
| **Database Cost** | ~$15/month | ~$25/month | ~$10/month |
| **Scaling** | Excellent | Excellent | Excellent |
| **Documentation** | Extensive | Excellent | Good |
| **Best For** | Enterprise | Microsoft users | Data-heavy |

---

# 🚀 DEPLOYMENT SUMMARY

## AWS Path
1. Create RDS PostgreSQL database
2. Launch EC2 instance
3. Deploy backend with Supervisor
4. Deploy frontend to S3 + CloudFront
5. Connect with Route 53
6. **Time:** 45 min | **Cost:** $0 year 1, ~$20-50/month after

## Azure Path
1. Create Azure Database for PostgreSQL
2. Create App Service
3. Deploy via GitHub Actions
4. Deploy frontend to Static Web App
5. **Time:** 30 min | **Cost:** ~$25/month

## GCP Path
1. Create Cloud SQL PostgreSQL
2. Deploy to Cloud Run
3. Upload frontend to Cloud Storage
4. Setup Cloud CDN
5. **Time:** 45 min | **Cost:** ~$10-15/month

---

# ✅ WHICH TO CHOOSE?

**Choose AWS if:**
- Want free year (EC2 + RDS)
- Need enterprise features
- Comfortable with complex setup

**Choose Azure if:**
- Want easiest setup
- Already using Microsoft products
- Prefer straightforward pricing

**Choose GCP if:**
- Want cheapest long-term
- Need fast auto-scaling
- Like Google infrastructure

---

# 🔐 SECURITY CHECKLIST

For all platforms:

- [ ] Database has strong password
- [ ] Firewall restricts access to your IP
- [ ] SSL/HTTPS enabled
- [ ] Environment variables not committed to git
- [ ] Backups enabled
- [ ] Monitoring alerts setup
- [ ] Keys rotated regularly
- [ ] Principle of least privilege (IAM)

---

# 📚 Additional Resources

**AWS:**
- https://aws.amazon.com/free/
- https://docs.aws.amazon.com/ec2/

**Azure:**
- https://azure.microsoft.com/free/
- https://docs.microsoft.com/azure/

**GCP:**
- https://cloud.google.com/free
- https://cloud.google.com/docs

---

# 🎯 NEXT STEPS

1. **Choose your cloud provider** from above
2. **Follow the deployment steps** for your choice
3. **Update environment variables** with actual values
4. **Test your deployment** (register, login, jobs)
5. **Monitor and scale** as needed

---

**All three platforms support:**
- ✅ Automatic scaling
- ✅ Load balancing
- ✅ Database backups
- ✅ SSL certificates
- ✅ CDN/Content delivery
- ✅ Monitoring & logging
- ✅ Disaster recovery

---

**Ready to deploy? Choose your provider and get started! 🚀**
