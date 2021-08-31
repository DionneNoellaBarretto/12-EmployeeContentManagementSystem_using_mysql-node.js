-- Prepopulating database with example data for starters..
DELETE FROM department;
INSERT INTO department (name)
VALUES ("Accounting"),
       ("Marketing"),
       ("Human Resources"),
       ("Customer Support"),
       ("Engineering"),
       ("Sales");
DELETE FROM role;
INSERT INTO role (id, title, salary, department_id)
VALUES 
(1, "Web Developer", 150000, 4),
(2, "Founder", 200000, 1), 
(3, "Sales Executive", 70000, 6), 
(4, "Dev Ops", 80000.00, 4), 
(8, "Support Engineer", 59000, 2),
(9, "People Operations", 70000, 5),
(10,"Sales Engineer", 60000, 6),
(5, "Test Engineer",90000, 4), 
(6, "Marketing Analyst", 60000, 3), 
(7, "Legal Assistant", 50000, 1);

DELETE FROM employee;

DELETE FROM employee;
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
    (1, "Dionne Noella", "Barretto", 2, 1),
	(2, "Ash", "R", 1, 2),
    (3, "Sun", "R", 4, NULL),
    (4, "San", "R", 5, 3),
    (5, "Paul", "B", 9, 4),
    (6, "Venetia", "GB", 6, NULL),
    (7, "Dee", "Bee", 7, 5),
    (8, "DiNo", "Bash", 10, 7),
    (9, "Joe", "Boe", 8, NULL),
    (10, "John", "Doe", 3, NULL);