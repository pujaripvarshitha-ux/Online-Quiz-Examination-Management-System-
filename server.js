require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '****',
  database: process.env.DB_NAME || 'online_quiz_db',
  waitForConnections: true,
  connectionLimit: 10
});
const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

// USERS CRUD
app.get('/api/users', asyncRoute(async(req,res)=>{ const [r]=await pool.query('SELECT user_id,name,email,role FROM users ORDER BY user_id DESC'); res.json(r); }));
app.post('/api/users', asyncRoute(async(req,res)=>{ const {name,email,password,role='student'}=req.body; const [r]=await pool.query('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)',[name,email,password,role]); res.status(201).json({user_id:r.insertId}); }));
app.put('/api/users/:id', asyncRoute(async(req,res)=>{ const {name,email,password,role}=req.body; await pool.query('UPDATE users SET name=?,email=?,password=?,role=? WHERE user_id=?',[name,email,password,role,req.params.id]); res.json({message:'User updated'}); }));
app.delete('/api/users/:id', asyncRoute(async(req,res)=>{ await pool.query('DELETE FROM users WHERE user_id=?',[req.params.id]); res.json({message:'User deleted'}); }));

// QUIZZES CRUD
app.get('/api/quizzes', asyncRoute(async(req,res)=>{ const [r]=await pool.query('SELECT q.*,u.name AS creator,(SELECT COUNT(*) FROM questions x WHERE x.quiz_id=q.quiz_id) AS question_count FROM quizzes q LEFT JOIN users u ON q.created_by=u.user_id ORDER BY q.quiz_id DESC'); res.json(r); }));
app.get('/api/quizzes/:id', asyncRoute(async(req,res)=>{ const [[quiz]]=await pool.query('SELECT * FROM quizzes WHERE quiz_id=?',[req.params.id]); if(!quiz) return res.status(404).json({message:'Quiz not found'}); const [questions]=await pool.query('SELECT question_id,quiz_id,question_text,option_a,option_b,option_c,option_d FROM questions WHERE quiz_id=?',[req.params.id]); res.json({...quiz,questions}); }));
app.post('/api/quizzes', asyncRoute(async(req,res)=>{ const {title,subject,total_marks,duration,created_by}=req.body; const [r]=await pool.query('INSERT INTO quizzes(title,subject,total_marks,duration,created_by) VALUES(?,?,?,?,?)',[title,subject,total_marks,duration,created_by||1]); res.status(201).json({quiz_id:r.insertId}); }));
app.put('/api/quizzes/:id', asyncRoute(async(req,res)=>{ const {title,subject,total_marks,duration,created_by}=req.body; await pool.query('UPDATE quizzes SET title=?,subject=?,total_marks=?,duration=?,created_by=? WHERE quiz_id=?',[title,subject,total_marks,duration,created_by||1,req.params.id]); res.json({message:'Quiz updated'}); }));
app.delete('/api/quizzes/:id', asyncRoute(async(req,res)=>{ await pool.query('DELETE FROM quizzes WHERE quiz_id=?',[req.params.id]); res.json({message:'Quiz deleted'}); }));

// QUESTIONS CRUD
app.get('/api/questions', asyncRoute(async(req,res)=>{ const [r]=await pool.query('SELECT * FROM questions ORDER BY question_id DESC'); res.json(r); }));
app.get('/api/quizzes/:id/questions', asyncRoute(async(req,res)=>{ const [r]=await pool.query('SELECT * FROM questions WHERE quiz_id=?',[req.params.id]); res.json(r); }));
app.post('/api/questions', asyncRoute(async(req,res)=>{ const {quiz_id,question_text,option_a,option_b,option_c,option_d,correct_answer}=req.body; const [r]=await pool.query('INSERT INTO questions(quiz_id,question_text,option_a,option_b,option_c,option_d,correct_answer) VALUES(?,?,?,?,?,?,?)',[quiz_id,question_text,option_a,option_b,option_c,option_d,correct_answer]); res.status(201).json({question_id:r.insertId}); }));
app.put('/api/questions/:id', asyncRoute(async(req,res)=>{ const {quiz_id,question_text,option_a,option_b,option_c,option_d,correct_answer}=req.body; await pool.query('UPDATE questions SET quiz_id=?,question_text=?,option_a=?,option_b=?,option_c=?,option_d=?,correct_answer=? WHERE question_id=?',[quiz_id,question_text,option_a,option_b,option_c,option_d,correct_answer,req.params.id]); res.json({message:'Question updated'}); }));
app.delete('/api/questions/:id', asyncRoute(async(req,res)=>{ await pool.query('DELETE FROM questions WHERE question_id=?',[req.params.id]); res.json({message:'Question deleted'}); }));

// QUIZ SUBMISSION + RESULTS
app.post('/api/attempts', asyncRoute(async(req,res)=>{ const {quiz_id,user_id,answers}=req.body; const [questions]=await pool.query('SELECT question_id,correct_answer FROM questions WHERE quiz_id=?',[quiz_id]); const score=questions.reduce((sum,q)=>sum+(String(answers?.[q.question_id]||'').toUpperCase()===String(q.correct_answer).toUpperCase()?1:0),0); const [r]=await pool.query('INSERT INTO results(quiz_id,user_id,score,status) VALUES(?,?,?,?)',[quiz_id,user_id,score,'Submitted']); res.status(201).json({result_id:r.insertId,score,total:questions.length}); }));
app.get('/api/results', asyncRoute(async(req,res)=>{ const [r]=await pool.query('SELECT r.*,q.title,u.name FROM results r JOIN quizzes q ON q.quiz_id=r.quiz_id JOIN users u ON u.user_id=r.user_id ORDER BY attempted_date DESC'); res.json(r); }));
app.get('/api/results/user/:id', asyncRoute(async(req,res)=>{ const [r]=await pool.query('SELECT r.*,q.title,q.subject FROM results r JOIN quizzes q ON q.quiz_id=r.quiz_id WHERE r.user_id=? ORDER BY attempted_date DESC',[req.params.id]); res.json(r); }));
app.put('/api/results/:id', asyncRoute(async(req,res)=>{ const {score,status}=req.body; await pool.query('UPDATE results SET score=?,status=? WHERE result_id=?',[score,status,req.params.id]); res.json({message:'Result updated'}); }));
app.delete('/api/results/:id', asyncRoute(async(req,res)=>{ await pool.query('DELETE FROM results WHERE result_id=?',[req.params.id]); res.json({message:'Result deleted'}); }));

app.get('/api/stats', asyncRoute(async(req,res)=>{ const [[u]]=await pool.query('SELECT COUNT(*) n FROM users'); const [[q]]=await pool.query('SELECT COUNT(*) n FROM quizzes'); const [[r]]=await pool.query('SELECT COUNT(*) n FROM results'); res.json({users:u.n,quizzes:q.n,attempts:r.n}); }));
app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({message:err.code==='ER_DUP_ENTRY'?'Email already exists': 'Server/database error',detail:err.message}); });
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`Quiz portal running at http://localhost:${port}`));
