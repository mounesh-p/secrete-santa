import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [employeesFile, setEmployeesFile] = useState(null);
    const [previousAssignmentsFile, setPreviousAssignmentsFile] = useState(null);
    
    const handleFileUpload = (e, setFile) => {
        const file = e.target.files[0];
        setFile(file);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('employees', employeesFile);
        formData.append('previousAssignments', previousAssignmentsFile);

        try {
            const response = await axios.post('http://localhost:5000/assign-secret-santa', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'blob', // Important for file download
            });

            // Create a download link for the CSV file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'assignments.csv'); // File name
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error assigning Secret Santa:', error);
            alert(error.response?.data?.error || 'An error occurred while assigning Secret Santa.');
        }
    };

    return (
        <div>
            <h1>Secret Santa Assignment</h1>
            <div>
                <label>Upload Employees CSV:</label>
                <input type="file" onChange={(e) => handleFileUpload(e, setEmployeesFile)} />
            </div>
            <div>
                <label>Upload Previous Assignments CSV:</label>
                <input type="file" onChange={(e) => handleFileUpload(e, setPreviousAssignmentsFile)} />
            </div>
            <br />
            <button onClick={handleSubmit}>Assign Secret Santa</button>
            
            {/* {assignments && assignments.length > 0 && (
                <div>
                    <h2>Assignments:</h2>
                    <ul>
                        {assignments?.map((assignment, index) => (
                            <li key={index}>
                                {assignment?.Employee_Name} ({assignment?.Employee_EmailID}) → {assignment?.Secret_Child_Name} ({assignment?.Secret_Child_EmailID})
                            </li>
                        ))}
                    </ul>
                </div>
            )} */}
        </div>
    );
};

export default FileUpload;