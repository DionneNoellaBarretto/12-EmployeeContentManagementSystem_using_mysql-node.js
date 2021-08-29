// Node Module / Global Variable & Dependency Declaration
const mysql = require('mysql2'); // https://www.npmjs.com/package/mysql2
const inquirer = require('inquirer');
const chalk = require('chalk');
require('dotenv').config();
require('console.table');
const {menuQ, departmentQ, roleQ, employeeRole, employeeRole2, employeeQ, removeEPrompts, removeDPrompts} = require('./inquirer');


//Providing credentials to the SQL database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

// This class will control the flow of the application
class Application {
    start() { // Show the menu prompt
        inquirer.prompt(menuQ).then(answers => {
            this.pick(answers.choice);
        }).catch(error => {
            if (error.isTtyError) {
                console.log("Prompt couldn't be rendered in this current environment.");
            } else {
                console.log("Something else went wrong");
            }
        })
    }
    pick (choice) { // Will redirect the menu based on user input
        switch (choice) {
            case 'Add Department':
                this.addDp();
                break;
            case 'Add Role':
                this.addRole();
                break;
            case 'Add Employee':
                this.addE();
                break;
            case 'View All Employees':
                this.viewAllE();
                break;
            case 'View All Roles':
                this.viewAllRD(choice);
                break;
            case 'View All Departments':
                this.viewAllRD(choice);
                break;
            case 'Update Employee Role':
                this.updateR();
                break;
            case 'Remove Employee':
                this.removeE();
                break;
            case 'Remove Department':
                this.removeD();
                break;
            default: 
                console.log(chalk.black.bgCyan("\nExited! See you later!\n"));
                connection.end();
            }
    }
    addDp() { // Adds new department into database
        inquirer.prompt(departmentQ).then(answers => {
            const q = "INSERT INTO department SET ?";
            connection.query(q, {id: answers.id, name: this.capEachWord(answers.name)}, (error, results) => {
                if (error) {
                    throw error;
                } else {
                    console.log(chalk.black.bgCyan(`\nAdded department: ${answers.id} | ${this.capEachWord(answers.name)}\n`));
                    this.start();
                }
            })
        }) 
    }
    addRole() { // Adds new role to database
        const q = "SELECT name from department";
        let a = []; // Array that will hold all department names
        connection.query(q, (error, results) => {
            if (error) {
                throw error;
            } else {
                console.log(chalk.black.bgCyan("\nHere are all of the current departments.\n")); // Displays all departments
                console.table(results);
                for (let i = 0 ; i < results.length ; i++) {
                    a.push(results[i].name);
                }
                inquirer.prompt(roleQ).then(answers => { // If the array has the department the user input, the script will continue the query
                    if(a.includes(this.capEachWord(answers.dep))) {
                        let q1 = "SELECT id from department WHERE name = ?"
                        connection.query(q1, answers.dep, (error, results) => { // Query that grabs the ID number of the department the user inputted
                            if (error) {
                                throw error;
                            } else {
                                let depID = results[0].id;
                                let q2 = "INSERT INTO role SET ?"; // Adding new row to the role table with user input
                                connection.query(q2, [{id: answers.id, title: this.capEachWord(answers.title), salary: answers.salary, department_id: depID}], (error, results) => {
                                    if (error) {
                                        throw error;
                                    } else {
                                        console.log(chalk.black.bgCyan(`\nAdded ${this.capEachWord(answers.title)} to roles!\n`));
                                        this.start();
                                    }
                                })
                            }
                        })
                    } else { // If the array doesn't have the department the user input, the user will be redirected to the menu
                        console.log(chalk.red("\nThere aren't any departments with this name. I'll take you back to the menu.\n"));
                        this.start();
                    }
                })
            }
        })
    }
    addE() { // Adds new employee
        let e = []; // Will hold employee names
        let r = []; // Will hold roles
        inquirer.prompt(employeeQ).then(answers => { // Prompts the user data about new employee
            const q = "SELECT employee.first_name, employee.last_name, role.title, role.id as r_id, employee.id as e_id FROM employee INNER JOIN role ON role.id = employee.role_id;"; 
            connection.query(q, (error, results) => {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0 ; i < results.length ; i++) { // Loop through results and save employee names/roles in arrays
                        e.push(results[i].first_name.concat(` ${results[i].last_name}`));
                        r.push(results[i].title);
                    } 
                    // Validation before query to check if db includes the inputted manager name and role
                    if (answers.manager && e.includes(this.capEachWord(answers.manager)) && (r.includes(this.capEachWord(answers.role)))) {
                        const q = 'INSERT INTO employee SET ?'; // Query will add new employee to the database from user input (with manager)
                        connection.query(q, {first_name: this.capEachWord(answers.name), last_name: this.capEachWord(answers.name2), role_id: this.findID(answers.role, results), manager_id: this.findManagerID(answers.manager, results)}, (error, results) => {
                            if (error) {
                                throw error;
                            } else {
                                console.log(chalk.black.bgCyan(`\nAdded ${this.capEachWord(answers.name)} to the database!\n`));
                                this.start();
                            }
                        })

                    // Validation before query to check if db includes the inputted role
                    } else if (!answers.manager && (r.includes(this.capEachWord(answers.role)))) {
                        const q = 'INSERT INTO employee SET ?'; // Query will add new employee to the database from user input (without manager)
                        connection.query(q, {first_name: this.capEachWord(answers.name), last_name: this.capEachWord(answers.name2), role_id: this.findID(answers.role, results)}, (error, results) => {
                            if (error) {
                                throw error;
                            } else {
                                console.log(chalk.black.bgCyan(`\nAdded ${this.capEachWord(answers.name)} to the database!\n`));
                                this.start();
                            }
                        })

                    // If the values are not found in the database
                    } else {
                        console.log(chalk.red("\nWe couldn't find those values in the database.\n"));
                        this.start();
                    }
                }
            })
        })
    }
    viewAllE() { // Query to view all employees
        const q = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name as department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id";
        connection.query(q, (error, results) => {
            if (error) {
                throw error;
            } else {
                console.table(results);
                this.start();
            }
        })
    }
    viewAllRD(choice) { // Query to view all roles or all departments
        let q;
        if (choice === "View All Roles") {
            q = "SELECT * FROM role";
        } else if (choice === "View All Departments") {
            q = "SELECT * FROM department";
        }
        connection.query(q, (error, results) => {
            if (error) {
                throw error;
            } else {
                console.table(results);
                this.start();
            }
        })
    }
    updateR() { // Updates employee role 
        const q = "SELECT first_name, last_name from employee";
        let a = []; // Holds employee names
        let r = []; // Holds roles
        let name; // Holds the employee name
        connection.query(q, (error, results) => {
            if (error) {
                throw error;
            } else {
                console.log(chalk.black.bgCyan("\nHere are all of the current employees.\n"));
                for (let i = 0 ; i < results.length ; i++) { // Concat and displays all first and last names of employees from db
                    console.log(results[i].first_name.concat(` ${results[i].last_name}`));
                    a.push(results[i].first_name.concat(` ${results[i].last_name}`));
                }
                inquirer.prompt(employeeRole).then(answers => { // Asks the user for employee name
                    if (a.includes(this.capEachWord(answers.name))) { // If the name the user input exists in the array, the script will continue to update role
                        name = answers.name;
                        console.log(chalk.black.bgCyan("\nHere are all of the current roles.\n"));
                        let q = "SELECT title from role";
                        connection.query(q, (error, results) => {
                            if (error) {
                                throw error;
                            } else {
                                console.table(results); // Displays all roles from db
                                for (let i = 0 ; i < results.length ; i++) { 
                                    let data2 = results[i].title;
                                    r.push(data2);
                                }
                                inquirer.prompt(employeeRole2).then(answers => { // Asks the user what role for the employee
                                    if (r.includes(this.capEachWord(answers.role))) { // If the role is found in the db, the employee will be updated
                                        let q2 = "SELECT id from role WHERE title = ?"; 
                                        connection.query(q2, this.capEachWord(answers.role), (error, results) => { // Query will get the ID of the role from the db
                                            if (error) {
                                                throw error;
                                            } else {
                                                let roleID = results[0].id;
                                                let [name1, name2] = name.split(" "); // Destructuring name to insert into query
                                                let q = "UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?"
                                                connection.query(q, [roleID, name1, name2], (error, results) => { // Query will update the new role for the employee
                                                    if (error) {
                                                        throw error;
                                                    } else {
                                                        console.log(chalk.black.bgCyan(`\nUpdated role for ${this.capEachWord(name)}!\n`));
                                                        this.start();
                                                    }
                                                })
                                            }
                                        })
                                    } else { // If the role is not found
                                        console.log(chalk.red("\nRole not found in the database. I'll take you back to the menu.\n")); 
                                        this.start();
                                    } 
                                })
                            }
                        })
                    } else { // If the name was not found in the array, the user will be redirected to the menu
                        console.log(chalk.red("\nEmployee not found. I'll take you back to the menu.\n"));
                        this.start();
                    }
                })
            }
        })
    }
    removeE() { // Removes employee from db
        let a = []; // Holds employee names
        inquirer.prompt(removeEPrompts).then(answers => {
            console.log(answers.name);
            const q = "SELECT first_name, last_name FROM employee;";
            connection.query(q, (error, results) => {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0 ; i < results.length ; i++) {
                        a.push(results[i].first_name.concat(` ${results[i].last_name}`));
                    }
                    if (a.includes(this.capEachWord(answers.name))) { // Checking if database has the name user input
                        let [name1, name2] = answers.name.split(" "); // Destructuring name to insert into query
                        const q1 = 'DELETE FROM employee WHERE first_name = ? AND last_name = ?';
                        connection.query(q1, [name1, name2], (error, results) => { // Query to remove employee
                            if (error) {
                                throw error;
                            } else {
                                console.log(chalk.black.bgCyan(`\nRemoved ${this.capEachWord(answers.name)} from the database!\n`));
                                this.start();
                            }
                        })
                    } else {
                        console.log(chalk.red("\nName is not valid. I'll take you back to the menu.\n"));
                        this.start();
                    }
                }
            })
        })
    }
    removeD() { // Removes department from database
        let a = []; // Holds departments
        const q = "SELECT name from department"
        connection.query(q, (error, results) => { 
            if (error) {
                throw error; 
            } else {
                for (let i = 0 ; i < results.length ; i++) { // Saves all departments into array 
                    a.push(results[i].name);
                }
                const q = "SELECT name from department";
                inquirer.prompt(removeDPrompts).then(answers => {    // Checks if department user input is in db
                if (a.includes(this.capEachWord(answers.name))) {
                    const q1 = "DELETE FROM department WHERE name = ?";
                    connection.query(q1, [this.capEachWord(answers.name)], (error, results) => { // Query will remove the department from the db
                        if (error) {
                            throw error;
                        } else {
                            console.log(chalk.black.bgCyan(`\nRemoved ${this.capEachWord(answers.name)} from the database!\n`));
                            this.start();
                        }
                    })
                } else {
                    console.log(chalk.red("\nName is not valid. I'll take you back to the menu.\n")); // If the department is not found
                    this.start();
                }
                })
            }
        })
    }
    findID(role, results) { // Finds the role ID associated with the role title
        for (let i = 0 ; i < results.length ; i++) {
            if (results[i].title === this.capEachWord(role)) {
                return results[i].r_id;
            } 
        }
    }
    findManagerID(name, results) { // Finds the manager's id for employee if not null 
        for (let i = 0 ; i < results.length ; i++) {
            if (results[i].first_name + " " + results[i].last_name === this.capEachWord(name)) {
                return results[i].e_id;
            } 
        }
    }
    capEachWord(str) { // Capitalizes every first letter in each word in a string + removes whitespace for consistency and comparing values
      return str.trim().split(" ").map(word => {
        return word.substring(0,1).toUpperCase() + word.substring(1)
      }).join(" ")
    }
}


// Connecting to the database and initializing new Application class that will start the app
connection.connect((error) => {
    if(error) {
        throw error;
    } else {
        console.log(chalk.black.bgCyan("\n Welcome to Employee Tracker!\n"));
        const newApp = new Application;
        newApp.start();
    }
})