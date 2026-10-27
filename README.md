# 🎓 University Management Portal

A full-stack University Management Portal built with **Next.js, Node.js, Express.js, Sequelize ORM, and PostgreSQL**. The application provides a centralized platform for managing students, departments, courses, and student academic relationships through a modern web interface and RESTful APIs.

## 🚀 Features

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication using an HTTP-only cookie
- Protected API endpoints
- Authentication middleware
- Authentication rate limiting
- Centralized error handling

### 👨‍🎓 Student Management
- Create, view, update, and delete student records
- View individual student details
- Manage student profile information, including phone and address
- Assign students to departments
- Enroll students in courses
- Search, pagination, filtering, and sorting capabilities

### 🏢 Department Management
- Create and view departments
- View department details and associated students
- Update department information
- Delete departments with student-assignment validation

### 📚 Course Management
- Create and view courses
- Update course information
- Delete courses
- Enroll students in courses and manage course associations

### ⚙️ Backend & API
- RESTful API architecture
- Modular controllers, services, routes, and middleware
- PostgreSQL database integration
- Sequelize ORM and model relationships
- Centralized request validation and error handling
- Automated API testing with Jest and Supertest

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework |
| JavaScript | Application programming |
| Tailwind CSS | Frontend styling |
| Node.js | Backend JavaScript runtime |
| Express.js | REST API development |
| PostgreSQL | Relational database |
| Sequelize | ORM and database operations |
| JWT | Authentication |
| Jest | Automated testing |
| Supertest | HTTP API testing |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
university-management-system/
│
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   ├── authenticate.js
│   │   │   ├── authRateLimiter.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── Student.js
│   │   │   ├── StudentProfile.js
│   │   │   ├── Department.js
│   │   │   ├── Course.js
│   │   │   └── User.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   └── students/
│   │   ├── tests/
│   │   ├── app.js
│   │   └── server.js
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── app/
│   │       ├── components/
│   │       ├── courses/
│   │       ├── dashboard/
│   │       ├── departments/
│   │       ├── login/
│   │       ├── register/
│   │       └── students/
│   ├── package.json
│   └── .gitignore
│
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure the following tools are installed:

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/MFurqanCh10/university-management-portal.git
cd university-management-portal
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and configure your PostgreSQL connection, server port, and JWT secret according to the environment variable names used in the backend configuration.

Example configuration using common variable names:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=university_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

JWT_SECRET=replace_with_a_secure_random_secret
```

**Important:** Match these variable names to `src/config/database.js` and your authentication service. Replace all example credentials with your own values. Never commit your actual `.env` file or expose secrets publicly.

Create the PostgreSQL database named `university_db` before starting the backend, or use your own configured database name.

### 3. Start the Backend

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

Health-check endpoint:

`GET http://localhost:5000/api/health`

### 4. Configure the Frontend

Open another terminal:

```bash
cd university-management-portal/frontend
npm install
npm run dev
```

The frontend runs at:

`http://localhost:3000`

Open the application in your browser and register or log in to access protected sections.

## 🔗 API Overview

The backend exposes RESTful endpoints under `/api`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve the authenticated user |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/students` | Retrieve students |
| GET | `/api/students/:id` | Retrieve a student |
| POST | `/api/students/:id/profile` | Create a student profile |
| PUT | `/api/students/:id/profile` | Create or update a student profile |
| GET | `/api/departments` | Retrieve departments |
| POST | `/api/departments` | Create a department |
| PUT | `/api/departments/:id` | Update a department |
| DELETE | `/api/departments/:id` | Delete a department |
| GET | `/api/courses` | Retrieve courses |
| POST | `/api/courses` | Create a course |
| PUT | `/api/courses/:id` | Update a course |
| DELETE | `/api/courses/:id` | Delete a course |

Most student, department, course, and account endpoints require authentication. Consult the route definitions for the complete endpoint list and each endpoint's exact request format.

## 🧪 Automated API Testing

The backend uses Jest and Supertest for automated API tests.

Run the tests from the backend directory:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The health endpoint test verifies that the API returns HTTP `200` and the expected JSON response.

## 🗄️ Database Relationships

The application uses Sequelize associations to represent university data:

- **Student ↔ StudentProfile:** One-to-one
- **Department → Students:** One-to-many
- **Student ↔ Courses:** Many-to-many

These relationships allow the application to manage student details, department assignments, and course enrollments in a relational database.

## 🔒 Security Notes

- Keep database credentials and JWT secrets in environment variables.
- Do not commit `.env` files or other sensitive information.
- Use HTTPS in production.
- Keep dependencies updated and review security advisories.
- Validate incoming data and enforce authorization rules appropriate to your deployment.
- Configure CORS to allow only the frontend origins you trust.

## 🗺️ Future Improvements

Potential enhancements include:

- Role-based access control for administrators, teachers, and students
- Expanded automated tests for authentication and CRUD operations
- API documentation using Swagger/OpenAPI
- Continuous integration and automated deployment
- Production deployment and monitoring

## 👨‍💻 Author

**Muhammad Furqan**

- GitHub: [@MFurqanCh10](https://github.com/MFurqanCh10)
- Project Repository: [University Management Portal](https://github.com/MFurqanCh10/university-management-portal)

## 📄 License


