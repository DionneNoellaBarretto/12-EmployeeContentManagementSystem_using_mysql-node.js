const inquirer = require('inquirer');
const chalk = require('chalk');

// Validation for if the user doesn't enter a value
const validateInput = (input) => { 
    if(!input) {
        return chalk.red("Please enter a value.");
    }
    return true;
}

// Menu choices
const menuQ = [ 
    { 
        name: 'choice',
        message: 'What would you like to do?',
        type: 'list',
        choices: [ 
            "Add Department",
            "Add Role",
            "Add Employee",
            "View All Employees", 
            "View All Roles", 
            "View All Departments", 
            "Update Employee Role",
            "Remove Employee",
            "Remove Department",
            "Exit"
        ]   
    }
]

// Prompts for adding new department
const departmentQ = [
    {
        name: 'id', 
        message: 'What do you want the ID of the department to be?',
        type: 'input',
        validate: validateInput
    },
    {
        name: 'name',
        message: 'What do you want the name of the department to be?',
        type: 'input',
        validate: validateInput
    }
]

// Prompts for adding new role
const roleQ = [
    {
        name: 'id', 
        message: 'What do you want the ID of the role to be?',
        type: 'input',
        validate: validateInput
    },
    {
        name: 'title',
        message: 'What title is the role?',
        type: 'input',
        validate: validateInput
    },
    {
        name: 'salary',
        message: 'What is the salary for the role?',
        type: 'input',
        validate: validateInput
    },
    {
        name: 'dep',
        message: 'What department does the role belong to? Choose a valid role from the database.',
        type: 'input',
        validate: validateInput
    }
]

// Prompts for adding new employee
const employeeQ = [
    {
        name: 'name', 
        message: 'What is the first name of the employee?',
        type: 'input',
        validate: validateInput
    },
    {
        name: 'name2',
        message: 'What is the last name of the employee?',
        type: 'input',
        validate: validateInput
    },
    {
        name: 'role',
        message: "What is the employee's role? Choose a valid role from the database.",
        type: 'input',
        validate: validateInput
    },
    { 
        name: 'choice',
        message: 'Does the employee have a manager',
        type: 'list',
        choices: [ 
            "Yes",
            "No",
        ]   
    },
    {
        name: 'manager',
        message: "Who is the employee's manager? Choose a valid employee from the database.",
        type: 'input',
        when: (answers) => answers.choice === 'Yes'
    }
]

// Prompts for updating employee role
const employeeRole = [
    {
        name: 'name', 
        message: 'Which employee did you want to update?',
        type: 'input',
        validate: validateInput
    }
]

const employeeRole2 = [
    {
    name: 'role', 
    message: 'What is the name of the role you want to update for the employee? Choose a valid role from the database?',
    type: 'input',
    validate: validateInput
    }
]

// Prompts for removing employees
const removeEPrompts = [
    {
    name: 'name', 
    message: 'What is the name of the employee you want to remove?',
    type: 'input',
    validate: validateInput
    }
]

// Prompts for removing department
const removeDPrompts = [
    {
    name: 'name', 
    message: 'What is the name of the department you want to remove?',
    type: 'input',
    validate: validateInput
    }
]


module.exports = {menuQ, departmentQ, roleQ, employeeRole, employeeRole2, removeEPrompts, 
employeeQ, removeDPrompts}