// Global Variable Declaration
let managers = [];
let roles = [];
let dept = [];
let empIDs = [];
let empFN = [];
let managerID = [];
let roleID = [];
// Node Module / Dependency Declaration
const mysql = require('mysql2'); // https://www.npmjs.com/package/mysql2
const inquirer = require('inquirer');
const chalk = require('chalk'); //for colorful console.log messages
require('dotenv').config();
require('console.table');
// constructors
const role = require('./constructor/role');
const department = require('./constructor/department');
const employee = require('./constructor/employee');

// inline db connection.. could have put this in a separate config folder/file as well
const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'mysql123',
	database: 'dnb_empDB',
});


//*Starter Menu Qns presented by inquirer
const menuOptions = [{
	type: 'list',
	message: 'Using your up/down arrow key select an operation to perform',
	name: 'choices',
	choices: [
		'Add Employee',
		'Add Role',
		'Add Department',
		'Remove Employee',
		'Remove Role',
		'Remove Department',
		'Update Employee Role',
		'Update Employee Manager',
		'View All Employees',
		'View All Roles',
		'View All Departments',
		'View All Employees By Manager',
		'View All Employees By Department',
		'View Total Utilized Budget by Department',
		'Exit',
	],
}];

//* function to start the program, prints app header and has intro inquirer prompt
function begin() {
	console.log(chalk.black.bgCyan("\n Welcome to DNB Org's Employee Content Management System!\n"));
	inquirer.prompt(menuOptions).then(function (data) {
		const Choice = data.choices;
		if (Choice === 'View All Employees') {
			viewAllEmps();
		} else if (Choice === 'View All Departments') {
			viewAllDepts();
		} else if (Choice === 'View All Roles') {
			viewAllRoles();
		} else if (Choice === 'View All Employees By Department') {
			viewAllEmpsByDept();
		} else if (Choice === 'View All Employees By Manager') {
			viewAllEmpsByMgr();
		} else if (Choice === 'View Total Utilized Budget by Department') {
			viewBudget();
		} else if (Choice === 'Add Employee') {
			addEmp();
		} else if (Choice === 'Add Role') {
			addRole();
		} else if (Choice === 'Add Department') {
			addDept();
		} else if (Choice === 'Update Employee Role') {
			updateEmpRole();
		} else if (Choice === 'Update Employee Manager') {
			updateEmpMgr();
		} else if (Choice === 'Remove Employee') {
			removeEmp();
		} else if (Choice === 'Remove Role') {
			removeRole();
		} else if (Choice === 'Remove Department') {
			removeDept();
		} else {
			exit();
		}
	});
}


function reRun() {
	inquirer
		.prompt({
			name: 'rerun',
			type: 'list',
			message: 'Want to return to the Main Menu or Exit?',
			choices: ['Return To Main Menu', 'Exit'],
		})
		.then(function (data) {
			const reRunQ = data.rerun;
			if (reRunQ === 'Return To Main Menu') {
				begin();
			} else {
				exit();
			}
		});
}

//* Builds array for Manager Names
function createManagers() {
	const query = `
    SELECT DISTINCT x.id, CONCAT(x.first_name, " ", x.last_name) 
    AS manager_name 
    FROM employee e 
    INNER JOIN employee x 
    ON e.manager_id = x.id`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			managers.push(res[i].manager_name);
		}
		managers.push('null'); //Adds Null At the end of the array since not all new employees have managers
	});
}

//* Builds array for Job Title Names
function createRoles() {
	const query = `
    SELECT id, title 
    FROM role;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			roles.push(res[i].title);
		}
	});
}

//* Builds array for Job Title Names
function createDepts() {
	const query = `
    SELECT id, name 
    FROM department;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			dept.push(res[i].name);
		}
	});
}

function createEmpID() {
	const query = `
    SELECT id
    FROM employee;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			empIDs.push(res[i].id);
		}
	});
}

function createEmpFN() {
	const query = `
    SELECT first_name
    FROM employee;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			empFN.push(res[i].first_name);
		}
	});
}

function ManagerWithID() {
	const query = `
    SELECT DISTINCT CONCAT(x.first_name, " ", x.last_name) AS manager_name, x.id AS manager_id 
    FROM employee e
    LEFT JOIN employee x
    ON e.manager_id = x.id`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			managerID.push(res[i]);
		}

	});
}

