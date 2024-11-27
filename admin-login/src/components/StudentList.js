// src/components/StudentList.js
import React from 'react';
import PropTypes from 'prop-types';

const StudentList = ({ students, onStudentClick }) => {
    return (
        <div style={{ width: '250px', borderRight: '1px solid #ccc', paddingRight: '20px' }}>
            <h3>Student List</h3>
            <ul>
                {students.length > 0 ? (
                    students.map(student => (
                        <li 
                            key={student._id} 
                            onClick={() => onStudentClick(student.studId)}
                            style={{ cursor: 'pointer', color: 'blue' }}
                        >
                            {student.studName} - {student.studId}
                        </li>
                    ))
                ) : (
                    <li>No students found</li>
                )}
            </ul>
        </div>
    );
};

StudentList.propTypes = {
    students: PropTypes.array.isRequired,
    onStudentClick: PropTypes.func.isRequired,
};

export default StudentList;
