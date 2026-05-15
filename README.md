# TaskFlow

TaskFlow is a simple project and task management application built for teams to manage their daily work in one place.

I started building this project because I wanted to create something that feels practical and closer to a real product instead of only making small CRUD applications. While working on it, I focused on things like authentication, user roles, project organization, task assignment, and real-time updates between team members.

The application allows users to create projects, divide work into tasks, assign those tasks to other users, and track progress through different stages. I also added role-based access so admins and normal members do not have the same permissions inside the system.

The project is built using the MERN stack with Socket.io for real-time communication.

---

# Live Demo

https://taskflow-production-ded9.up.railway.app/

---

# What This Project Does

The main purpose of TaskFlow is to make team collaboration easier.

A user can create a project and invite other members into it. Inside every project, tasks can be created with details like priority, deadlines, and current status. Tasks can then be assigned to team members so everyone knows what they are supposed to work on.

Instead of keeping everything static, the app also supports live updates using Socket.io. So if one user updates a task status, the changes can appear instantly for others without refreshing the page.

I tried to keep the interface and workflow simple so the application feels easy to use.

---

# Main Features

## User Authentication

Users can create an account and log in securely. Passwords are hashed before storing them in the database, and JWT authentication is used to protect private routes.

The application also supports protected APIs so only authenticated users can access project and task data.

---

## Role-Based Access Control

The app has two types of users:

### Admin
Admins have full access inside the system. They can:
- Create projects
- Assign tasks
- Manage members
- Update any task
- Delete projects or tasks

### Member
Members have limited access. They can:
- View assigned projects
- Update their own tasks
- Track progress
- Work with team members

This separation helped me understand how authorization works in real applications.

---

## Project Management

Users can create projects and organize work inside them.

Each project can contain:
- Project title
- Description
- Team members
- Tasks
- Deadlines
- Progress tracking

Projects can also be updated or deleted later.

---

## Task Management

Tasks are the main part of the application.

Inside a project, users can:
- Create tasks
- Assign tasks to members
- Add deadlines
- Set priorities
- Change task status

The task workflow currently follows:

```text
Todo → In Progress → Completed
```

This helped me practice handling relationships between collections in MongoDB.

---

## Dashboard

The dashboard gives a quick overview of the current work.

It shows:
- Total projects
- Completed tasks
- Pending work
- Overdue tasks
- General project progress

The goal was to keep the dashboard clean and useful instead of overloading it with too much information.

---

## Real-Time Updates

One feature I personally enjoyed building was the real-time system using Socket.io.

When a task is updated by one user, other users connected to the same project can see changes instantly without refreshing the page.

This made the project feel much closer to a real collaboration platform.

---

# Tech Stack

I used the following technologies while building the project:

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- Passport.js
- JWT

### Real-Time Communication
- Socket.io

### Testing
- Jest
- Mocha

---

# Project Structure

```bash
Taskflow/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── docker-compose.yml
├── railway.toml
├── README.md
└── DEPLOYMENT.md
```

I separated the frontend and backend into different folders to keep the project organized and easier to maintain.

---

# Running the Project Locally

To run the project locally, first clone the repository:

```bash
git clone https://github.com/shivam-23111/Taskflow.git
```

Move into the project folder:

```bash
cd Taskflow
```

---

# Backend Setup

Go inside the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and add the required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_ORIGINS=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend server should now run on:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal and move into the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend should now run on:

```text
http://localhost:5173
```

---

# API Routes

The backend is built using REST APIs.

Some important routes are:

## Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

## Projects
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

## Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

---

# Deployment

The complete App (Frontend + Backend) is deployed on Railway.

MongoDB Atlas is used as the cloud database.

I also added Docker support and deployment configuration files to make deployment easier.

---

# Future Improvements

There are still many things I would like to improve in the future.

Some planned features are:
- File uploads
- Task comments
- Notifications
- Activity history
- Kanban board
- Better analytics
- Dark mode
- Email reminders

---

# What I Learned

This project helped me improve a lot in backend development and application structure.

While building it, I learned:
- How authentication and authorization work
- How to structure REST APIs
- Managing MongoDB relationships
- Real-time communication with Socket.io
- Handling frontend and backend integration
- Organizing larger codebases

It was also good practice for understanding how real collaborative applications are designed.

---

# Screenshots


<img width="1532" height="777" alt="image" src="https://github.com/user-attachments/assets/b8e361bc-85bd-41af-9a16-13fe23b9d1a9" />
<img width="1531" height="795" alt="image" src="https://github.com/user-attachments/assets/a46ca8b4-250c-48e4-99e9-a97190933bc4" />



---

# Contributing

If you want to contribute to the project, feel free to fork the repository and create a pull request.

---

# License

This project is licensed under the MIT License.

---

# Author

Shivam Tiwari

GitHub Repository:  
https://github.com/shivam-23111/Taskflow
