CREATE DATABASE IF NOT EXISTS online_quiz_db;
USE online_quiz_db;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS quizzes (
  quiz_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  total_marks INT NOT NULL DEFAULT 0,
  duration INT NOT NULL DEFAULT 10,
  created_by INT,
  CONSTRAINT fk_quiz_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
  result_id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  attempted_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(120) NOT NULL DEFAULT 'Submitted',
  CONSTRAINT fk_result_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  CONSTRAINT fk_result_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (user_id,name,email,password,role) VALUES
(1,'Quiz Admin','admin@quiz.com','admin123','admin'),
(2,'Demo Student','student@quiz.com','student123','student');

INSERT IGNORE INTO quizzes (quiz_id,title,subject,total_marks,duration,created_by) VALUES
(1,'Java Fundamentals','Programming',5,10,1),
(2,'Web Technology Basics','Web Development',5,8,1);

INSERT IGNORE INTO questions (quiz_id,question_text,option_a,option_b,option_c,option_d,correct_answer) VALUES
(1,'Which keyword is used to inherit a class in Java?','implements','extends','inherits','super','B'),
(1,'Which method is the entry point of a Java application?','start()','run()','main()','init()','C'),
(1,'Which type stores true or false?','int','String','boolean','char','C'),
(1,'Java source files use which extension?','.class','.java','.js','.jar','B'),
(1,'Which is not a primitive type?','int','double','boolean','String','D'),
(2,'What does HTML stand for?','Hyper Text Markup Language','High Text Machine Language','Hyper Tool Multi Language','Home Text Markup Link','A'),
(2,'Which CSS property changes text color?','font-style','color','background','text-align','B'),
(2,'Which language adds interactivity to webpages?','SQL','Java','JavaScript','C','C'),
(2,'Which tag creates a hyperlink?','<link>','<a>','<href>','<url>','B'),
(2,'Which symbol starts an ID selector in CSS?','.','#','@','&','B');
