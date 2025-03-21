import React, { useEffect, useState } from 'react';
import { getAllSubscribeAPI } from '../../api/api';

const PromotionalMails = () => {
    const [subscribedUsers, setSubscribedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                const response = await getAllSubscribeAPI();
                setSubscribedUsers(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching subscribers:', error);
                setError('Failed to load subscribers');
                setIsLoading(false);
            }
        };
        fetchSubscribers();
    }, []);

    const downloadCSV = () => {
        // Create CSV headers
        const headers = ['Sr No,Email\n'];
        
        // Create CSV content
        const csvContent = subscribedUsers.map((user, index) => 
            `${index + 1},${user.email}`
        ).join('\n');

        // Combine headers and content
        const fullContent = headers + csvContent;

        // Create blob and download link
        const blob = new Blob([fullContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'subscribers.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    if (isLoading) {
        return <div className="container bg-white p-4">Loading...</div>;
    }

    if (error) {
        return <div className="container bg-white p-4 text-danger">No subscribes are available</div>;
    }

    return (
        <div className="container bg-white p-4">
        <div className="container1">
            <h1 className="mb-4">Subscriber</h1>
            <button 
                        className="btn btn-primary mb-4"
                        onClick={downloadCSV}
                        disabled={subscribedUsers.length === 0}
                    >
                        Download CSV
                    </button>
            <table className="table table-hover table-bordered">
                <thead className="thead-light">
                    <tr>
                        <th scope="col" className="border">Sr No</th>
                        <th scope="col" className="border">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {subscribedUsers.map((user, index) => (
                        <tr key={user._id}>
                            <td className="border">{index + 1}</td>
                            <td className="border">{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {subscribedUsers.length === 0 && (
                <p className="text-center">No subscribers found</p>
            )}
        </div>
    </div>
    );
};

export default PromotionalMails;