function RoleWithID() {
	const query = `
    SELECT id, title 
    FROM role;`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		for (let i = 0; i < res.length; i++) {
			roleID.push(res[i]);
		}
	});
}

//* Function to view everything in DB
function viewAllEmps() {
	//
	const query = `
    SELECT e.id AS employee_id, e.first_name, e.last_name, d.name AS department_name, r.title AS job_title, r.salary, CONCAT(x.first_name, " ", x.last_name) AS manager_name 
    FROM employee e
    LEFT JOIN role r
    ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    LEFT JOIN employee x
    ON e.manager_id = x.id`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		//Adds space between the console table
		console.log(`
		
		`);
		console.table(res);

		reRun();
	});
}

function viewAllEmpsByDept() {
	//
	const query = 'SELECT name FROM department';
	connection.query(query, function (err, res) {
		if (err) throw err;
		inquirer
			.prompt({
				name: 'deptChoice',
				type: 'list',
				message: 'Choose a Department of whose  Employees you would like to view: ',
				choices: dept,
			})
			.then(function (answer) {
				const query2 = `
                    SELECT e.id AS employee_id, e.first_name, e.last_name, d.name AS department_name, r.title AS job_title, r.salary, CONCAT(x.first_name, " ", x.last_name) AS manager_name 
                    FROM employee e
                    LEFT JOIN role r
                    ON e.role_id = r.id
                    LEFT JOIN department d
                    ON d.id = r.department_id
                    LEFT JOIN employee x
                    ON e.manager_id = x.id
                    WHERE name = ?`;
				connection.query(query2, [answer.deptChoice], function (err, res) {
					if (err) throw err;
					//Adds space between the console table
					console.log(`	`);
					console.table(res);
					reRun();
				});
			});
	});
}

//* View All Employees By Manager

function viewAllEmpsByMgr() {
	//SELECT * FROM employee WHERE manager_id IS NOT NULL;
	const query = `
    SELECT DISTINCT CONCAT(x.first_name, " ", x.last_name) AS manager_name 
    FROM employee e
    INNER JOIN employee x
    ON e.manager_id = x.id
    `;
	connection.query(query, function (err, res) {
		if (err) throw err;
		inquirer
			.prompt({
				name: 'managerChoices',
				type: 'list',
				message: 'Choose a Manager whose Employees you would like to view',
				choices: managers,
			})
			.then(function (answer) {
				const query2 = `
                    SELECT e.id AS employee_id, e.first_name, e.last_name, d.name AS department_name, r.title AS job_title, r.salary, CONCAT(x.first_name, " ", x.last_name) AS manager_name 
                    FROM employee e
                    LEFT JOIN role r
                    ON e.role_id = r.id
                    LEFT JOIN department d
                    ON d.id = r.department_id
                    LEFT JOIN employee x
                    ON e.manager_id = x.id
                    HAVING manager_name = ?`;
				connection.query(query2, [answer.managerChoices], function (err, res) {
					if (err) throw err;
					//Adds space between the console table
					console.log(`	`);
					console.table(res);
					reRun();
				});
			});
	});
}

