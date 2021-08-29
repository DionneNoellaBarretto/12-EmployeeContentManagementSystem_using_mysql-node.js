-- Prepopulating database with example data for starters..

INSERT INTO department (id, name)
VALUES (1, "Engineering"), (2, "Sales"), (3, "Finance"), (4, "Legal");

INSERT INTO role (id, title, salary, department_id)
VALUES (177, "Software Engineer", 150000, 1), (155, "Qa Engineer", 120000, 1), (288, "Marketing Lead", 90000, 2), (210, "Salesperson", 70000, 2), (321, "Accountant",90000, 3), (401,"Lawyer", 150000, 4), (422, "Legal Assistant", 50000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ("Michelle", "Nguyen", 155, 3), ("Justin", "Turner", 422, 4);

INSERT INTO employee (first_name, last_name, role_id) 
VALUES ("Jeffrey", "Lee", 177), ("Meg", "Turner", 401);