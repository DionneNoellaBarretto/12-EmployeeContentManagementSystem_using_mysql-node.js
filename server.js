// Node Module / Global Variable & Dependency Declaration
const mysql = require('mysql2'); // https://www.npmjs.com/package/mysql2
const inquirer = require('inquirer');
const chalk = require('chalk');
require('dotenv').config();
require('console.table');
const {options, department, role, employee,employeeName, employeeRole, removeEmp, removeDept, removeRole} = require('./inquirer');


//Providing credentials to the SQL database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

// This class will control the flow of the application
class Application {
    begin() { // Show the menu prompt
        inquirer.prompt(options).then(answers => {
            this.pick(answers.choice);
        }).catch(error => {
            if (error.isTtyError) {
                console.log("ERROR! Invalid Prompt!");
            } else {
                console.log("Oops, Something went wrong!");
            }
        })
    }
    pick (choice) { // Will redirect the menu based on user input
        switch (choice) {
            case 'Add a Department':
                this.addDept();
                break;
            case 'Add a Role':
                this.addRole();
                break;
            case 'Add an Employee':
                this.addEmployee();
                break;
            case 'View All Employees':
                this.viewAllEmployees();
                break;
            case 'View All Roles':
                this.viewAllRolesDepts(choice);
                break;
            case 'View All Departments':
                this.viewAllRolesDepts(choice);
                break;
            case 'Update an Employee Role':
                this.updateRole();
                break;
            case 'Remove a Employee':
                this.removeEmployee();
                break;
            case 'Remove a Department':
                this.removeDept();
                break;
            case 'Remove a Role':
                this.removeRole();
                break;
            default: 
                console.log(chalk.black.bgCyan("\nByeee! You have successfully exited DNB's Employee Content Management System!!\n"));
                connection.end();
            }
    }
    addDept() { // Adds new department into database
        inquirer.prompt(department).then(answers => {
            const q = "INSERT INTO department SET ?";
            connection.query(q, {id: answers.id, name: this.capEachWord(answers.name)}, (error, results) => {
                if (error) {
                    throw error;
                } else {
                    console.log(chalk.black.bgCyan(`\nAdded department: ${answers.id} | ${this.capEachWord(answers.name)}\n`));
                    console.table(results);
                    this.begin();
                }
            })
        }) 
    }
    addRole() { // Adds new role to database
        const q = "SELECT name from department";
        let d = []; // Array that will hold all department names
        connection.query(q, (error, results) => {
            if (error) {
                throw error;
            } else {
                // https://www.npmjs.com/package/chalk
                console.log(chalk.white.bgMagenta("\n Following are existing department names in the database:\n")); // Displays all departments
                console.table(results);
                for (let i = 0 ; i < results.length ; i++) {
                    d.push(results[i].name);
                }
                inquirer.prompt(role).then(answers => { // If the array has the department the user input, the script will continue the query
                    if(d.includes(this.capEachWord(answers.dep))) {
                        let q1 = "SELECT id from department WHERE name = ?"
                        connection.query(q1, answers.dep, (error, results) => { // Query that grabs the ID number of the department the user inputted
                            if (error) {
                                throw error;
                            } else {
                                let deptID = results[0].id;
                                let q2 = "INSERT INTO role SET ?"; // Adding new row to the role table with user input
                                connection.query(q2, [{id: answers.id, title: this.capEachWord(answers.title), salary: answers.salary, department_id: deptID}], (error, results) => {
                                    if (error) {
                                        throw error;
                                    } else {
                                        console.log(chalk.black.bgCyan(`\n\ ${this.capEachWord(answers.title)} role was successfully added!\n`));
                                        console.table(results);
                                        this.begin();
                                    }
                                })
                            }
                        })
                    } else { // If the array doesn't have the department the user input, the user will be redirected to the menu
                        console.log(chalk.white,bgRed("\n Error! no such department exists! Rerouting you to the main menu\n"));
                        this.begin();
                    }
                })
            }
        })
    }
    addEmployee() { // Adds new employee
        let e = []; // Will hold employee names
        let r = []; // Will hold roles
        inquirer.prompt(employee).then(answers => { // Prompts the user data about new employee
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
                        connection.query(q, {first_name: this.capEachWord(answers.name), last_name: this.capEachWord(answers.name2), role_id: this.findRoleID(answers.role, results), manager_id: this.findManagerID(answers.manager, results)}, (error, results) => {
                            if (error) {
                                throw error;
                            } else {
                                console.log(chalk.black.bgCyan(`\n Employee by the name of ${this.capEachWord(answers.name)} ${this.capEachWord(answers.name2)} was successfully added to the database!\n`));
                                console.table(results);
                                this.begin();
                            }
                        })

                    // Validation before query to check if db includes the inputted role
                    } else if (!answers.manager && (r.includes(this.capEachWord(answers.role)))) {
                        const q = 'INSERT INTO employee SET ?'; // Query will add new employee to the database from user input (without manager)
                        connection.query(q, {first_name: this.capEachWord(answers.name), last_name: this.capEachWord(answers.name2), role_id: this.findRoleID(answers.role, results)}, (error, results) => {
                            if (error) {
                                throw error;
                            } else {
                                console.log(chalk.black.bgCyan(`\n${this.capEachWord(answers.name)} ${this.capEachWord(answers.name2)} was added as an employee to the database successfully!\n`));
                                console.table(results);
                                this.begin();
                            }
                        })

                    // If the values are not found in the database
                    } else {
                        console.log(chalk.red("\n Oops! No such record found in the database! Rerouting you to the main menu.\n"));
                        this.begin();
                    }
                }
            })
        })
    }
    viewAllEmployees() { // Query to view all employees
        const q = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name as department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id";
        connection.query(q, (error, results) => {
            if (error) {
                throw error;
            } else {
                console.table(results);
                this.begin();
            }
        })
    }
    viewAllRolesDepts(choice) { // Query to view all roles or all departments
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
                this.begin();
            }
        })
    }
    updateRole() { // Updates employee role 
        const q = "SELECT first_name, last_name from employee";
        let e = []; // Holds employee names
        let r = []; // Holds roles
        let name; // Holds the employee name
        connection.query(q, (error, results) => {
            if (error) {
                throw error;
            } else {
                console.log(chalk.black.bgCyan("\n Current list of employees in DNB Org include:\n"));
                for (let i = 0 ; i < results.length ; i++) { // Concat and displays all first and last names of employees from db
                    console.log(results[i].first_name.concat(` ${results[i].last_name}`));
                    e.push(results[i].first_name.concat(` ${results[i].last_name}`));
                }
                inquirer.prompt(employeeName).then(answers => { // Asks the user for employee name
                    if (e.includes(this.capEachWord(answers.name))) { // If the name the user input exists in the array, the script will continue to update role
                        name = answers.name;
                        console.log(chalk.black.bgCyan("\nCurrent Roles include:\n"));
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
                                inquirer.prompt(employeeRole).then(answers => { // Asks the user what role for the employee
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
                                                        console.log(chalk.black.bgCyan(`\n ${this.capEachWord(name)}'s role has been updated successfully!\n`));
                                                        console.table(results);
                                                        this.begin();
                                                    }
                                                })
                                            }
                                        })
                                    } else { // If the role is not found
                                        console.log(chalk.red("\n Yikes!! No such role fount in the database. Rerouting you to the main menu.\n")); 
                                        this.begin();
                                    } 
                                })
                            }
                        })
                    } else { // If the name was not found in the array, the user will be redirected to the menu
                        console.log(chalk.red("\n Oops! Employee not found. Rerouting you to the main menu.\n"));
                        this.begin();
                    }
                })
            }
        })
    }
    removeEmployee() { // Removes employee from db
        let e = []; // Holds employee names
        inquirer.prompt(removeEmp).then(answers => {
            console.log(answers.name);
            const q = "SELECT first_name, last_name FROM employee;";
            connection.query(q, (error, results) => {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0 ; i < results.length ; i++) {
                        e.push(results[i].first_name.concat(` ${results[i].last_name}`));
                    }
                    if (e.includes(this.capEachWord(answers.name))) { // Checking if database has the name user input
                        let [name1, name2] = answers.name.split(" "); // Destructuring name to insert into query
                        const q1 = 'DELETE FROM employee WHERE first_name = ? AND last_name = ?';
                        connection.query(q1, [name1, name2], (error, results) => { // Query to remove employee
                            if (error) {
                                throw error;
                            } else {
                                console.log(chalk.black.bgCyan(`\n Removed employee ${this.capEachWord(answers.name)} from the database successfully!\n`));
                                console.table(results);
                                this.begin();
                            }
                        })
                    } else {
                        console.log(chalk.red("\n Invalid employee name! Rerouting you to the main menu.\n"));
                        this.begin();
                    }
                }
            })
        })
    }
    removeDept() { // Removes department from database
        let d = []; // Holds departments
        const q = "SELECT name from department"
        connection.query(q, (error, results) => { 
            if (error) {
                throw error; 
            } else {
                for (let i = 0 ; i < results.length ; i++) { // Saves all departments into array 
                    d.push(results[i].name);
                }
                
                inquirer.prompt(removeDept).then(answers => {    // Checks if department user input is in db
                if (d.includes(this.capEachWord(answers.name))) {
                    const q1 = "DELETE FROM department WHERE name = ?";
                    connection.query(q1, [this.capEachWord(answers.name)], (error, results) => { // Query will remove the department from the db
                        if (error) {
                            throw error;
                        } else {
                            console.log(chalk.black.bgCyan(`\n Removed ${this.capEachWord(answers.name)} department from the database!\n`));
                            console.table(results);
                            this.begin();
                        }
                    })
                } else {
                    console.log(chalk.red("\n Dept Name is invalid. Rerouting you to the main menu.\n")); // If the department is not found
                    this.begin();
                }
                })
            }
        })
    }
    removeRole() { // Removes roles from database
        let r = []; // Hold roles 
        const q = "SELECT title from role"
        connection.query(q, (error, results) => { 
            if (error) {
                throw error; 
            } else {
                for (let i = 0 ; i < results.length ; i++) { // Saves all roles into array 
                    r.push(results[i].title);
                }
                
                inquirer.prompt(removeRole).then(answers => {    // Checks if role user input is in db
                if (r.includes(this.capEachWord(answers.title))) {
                    const q1 = "DELETE FROM role WHERE title = ?";
                    connection.query(q1, [this.capEachWord(answers.title)], (error, results) => { // Query will remove the role from the db
                        if (error) {
                            throw error;
                        } else {
                            console.log(chalk.black.bgCyan(`\n Successfully removed ${this.capEachWord(answers.title)} role from the database!\n`));
                            console.table(results);
                            this.begin();
                        }
                    })
                } else {
                    console.log(chalk.red("\n Role Name does not exist. Rerouting you to the main menu.\n")); // If the role is not found
                    this.begin();
                }
                })
            }
        })
    }
    findRoleID(role, results) { // Finds the role ID associated with the role title
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

    capEachWord(str) { // Capitalizes every first letter in each word in a string + removes whitespace for consistency and compare values
      return str.trim().split(" ").map(word => {
        return word.substring(0,1).toUpperCase() + word.substring(1)
      }).join(" ")
    }
}


// Connecting to the database and initializing new Application class that will begin the app
connection.connect((error) => {
    if(error) {
        throw error;
    } else {
        console.log(chalk.black.bgCyan("\n Welcome to DNB Org's Employee Content Management System!\n"));
        const newApp = new Application;
        newApp.begin();
    }
})

// SELECT SUM(salary) AS "Total Salary" FROM role; 👉View the total utilized budget of a department;in other words, the combined salaries of all employees in that department (role)
// SELECT * FROM employee WHERE manager_id IS NOT NULL; 👉View employees by manager
// SELECT * FROM employee JOIN department ON department.id = employee.role_id WHERE role_id IS NOT NULL; 👉View employees by department 