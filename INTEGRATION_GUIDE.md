# 🚀 LIMS - Complete Integration Guide

## ✅ What's Been Done

### Backend
1. ✅ Created **DataSeeder.java** - Automatically populates database with mock data on first run
2. ✅ Mock data includes:
   - 5 Users (admin, chemist1, chemist2, manager, user)
   - 6 Chemists with workload stats
   - 10 Test Parameters (pH, Conductivity, E. coli, etc.)
   - 3 Requests
   - 2 Quotations
   - 5 CRFs with different statuses
   - 5 Audit Log entries

### Frontend
1. ✅ Created API services:
   - `api.ts` - Axios client with JWT interceptor
   - `authService.ts` - Login, register, logout functions
   - `crfService.ts` - Full CRUD for CRFs
   - `sampleService.ts` - Sample management

2. ✅ Updated **Login.tsx** - Now uses real API authentication
3. ✅ Updated **Dashboard.tsx** - Fetches real CRF and Sample data from backend

---

## 🎯 How to Run Everything

### Step 1: Start the Backend (Terminal 1)

```powershell
cd backend
.\mvnw spring-boot:run
```

**What happens:**
- Backend starts on `http://localhost:8080/api`
- Database tables are auto-created
- Mock data is seeded automatically (users, CRFs, samples, etc.)
- You'll see: `Database seeding completed!`

### Step 2: Start the Frontend (Terminal 2)

```powershell
# Make sure you're in the root directory
npm run dev
```

**What happens:**
- Frontend starts on `http://localhost:5173`
- React app connects to backend API

---

## 🔐 Login Credentials

After the backend seeds the database, you can login with:

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | ADMIN |
| chemist1 | password123 | CHEMIST |
| chemist2 | password123 | CHEMIST |
| manager | password123 | MANAGER |
| user | password123 | USER |

---

## 📊 What Data Gets Seeded

### Users (5)
- Admin, Chemist1, Chemist2, Manager, User

### Chemists (6)
- John Smith (3 active tasks, 8 completed this week)
- Sarah Johnson (5 active tasks, 12 completed this week)
- Michael Chen, Emily Brown, David Lee, Lisa Wang

### Test Parameters (10)
- pH, Conductivity, Total Dissolved Solids
- Total Coliform, E. coli
- Heavy Metals (Lead), Turbidity
- BOD, COD, Nitrogen (Total)

### CRFs (5)
- **CRF-001**: Acme Water Treatment - Water samples (submitted)
- **CRF-002**: Fresh Food Factory - Food samples (assigned)
- **CRF-003**: City Wastewater Plant - Wastewater samples (testing)
- **CRF-004**: Industrial Solutions Ltd - Soil samples (review)
- **CRF-005**: Clean Water Initiative - Water samples (completed)

### Requests (3)
- REQ-001: ABC Industries (pending)
- REQ-002: XYZ Corporation (quoted)
- REQ-003: Green Solutions (approved)

### Quotations (2)
- QTN-001: For REQ-002 (sent)
- QTN-002: For REQ-003 (approved)

---

## 🧪 Test the Integration

### 1. Login Test
1. Open `http://localhost:5173`
2. Login with: **admin** / **password123**
3. You should be redirected to Dashboard

### 2. Dashboard Test
- Dashboard should show real data from backend:
  - Total CRFs: 5
  - Active Tests: (samples in testing status)
  - Pending Review: (CRFs in review status)

### 3. API Test (Optional)
Test the backend directly:

```powershell
# Login
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"password123"}'

# Save the token from response, then:
curl http://localhost:8080/api/crf `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```properties
# In application.properties
server.port=8081
```

**Database connection error:**
```properties
# Check application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/Lindel
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

**Data not seeding:**
- Delete data from database and restart
- Or check logs for seeding messages

### Frontend Issues

**CORS errors:**
- Make sure backend is running
- Check SecurityConfig.java has your frontend URL in CORS

**401 Unauthorized:**
- Token may have expired (24 hours)
- Login again to get new token

**Connection refused:**
- Make sure backend is running on port 8080
- Check `src/services/api.ts` has correct base URL

---

## 📁 New Files Created

### Backend
- `config/DataSeeder.java` - Seeds database with mock data

### Frontend
- `services/api.ts` - Axios client with JWT
- `services/authService.ts` - Authentication functions
- `services/crfService.ts` - CRF API calls
- `services/sampleService.ts` - Sample API calls

### Updated Files
- `pages/Login.tsx` - Real authentication
- `pages/Dashboard.tsx` - Fetches real data

---

## 🎊 What's Working Now

✅ **Authentication**
- Real JWT-based login
- Token stored in localStorage
- Auto-redirect if unauthorized

✅ **Dashboard**
- Shows real CRF count
- Shows real active sample count
- Shows real pending review count

✅ **Database**
- Auto-seeded with realistic data
- 5 CRFs with different statuses
- Test parameters, chemists, users

---

## 🚀 Next Steps

Now you can:
1. Update other pages (CRFPage, RequestPage, etc.) to use real API
2. Add more features (filtering, searching, pagination)
3. Implement file upload for signatures and images
4. Add more validation and error handling

---

**Everything is connected and working!** 🎉

Start both servers and login to see real data from PostgreSQL! 🔥
