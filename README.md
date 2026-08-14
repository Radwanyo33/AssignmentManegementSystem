markdown

```
# Assignment & Submission Management System

A full-stack, role-based school/college application for managing assignments, submissions, and user roles. Built with **ASP.NET Core Web API** (backend) and **Next.js** (frontend), with **PostgreSQL** as the database.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Database Setup](#-database-setup)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Demo Credentials](#-demo-credentials)
- [Environment Variables](#-environment-variables)
- [Assumptions & Limitations](#-assumptions--limitations)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### 👑 Admin
- ✅ Manage users (CRUD)
- ✅ Manage classes and subjects
- ✅ Assign teachers to subjects/classes
- ✅ View all assignments and submissions
- ✅ Manage application settings

### 👨‍🏫 Teacher
- ✅ Create, update, and delete assignments
- ✅ Assign assignments to specific classes and subjects
- ✅ Define title, description, deadline, and maximum marks
- ✅ Publish assignments or keep as drafts
- ✅ View student submissions
- ✅ Assign marks and provide feedback
- ✅ Change submission status

### 🎓 Student
- ✅ View assignments assigned to their class/course
- ✅ View assignment details and deadlines
- ✅ Submit answers
- ✅ Update submissions before the deadline (if allowed)
- ✅ View submission status, marks, and teacher feedback

---

## 🛠️ Tech Stack

### Backend
| Technology | Version |
|------------|---------|
| ASP.NET Core Web API | 8.0 |
| C# | 12.0 |
| Entity Framework Core | 8.0 |
| PostgreSQL | 15+ |
| JWT Authentication | - |
| Swagger/OpenAPI | - |
| xUnit | 2.5.3 |
| BCrypt.Net-Next | 4.0.3 |

### Frontend
| Technology | Version |
|------------|---------|
| Next.js | 15.5.23 |
| React | 18.3.1 |
| TypeScript | 5.0+ |
| Tailwind CSS | 3.3.0 |
| Axios | 1.7.0 |
| React Hook Form | 7.48.2 |
| Zod | 3.22.4 |
| Jest | 29.7.0 |
| Testing Library | 14.1.2 |

---

## 📁 Project Structure

```

AssignmentManagement/
├── Backend/
│ └── AssignmentManagement.API/
│ ├── Controllers/
│ │ ├── AuthController.cs
│ │ ├── AssignmentsController.cs
│ │ ├── SubmissionsController.cs
│ │ ├── UsersController.cs
│ │ ├── ClassesController.cs
│ │ ├── SubjectsController.cs
│ │ ├── StudentController.cs
│ │ └── TeacherController.cs
│ ├── Models/
│ │ ├── User.cs
│ │ ├── Class.cs
│ │ ├── Subject.cs
│ │ ├── Assignment.cs
│ │ ├── Submission.cs
│ │ └── DTOs/
│ ├── Data/
│ │ ├── ApplicationDbContext.cs
│ │ └── Migrations/
│ ├── Services/
│ │ ├── JwtService.cs
│ │ └── EmailService.cs
│ ├── Middleware/
│ │ └── ErrorHandlingMiddleware.cs
│ ├── Program.cs
│ └── appsettings.json
│
├── Frontend/
│ └── assignment-management-frontend/
│ ├── src/
│ │ ├── app/
│ │ │ ├── (auth)/
│ │ │ │ ├── login/
│ │ │ │ └── register/
│ │ │ ├── (dashboard)/
│ │ │ │ ├── admin/
│ │ │ │ ├── teacher/
│ │ │ │ └── student/
│ │ │ ├── layout.tsx
│ │ │ └── page.tsx
│ │ ├── components/
│ │ │ ├── common/
│ │ │ ├── forms/
│ │ │ └── layouts/
│ │ ├── services/
│ │ │ ├── api.ts
│ │ │ ├── auth.service.ts
│ │ │ ├── assignment.service.ts
│ │ │ ├── submission.service.ts
│ │ │ ├── user.service.ts
│ │ │ ├── class.service.ts
│ │ │ └── subject.service.ts
│ │ ├── types/
│ │ │ └── index.ts
│ │ ├── hooks/
│ │ └── utils/
│ ├── public/
│ ├── **tests**/
│ ├── .env.local
│ ├── .env.example
│ ├── package.json
│ ├── tailwind.config.ts
│ ├── jest.config.js
│ ├── jest.setup.js
│ └── next.config.ts
│
├── docker-compose.yml (optional)
└── README.md

text