//* Add Employee
function addEmp() {
	inquirer
		.prompt([{
				name: 'first_name',
				type: 'input',
				message: 'Enter a valid First Name for the new Employee:',
				validate: function (valLet) {
					letters = /^[A-Za-z]+$/.test(valLet);
					if (letters) {
						return true;
					} else {
						console.log(
							chalk.redBright(`Invalid Submission. Please Choose a valid letter from A-Z or a-z! You may delete your invalid submission and resubmit a new entry!`)
						);
						return false;
					}
				},
			},
			{
				name: 'last_name',
				type: 'input',
				message: 'Enter a valid Last Name for the new Employee:',
				validate: function (valLet) {
					letters = /^[A-Za-z]+$/.test(valLet);
					if (letters) {
						return true;
					} else {
						console.log(
							chalk.redBright(`Invalid Submission. Please Choose a valid letter from A-Z or a-z! You may delete your invalid submission and resubmit a new entry!`)
						);
						return false;
					}
				},
			},
			{
				name: 'role',
				type: 'list',
				message: 'Enter a valid role/job title for the new Employee from the existing list of entries:',
				choices: roles,
			},
			{
				name: 'manager',
				type: 'list',
				message: 'Enter a Manager for the new Employee from the existing list of entries:',
				choices: managers,
			},
		])
		.then(function (answer) {

			let employeeFirstName = answer.first_name;
			let employeeLastName = answer.last_name;

			//*Loop through Role Array to find matching id
			function FindRoleID() {
				for (let p = 0; p < roleID.length; p++) {
					if (roleID[p].title === answer.role) {
						return roleID[p].id;
					}
				}
			}
			//*Loop through Manager Array to find matching id
			function FindManagerID() {
				for (let q = 0; q < managerID.length; q++) {
					if (managerID[q].manager_name === answer.manager) {
						return managerID[q].manager_id;
					}
				}
			}
			let employeeRole = FindRoleID();
			let employeeManager = FindManagerID();

			console.log(
				chalk.greenBright(`-------------------------------------------------------------------------------------------------
			Successfully added New Employee -  ${employeeFirstName} ${employeeLastName} to Database!
			-------------------------------------------------------------------------------------------------`)
			);
			let addnewEmployee = new employee(employeeFirstName, employeeLastName, employeeRole, employeeManager);
			connection.query('INSERT INTO employee SET ?', addnewEmployee, function (err, res) {
				if (err) throw err;
			});
			reRun();
		});
}

//*Remove Employee
function removeEmp() {
	inquirer
		.prompt([{
			name: 'first_name',
			type: 'list',
			message: 'Enter the First Name of the Employee you want to remove:',
			choices: empFN,
		}, ])
		.then(function (answer) {
			const query = `
			SELECT last_name 
    		FROM employee
   			WHERE first_name = ?`;

			connection.query(query, [answer.first_name], function (err, res) {
				let firstNameRemove = answer.first_name;
				inquirer
					.prompt([{
						name: 'last_name',
						type: 'list',
						message: 'Enter the Last Name of the Employee you want to remove:',
						choices: function () {
							let lastNameArray = [];
							for (let i = 0; i < res.length; i++) {
								lastNameArray.push(res[i].last_name);
							}
							return lastNameArray;
						},
					}, ])
					.then(function (answer) {
						const query = `
						SELECT id 
    					FROM employee
   						WHERE first_name = ? AND last_name = ?`;

						connection.query(query, [firstNameRemove, answer.last_name], function (err, res) {
							let lastNameRemove = answer.last_name;
							inquirer
								.prompt([{
									name: 'id',
									type: 'list',
									message: 'Enter the Employee ID of the Employee you want to remove:',
									choices: function () {
										let empID = [];
										for (let m = 0; m < res.length; m++) {
											empID.push(res[m].id);
										}
										return empID;
									},
								}, ])
								.then(function (answer) {
									let employeeIDRemove = answer.id;
									console.log(chalk.yellowBright(`-------------------------------------------------------------------------------------------------
			The Employee to be removed you entered is: First Name ${firstNameRemove} | Last Name ${lastNameRemove} | Employee ID ${employeeIDRemove}
			-------------------------------------------------------------------------------------------------`));
									inquirer
										.prompt([{
											name: 'ensureRemove',
											type: 'list',
											message: `Please confirm removal of employee: ${firstNameRemove} ${lastNameRemove}, ID#: ${employeeIDRemove} by choosing YES or NO. (All records for this employee will be purged!)`,
											choices: ['YES', 'NO'],
										}, ])
										.then(function (answer) {
											if (answer.ensureRemove === 'YES') {
												console.log(chalk.redBright(`-------------------------------------------------------------------------------------------------
			Employee: ${firstNameRemove} ${lastNameRemove}, ID#: ${employeeIDRemove} has been successfully removed from DNB Org''s Employee Content Management System!
			-------------------------------------------------------------------------------------------------`));
												//* SQL command to remove user
												connection.query(
													'DELETE FROM employee WHERE first_name = ? AND last_name = ? AND id = ?',
													[firstNameRemove, lastNameRemove, employeeIDRemove],

													function (err, res) {
														if (err) throw err;
														reRun();
													}
												);
											} else {
												console.log(chalk.blueBright(`-------------------------------------------------------------------------------------------------
			Your action to removal employee ${firstNameRemove} ${lastNameRemove}, ID#: ${employeeIDRemove} has been aborted!
			-------------------------------------------------------------------------------------------------`));
												//*If No, Calls ReRun function to Ask if They Want to Leave The Program or Go To Main Menu
												reRun();
											}
										});

									//
								});
						});
					});
			});
		});
}

