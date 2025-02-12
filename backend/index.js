const express = require('express');
const cors = require('cors');
const csvParser = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const { Parser } = require('json2csv'); // Add json2csv
const app = express();
const port = 5000;
const path = require('path');
const publicPath = path.join(__dirname, './public/dist');

app.use(express.static(publicPath));
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint to handle CSV file upload and assign Secret Santa
app.post('/assign-secret-santa', upload.fields([
    { name: 'employees', maxCount: 1 },
    { name: 'previousAssignments', maxCount: 1 },
]), (req, res) => {
    const employeesFilePath = req.files['employees'][0].path;
    const previousAssignmentsFilePath = req.files['previousAssignments'][0].path;

    // Parse employees CSV
    const employees = [];
    fs.createReadStream(employeesFilePath)
        .pipe(csvParser())
        .on('data', (row) => employees.push(row))
        .on('end', () => {
            // Parse previous assignments CSV
            const previousAssignments = [];
            fs.createReadStream(previousAssignmentsFilePath)
                .pipe(csvParser())
                .on('data', (row) => previousAssignments.push(row))
                .on('end', () => {
                    try {
                        // Logic to assign Secret Santa
                        const assignments = assignSecretSanta(employees, previousAssignments);

                        // Convert assignments to CSV
                        const json2csvParser = new Parser();
                        const csv = json2csvParser.parse(assignments);

                        // Clean up uploaded files
                        fs.unlinkSync(employeesFilePath);
                        fs.unlinkSync(previousAssignmentsFilePath);

                        // Send CSV file as response
                        res.setHeader('Content-Type', 'text/csv');
                        res.setHeader('Content-Disposition', 'attachment; filename=assignments.csv');
                        res.send(csv);
                    } catch (error) {
                        // Clean up uploaded files
                        fs.unlinkSync(employeesFilePath);
                        fs.unlinkSync(previousAssignmentsFilePath);

                        res.status(400).json({ error: error.message });
                    }
                });
        });
});

// Function to assign Secret Santa
function assignSecretSanta(employees, previousAssignments) {
    const assignments = [];
    const availableEmployees = [...employees];

    // Check if there are enough employees to assign secret children
    if (employees.length < 2) {
        throw new Error('Not enough employees to assign secret children.');
    }

    employees.forEach((employee) => {
        let secretChild;

        // Filter out invalid options
        const invalidOptions = [
            employee.Employee_EmailID, // Cannot assign to self
            ...previousAssignments
                .filter((assignment) => assignment.Employee_EmailID === employee.Employee_EmailID)
                .map((assignment) => assignment.Secret_Child_EmailID),
        ];

        const validOptions = availableEmployees.filter(
            (emp) => !invalidOptions.includes(emp.Employee_EmailID)
        );

        if (validOptions.length > 0) {
            // Assign a random valid secret child
            secretChild = validOptions[Math.floor(Math.random() * validOptions.length)];
            availableEmployees.splice(availableEmployees.indexOf(secretChild), 1);
        } else {
            // Fallback: Assign to any available employee (except self)
            secretChild = availableEmployees.find(
                (emp) => emp.Employee_EmailID !== employee.Employee_EmailID
            );

            // If no valid secret child is found, throw an error
            if (!secretChild) {
                throw new Error('Unable to assign a secret child due to constraints.');
            }
        }

        assignments.push({
            Employee_Name: employee.Employee_Name,
            Employee_EmailID: employee.Employee_EmailID,
            Secret_Child_Name: secretChild.Employee_Name,
            Secret_Child_EmailID: secretChild.Employee_EmailID,
        });
    });

    return assignments;
}

app.get('/',(req,res)=>{
    res.sendFile(publicPath + '/index.html');    
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);

    // import('open').then((open) => {
    //     open.default(`http://localhost:${port}`);
    // });
});



module.exports = { assignSecretSanta };
