-- Prepopulating database with example data for starters..
USE dnb_empDB;

DELETE FROM department;

INSERT INTO department (name)
VALUES ("Accounting"),
       ("Marketing"),
       ("Human Resources"),
       ("Customer Support"),
       ("Engineering"),
       ("Sales");

DELETE FROM role;
INSERT INTO role (title, salary, department_id)
VALUES 
("Web Developer", 150000, 4),
("Founder", 200000, 1), 
("Sales Executive", 70000, 6), 
("Dev Ops", 80000.00, 4), 
("Support Engineer", 59000, 2),
("People Operations", 70000, 5),
("Sales Engineer", 60000, 6),
("Test Engineer",90000, 4), 
("Marketing Analyst", 60000, 3), 
("Legal Assistant", 50000, 1);


DELETE FROM employee;
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Dionne Noella", "Barretto", 2, NULL),
	("Ash", "R", 1, 4),
    ("Sun", "R", 4, NULL),
    ("San", "R", 5, 3),
    ("Paul", "B", 9, 5),
    ("Venetia", "GB", 6, 1),
    ("Dee", "Bee", 7, 7),
    ("DiNo", "Bash", 10, 7),
    ("Joe", "Boe", 8, NULL),
    ("John", "Doe", 3, NULL);