//*Update Employee Role
function updateEmpRole() {
	inquirer
		.prompt([{
			name: 'first_name',
			type: 'list',
			message: 'Which Employees role would you like to update?',
			choices: empFN,
		}, ])
		.then(function (answer) {
			const query = `
			SELECT last_name 
    		FROM employee
   			WHERE first_name = ?`;

			connection.query(query, [answer.first_name], function (err, res) {
				let firstNameRoleUpdate = answer.first_name;
				inquirer
					.prompt([{
						name: 'last_name',
						type: 'list',
						message: 'Enter the Last Name of the Employee whose role you want to update:',
						choices: function () {
							let lastNameArray = [];
							for (let i = 0; i < res.length; i++) {
								lastNameArray.push(res[i].last_name);
							}
							return lastNameArray;
						},
					}, ])
					.then(function (answer) {
						let lastNameRoleUpdate = answer.last_name;
						const query = `
						SELECT id 
    					FROM employee
   						WHERE first_name = ? AND last_name = ?`;

						connection.query(query, [firstNameRoleUpdate, lastNameRoleUpdate], function (err, res) {
							inquirer
								.prompt([{
									name: 'id',
									type: 'list',
									message: 'Enter the Employee ID of the Employee whose role you want to update:',
									choices: function () {
										let empID = [];
										for (let m = 0; m < res.length; m++) {
											empID.push(res[m].id);
										}
										return empID;
									},
								}, ])
								.then(function (answer) {
									let employeeIDRoleUpdate = answer.id;
									inquirer
										.prompt([{
											name: 'role_title',
											type: 'list',
											message: 'Enter a new role for the Employee from the allowed list of existing roles at DNB Org:',
											choices: roles,
										}, ])
										.then(function (answer) {
											let newTitleRoleUpdate = answer.role_title;

											function FindNewRoleID() {
												for (let q = 0; q < roleID.length; q++) {
													if (roleID[q].title === answer.role_title) {
														return roleID[q].id;
													}
												}
											}

											let updateRoleID = FindNewRoleID();

											console.log(chalk.yellowBright(`-------------------------------------------------------------------------------------------------
			The New Role Title: ${newTitleRoleUpdate} for Employee
			First Name: ${firstNameRoleUpdate} | Last Name: ${lastNameRoleUpdate} has been successfully updated!
			-------------------------------------------------------------------------------------------------`));
											inquirer
												.prompt([{
													name: 'ensureRemove',
													type: 'list',
													message: `Please confirm you would like to update the New Role Title of : ${newTitleRoleUpdate} for Employee: ${firstNameRoleUpdate} ${lastNameRoleUpdate}? Choose  Yes or No`,
													choices: ['YES', 'NO'],
												}, ])
												.then(function (answer) {
													if (answer.ensureRemove === 'YES') {
														//
														console.log(chalk.greenBright(`
			-------------------------------------------------------------------------------------------------
			Employee: ${firstNameRoleUpdate} ${lastNameRoleUpdate}'s new role title: ${newTitleRoleUpdate} has been successfully updated at DNB Org!
			-------------------------------------------------------------------------------------------------`));
														//* SQL command to remove user
														connection.query(
															'UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ? AND id = ?',
															[updateRoleID, firstNameRoleUpdate, lastNameRoleUpdate, employeeIDRoleUpdate],

															function (err, res) {
																if (err) throw err;

																console.log(chalk.cyanBright(`------------------------------------------------------------------------------------------------- Don't Forget To update the manager for Employee: ${firstNameRoleUpdate} ${lastNameRoleUpdate}
			-------------------------------------------------------------------------------------------------`));
																reRun();
															}
														);
													} else {
														console.log(chalk.redBright(`-------------------------------------------------------------------------------------------------
			You have chosen to abort an update to Employee ${firstNameRoleUpdate} ${lastNameRoleUpdate}'s role!
			-------------------------------------------------------------------------------------------------`));
														//*If No, Calls ReRun function to Ask if They Want to Leave The Program or Go To Main Menu
														reRun();
													}
												});
											//
										});
								});
						});
					});
			});
		});
}

