const { assignSecretSanta } = require('./index'); // Adjust the path to your index.js file

test('assignSecretSanta should handle previous assignments', () => {
    const employees = [
        { Employee_Name: 'Alice', Employee_EmailID: 'alice@acme.com' },
        { Employee_Name: 'Bob', Employee_EmailID: 'bob@acme.com' },
        { Employee_Name: 'Charlie', Employee_EmailID: 'charlie@acme.com' },
    ];
    const previousAssignments = [
        { Employee_EmailID: 'alice@acme.com', Secret_Child_EmailID: 'bob@acme.com' },
    ];
    const assignments = assignSecretSanta(employees, previousAssignments);

    expect(assignments.length).toBe(3);
    expect(assignments[0].Secret_Child_EmailID).not.toBe('bob@acme.com'); // Alice cannot be assigned to Bob again
});

test('assignSecretSanta should throw an error if there are not enough employees', () => {
    const employees = [
        { Employee_Name: 'Alice', Employee_EmailID: 'alice@acme.com' },
    ];
    const previousAssignments = [];
    expect(() => assignSecretSanta(employees, previousAssignments)).toThrow('Not enough employees to assign secret children.');
});