import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const EmployeeDirectory = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('hr/employees/');
            setEmployees(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Directory...</div>;

    const styles = {
        container: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
        card: { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f8fafc', padding: '15px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', borderBottom: '2px solid #e2e8f0' },
        td: { padding: '15px', borderBottom: '1px solid #e2e8f0', color: 'var(--text-primary)' },
        badge: (status) => ({
            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
            background: status === 'ACTIVE' ? '#d1fae5' : status === 'ON_LEAVE' ? '#fef08a' : '#fee2e2',
            color: status === 'ACTIVE' ? '#065f46' : status === 'ON_LEAVE' ? '#854d0e' : '#991b1b'
        })
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <h2 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Employee Directory</h2>
            
            <div style={styles.card}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Designation</th>
                            <th style={styles.th}>Department</th>
                            <th style={styles.th}>Joined</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} className="hover-bg">
                                <td style={{ ...styles.td, fontWeight: '600' }}>
                                    {emp.user_details ? emp.user_details.name : 'Unknown User'}
                                </td>
                                <td style={styles.td}>
                                    {emp.user_details ? emp.user_details.email : '-'}
                                </td>
                                <td style={styles.td}>{emp.designation}</td>
                                <td style={styles.td}>{emp.department}</td>
                                <td style={styles.td}>{emp.date_of_joining}</td>
                                <td style={styles.td}>
                                    <span style={styles.badge(emp.status)}>{emp.status.replace('_', ' ')}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {employees.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                        No employment records configured in the API yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDirectory;