//*Update Employee Manager
function updateEmpMgr() {
	//
	inquirer
		.prompt([{
			name: 'first_name',
			type: 'list',
			message: 'Enter the First Name of the Employee whose manager you want to update:',
			choices: empFN,
		}, ])
		.then(function (answer) {
			const query = `
			SELECT last_name 
    		FROM employee
   			WHERE first_name = ?`;

			connection.query(query, [answer.first_name], function (err, res) {
				let firstNameManagerUpdate = answer.first_name;
				inquirer
					.prompt([{
						name: 'last_name',
						type: 'list',
						message: 'Enter the Last Name of the Employee whose manager you want to update:',
						choices: function () {
							let lastNameArray = [];
							for (let i = 0; i < res.length; i++) {
								lastNameArray.push(res[i].last_name);
							}
							return lastNameArray;
						},
					}, ])
					.then(function (answer) {
						let lastNameManagerUpdate = answer.last_name;
						const query = `
						SELECT id 
    					FROM employee
   						WHERE first_name = ? AND last_name = ?`;

						connection.query(query, [firstNameManagerUpdate, lastNameManagerUpdate], function (err, res) {
							inquirer
								.prompt([{
									name: 'id',
									type: 'list',
									message: 'Enter the Employee ID of the Employee whose manager you want to update:',
									choices: function () {
										let empID = [];
										for (let m = 0; m < res.length; m++) {
											empID.push(res[m].id);
										}
										return empID;
									},
								}, ])
								.then(function (answer) {
									let employeeIDManagerUpdate = answer.id;
									inquirer
										.prompt([{
											name: 'manager_name',
											type: 'list',
											message: 'Choose a new Manager from the existing list of Managers for the employee',
											choices: managers,
										}, ])
										.then(function (answer) {
											let newManagerUpdate = answer.manager_name || null;

											function FindNewManagerID() {
												for (let q = 0; q < managerID.length; q++) {
													if (managerID[q].manager_name === answer.manager_name) {
														return managerID[q].manager_id;
													}
												}
											}

											let updateManagerID = FindNewManagerID();

											console.log(chalk.yellowBright(`-------------------------------------------------------------------------------------------------
			Employee ${firstNameManagerUpdate} ${lastNameManagerUpdate}'s new manager ${newManagerUpdate} has been successfully updated in DNB Org's records!
			-------------------------------------------------------------------------------------------------`));
											inquirer
												.prompt([{
													name: 'ensureRemove',
													type: 'list',
													message: `Please confirm the Employee : ${firstNameManagerUpdate} ${lastNameManagerUpdate}'s New Manager name is: ${newManagerUpdate} by selecting Yes or No`,
													choices: ['YES', 'NO'],
												}, ])
												.then(function (answer) {
													if (answer.ensureRemove === 'YES') {
														//
														console.log(chalk.greenBright(`-------------------------------------------------------------------------------------------------
			Employee: ${firstNameManagerUpdate} ${lastNameManagerUpdate}'s New Manager is now: ${newManagerUpdate} 
			-------------------------------------------------------------------------------------------------`));
														//* SQL command to update user
														connection.query(
															'UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name = ? AND id = ?',
															[updateManagerID, firstNameManagerUpdate, lastNameManagerUpdate, employeeIDManagerUpdate],

															function (err, res) {
																if (err) throw err;

																console.log(chalk.cyanBright(`-------------------------------------------------------------------------------------------------
			Don't forget to update Employee: ${firstNameManagerUpdate} ${lastNameManagerUpdate}'s role given the new Manager update.
			-------------------------------------------------------------------------------------------------`));

																reRun();
															}
														);
													} else {
														console.log(chalk.blueBright(`-------------------------------------------------------------------------------------------------
			You have chosen to abort an update to Employee ${firstNameRoleUpdate} ${lastNameRoleUpdate}'s manager field!
			-------------------------------------------------------------------------------------------------`));
														//*If No, Calls ReRun function to Ask if They Want to Leave The Program or Go To Main Menu
														reRun();
													}
												});
											//
										});
								});
						});
					});
			});
		});
}

//*View All Roles
function viewAllRoles() {
	//
	const query = `
    SELECT * FROM role`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		console.table(res);

		reRun();
	});
}