````
---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | 18.x or later | [nodejs.org](https://nodejs.org/) |
| .NET SDK | 8.0 or later | [dotnet.microsoft.com](https://dotnet.microsoft.com/) |
| PostgreSQL | 15 or later | [postgresql.org](https://www.postgresql.org/) |
| pgAdmin | 4.x or later | [pgadmin.org](https://www.pgadmin.org/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| VS Code or Visual Studio | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

---

## 🗄️ Database Setup

### 1. Install PostgreSQL and pgAdmin

- Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
- Make sure to remember your **postgres password**
- pgAdmin is included in the installation

### 2. Create the Database

#### Using pgAdmin GUI:

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on **"Databases"** → **"Create"** → **"Database..."**
4. Fill in the details:
   - **Database:** `assignment_management`
   - **Owner:** `postgres` (or your username)
   - **Encoding:** `UTF8`
   - **Template:** `template0`
   - **Connection Limit:** `-1`
5. Click **"Save"**

#### Using SQL Command:

```sql
CREATE DATABASE assignment_management;
````

### 3. Verify Database Connection

In pgAdmin, run this query to test:

sql

```
SELECT current_database();
-- Should return: assignment_management
```

---

## 🚀 Backend Setup

### 1. Clone and Navigate

bash

```
# Clone the repository (if applicable)
git clone <repository-url>
cd AssignmentManagement/Backend/AssignmentManagement.API
```

### 2. Update Connection String

Open `appsettings.json` and update the connection string:

json

```
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=assignment_management;Username=postgres;Password=YourPasswordHere"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-at-least-32-characters",
    "Issuer": "assignment-management-system",
    "Audience": "assignment-management-client",
    "ExpiryInDays": 7
  },
  "AllowedHosts": "*"
}
```

### 3. Install Dependencies

bash

```
dotnet restore
```

### 4. Run Database Migrations

bash

```
# Install EF Core tools (if not already)
dotnet tool install --global dotnet-ef

# Create migration (if needed)
dotnet ef migrations add InitialCreate

# Apply migration to database
dotnet ef database update
```

### 5. Run the Backend

bash

```
dotnet run
```

**The API will be available at:**

- HTTP: `http://localhost:5273`
- HTTPS: `https://localhost:7107`
- Swagger: `http://localhost:5273/swagger`

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend

bash

```
cd ../../Frontend/assignment-management-frontend
```

### 2. Install Dependencies

bash

```
npm install
```

### 3. Create Environment File

Create `.env.local` in the project root:

bash

```
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5273/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Frontend

bash

```
npm run dev
```

**The frontend will be available at:**

- Development: `http://localhost:3000`

---

## 🏃 Running the Application

### Option 1: Development Mode

**Terminal 1 - Backend:**

bash

```
cd Backend/AssignmentManagement.API
dotnet run
```

**Terminal 2 - Frontend:**

bash

```
cd Frontend/assignment-management-frontend
npm run dev
```

### Option 2: Production Build

**Backend:**

bash

```
cd Backend/AssignmentManagement.API
dotnet build -c Release
dotnet run -c Release
```

**Frontend:**

bash

```
cd Frontend/assignment-management-frontend
npm run build
npm run start
```

### Option 3: Using Docker (Optional)

bash

```
# Build and run all services
docker-compose up -d
```

---

## 📚 API Documentation

Once the backend is running, access Swagger UI at:

text

```
http://localhost:5273/swagger
```

### Key Endpoints

| **MethodEndpointDescription** |                               |                       |
| ----------------------------- | ----------------------------- | --------------------- |
| POST                          | `/api/auth/login`             | User login            |
| POST                          | `/api/auth/register`          | User registration     |
| GET                           | `/api/assignments`            | Get all assignments   |
| POST                          | `/api/assignments`            | Create assignment     |
| PUT                           | `/api/assignments/{id}`       | Update assignment     |
| DELETE                        | `/api/assignments/{id}`       | Delete assignment     |
| GET                           | `/api/submissions`            | Get submissions       |
| POST                          | `/api/submissions`            | Create submission     |
| PUT                           | `/api/submissions/{id}/grade` | Grade submission      |
| GET                           | `/api/users`                  | Get all users (Admin) |
| GET                           | `/api/classes`                | Get all classes       |
| GET                           | `/api/subjects`               | Get all subjects      |

### Authentication

All protected endpoints require a Bearer token:

text

```
Authorization: Bearer <your-jwt-token>
```

To get a token, use the `/api/auth/login` endpoint.

---

## 🧪 Testing

### Backend Tests (xUnit)

bash

```
# Navigate to solution root
cd Backend

# Run all tests
dotnet test

# Run with detailed output
dotnet test --verbosity detailed

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test project
dotnet test AssignmentManagement.Tests/AssignmentManagement.Tests.csproj
```

### Frontend Tests (Jest)

bash

```
# Navigate to frontend
cd Frontend/assignment-management-frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- __tests__/auth.test.tsx
```

---

## 🔑 Demo Credentials

### Pre-seeded Users

| **RoleEmailPassword** |                      |               |
| --------------------- | -------------------- | ------------- |
| **Admin**             | `admin@school.com`   | `Admin@123`   |
| **Teacher**           | `teacher@school.com` | `Teacher@123` |
| **Student**           | `student@school.com` | `Student@123` |

### Additional Demo Data

| **ClassDescription** |                    |
| -------------------- | ------------------ |
| Class 10A            | Grade 10 Section A |
| Class 12B            | Grade 12 Section B |

| **SubjectCodeClass** |         |           |
| -------------------- | ------- | --------- |
| Mathematics          | MATH101 | Class 10A |
| Physics              | PHY101  | Class 10A |
| Chemistry            | CHEM101 | Class 12B |

---

## 🔧 Environment Variables

### Backend (`appsettings.json`)

json

```
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=assignment_management;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Secret": "your-secret-key-min-32-characters",
    "Issuer": "assignment-management-system",
    "Audience": "assignment-management-client",
    "ExpiryInDays": 7
  },
  "AllowedHosts": "*",
  "AllowedOrigins": [ "http://localhost:3000" ]
}
```

### Frontend (`.env.local`)

env

```
NEXT_PUBLIC_API_URL=http://localhost:5273/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Frontend (`.env.example` - For reference)

env

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5273/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Swagger URL
NEXT_PUBLIC_SWAGGER_URL=http://localhost:5273/swagger
```

---

## 📝 Assumptions & Limitations

### Assumptions

1. Each student belongs to one class
2. A teacher can teach multiple subjects and classes
3. Assignments are created for specific classes and subjects
4. Students can submit only after the assignment is published
5. Submissions are editable until the deadline
6. Marks are integers
7. Email notifications are not implemented
8. File attachments are not supported

### Known Limitations

1. No file upload support
2. No email notifications
3. No real-time updates
4. No advanced filtering/pagination (basic implementation)
5. Basic error handling
6. No soft delete (hard delete only)
7. No audit logs
8. No export functionality (CSV/PDF)

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

**Error:** `Host not found` or `Connection refused`

**Solution:**

bash

```
# Check if PostgreSQL is running
# Windows
net start | findstr postgres

# Linux/macOS
sudo systemctl status postgresql

# Start PostgreSQL if not running
# Windows
net start postgresql-15

# Linux/macOS
sudo systemctl start postgresql
```

#### 2. Port Conflicts

**Error:** `Port 5000 is already in use`

**Solution:**

- Change the port in `launchsettings.json`
- Or kill the process using the port

bash

```
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### 3. Migration Issues

**Error:** `No database provider configured`

**Solution:**

bash

```
# Ensure packages are installed
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design

# Rebuild and migrate
dotnet clean
dotnet build
dotnet ef database update
```

#### 4. CORS Issues

**Error:** `CORS policy blocking requests`

**Solution:** Update `Program.cs`:

csharp

```
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
```

#### 5. Frontend API Connection Issues

**Error:** `Network Error` or `Failed to fetch`

**Solution:**

bash

```
# Check API URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:5273/api

# Restart frontend
rm -rf .next
npm run dev
```

#### 6. JWT Token Issues

**Error:** `401 Unauthorized`

**Solution:**

- Ensure token is valid and not expired
- Check token in `https://jwt.io`
- Ensure role is correctly set (Admin, Teacher, Student)

#### 7. BCrypt Package Conflicts

**Error:** `The type 'BCrypt' exists in both...`

**Solution:**

bash

```
# Remove the conflicting package
dotnet remove package BCrypt.Net-Core

# Keep only BCrypt.Net-Next
dotnet add package BCrypt.Net-Next
```

#### 8. Next.js Build Errors

**Error:** `Couldn't find any pages or app directory`

**Solution:**

bash

```
# Ensure correct directory structure
src/app/
├── (auth)/
├── (dashboard)/
├── layout.tsx
└── page.tsx

# Restart with cache clear
rm -rf .next
npm run dev
```

#### 9. TypeScript Errors

**Error:** `Cannot find module '@/services/...'`

**Solution:**

- Check the file name (case sensitive)
- Ensure the file exists in the correct directory
- Check imports for typos

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is created for recruitment purposes. All rights reserved.

---

## 📞 Contact

For any issues or questions, please create an issue in the repository.

---

## 🙏 Acknowledgments

- [ASP.NET](https://asp.net/) Core Team
- Next.js Team
- PostgreSQL Team
- All open-source libraries used in this project

---

**⭐ If you find this project useful, please give it a star!**

---

## 📊 Quick Reference

| **ServiceURLDescription** |                                                                |                                      |
| ------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| Frontend                  | [http://localhost:3000](http://localhost:3000/)                | Next.js Application                  |
| Backend API               | [http://localhost:5273](http://localhost:5273/)                | [ASP.NET](https://asp.net/) Core API |
| Swagger                   | [http://localhost:5273/swagger](http://localhost:5273/swagger) | API Documentation                    |
| pgAdmin                   | [http://localhost:5050](http://localhost:5050/)                | PostgreSQL Management                |

---

**🚀 Happy Coding!**