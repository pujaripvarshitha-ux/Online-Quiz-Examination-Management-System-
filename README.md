# Online Quiz Examination Management System

A student-friendly quiz portal built with HTML, CSS, JavaScript, Node.js/Express and MySQL.

## Features
- Responsive quiz dashboard and quiz-taking interface
- Create, read, update and delete quizzes
- CRUD questions for each quiz (including answer options and correct answer)
- User registration/listing CRUD
- Submit quiz attempts, calculate scores, and view results
- MySQL schema matching the four requested tables

## Setup (Windows / VS Code)
1. Install Node.js and MySQL Server.
2. Open this project folder in VS Code.
3. In MySQL Workbench, run `database.sql` to create the database and tables.
4. Copy `.env.example` to `.env` and enter your MySQL password.
5. Open VS Code Terminal in this folder and run:
   ```bash
   npm install
   npm start
   ```
6. Open `http://localhost:3000`.

## Notes
- The application uses a simple role field (`student` or `admin`). This starter project does not include production-grade authentication. Passwords are stored as provided for the classroom CRUD demo; for deployment, add bcrypt hashing, sessions/JWT, validation, and authorization.
- The seed SQL inserts example quiz data. You can remove it if you want an empty database.