//*Add Role
function addRole() {
	inquirer
		.prompt([{
				name: 'newRole',
				type: 'input',
				message: 'Enter a new role job title:',
			},
			{
				name: 'newRoleSalary',
				type: 'number',
				message: 'Enter a new salary for this new role',
			},
		])
		.then(function (answer) {
			//*Need to add role name and then find length of role array to add ID #
			let newRoleName = answer.newRole;
			let newRoleSalary = answer.newRoleSalary;
			let newRoleID = roles.length + 1;

			//* Take information and build new role constructor
			console.log(chalk.greenBright(`-------------------------------------------------------------------------------------------------
			Successfully added new role with a title of: ${newRoleName} & a role salary of ${newRoleSalary} corresponding to Role ID ${newRoleID}!
			-------------------------------------------------------------------------------------------------`));
			let addNewRole = new role(newRoleName, newRoleSalary, newRoleID);
			connection.query('INSERT INTO role SET ?', addNewRole, function (err, res) {
				if (err) throw err;
			});
			reRun();
		});
}

//*Remove Role
function removeRole() {
	//
	inquirer
		.prompt([{
			name: 'removeRole',
			type: 'list',
			message: 'What Role Do You Want To Remove?',
			choices: roles,
		}, ])
		.then(function (answer) {
			connection.query('DELETE FROM role WHERE title = ?', [answer.removeRole], function (err, res) {
				if (err) throw err;
				console.log(chalk.greenBright(`-------------------------------------------------------------------------------------------------
			The role: ${answer.removeRole} was successfully removed from DNB Org DB!
			-------------------------------------------------------------------------------------------------`));
			});
			reRun();
		});
}

//*View All Departments
function viewAllDepts() {
	const query = `
    SELECT * FROM department`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		console.table(res);

		reRun();
	});
}

//*Add Department
function addDept() {
	inquirer
		.prompt([{
			name: 'newDept',
			type: 'input',
			message: 'Enter a new name for this Department?',
		}, ])
		.then(function (answer) {
			//*Need to add role name and then find length of role array to add ID #
			let newDeptName = answer.newDept;
			let newDeptID = dept.length + 1;

			//* Take information and build new role constructor
			console.log(chalk.greenBright(`-------------------------------------------------------------------------------------------------
			Successfully added New Department with a Department Name: ${newDeptName} & a corresponding Department ID of : ${newDeptID}!
			-------------------------------------------------------------------------------------------------`));
			let addNewDept = new department(newDeptName, newDeptID);
			connection.query('INSERT INTO department SET ?', addNewDept, function (err, res) {
				if (err) throw err;
			});
			reRun();
		});
}

//*Remove Department
function removeDept() {
	//
	inquirer
		.prompt([{
			name: 'removeDept',
			type: 'list',
			message: 'Enter the name of the Department you would like to purge',
			choices: dept,
		}, ])
		.then(function (answer) {
			connection.query('DELETE FROM department WHERE name = ?', [answer.removeDept], function (err, res) {
				if (err) throw err;
				console.log(chalk.greenBright(`-------------------------------------------------------------------------------------------------
			Department by the name of ${answer.removeDept} has been successfully removed from the DB
			-------------------------------------------------------------------------------------------------`));
			});
			reRun();
		});
}

function viewBudget() {
	inquirer
		.prompt({
			name: 'deptChoice',
			type: 'list',
			message: 'Choose a Department whose Utilization Budget you would like to view:',
			choices: dept,
		})
		.then(function (answer) {
			const query = `
			SELECT d.name AS Department_Name,SUM(salary) AS "Total Salary"
            FROM employee e
            LEFT JOIN role r
            ON e.role_id = r.id
            LEFT JOIN department d
            ON d.id = r.department_id
            GROUP BY d.name
            HAVING d.name = ?`;
			connection.query(query, [answer.deptChoice], function (err, res) {
				if (err) throw err;
				//Adds space between the console table
				console.log(`	`);
				console.table(res);
				reRun();
			});
		});
}

//*Exit 
function exit() {
	console.log(chalk.black.bgCyan("\n Bye! You have successfully exited DNB's Employee Content Management System!!\n"));

	connection.end();
}

// catch all errors
connection.connect(function (err) {
	if (err) throw err;
	begin();
	createManagers();
	createRoles();
	createDepts();
	createEmpID();
	createEmpFN();
	ManagerWithID();
	RoleWithID();
});