CREATE DATABASE employeeCMS_DB;

USE employeeCMS_DB;

CREATE TABLE department (
    id INT(10) NOT NULL, 
    name VARCHAR(30) NOT NULL, -- department name
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id INT(10) NOT NULL,
    title VARCHAR(30) NOT NULL, -- role title 
    salary DECIMAL(10,2) NOT NULL, 
    department_id INT(10) NOT NULL, -- holds reference to department role belongs to
    PRIMARY KEY (id)
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT, 
    first_name VARCHAR(30) NOT NULL, 
    last_name VARCHAR(30) NOT NULL, 
    role_id INT(10) NOT NULL, 
    manager_id INT(10) NULL, -- null if employee has no manager
    PRIMARY KEY (id)
);