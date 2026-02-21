import axios from 'axios';

const test = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/requests?status=Approved,Completed,Sent to Audit');
        console.log('--- TEST RESULTS ---');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('Test failed:', err.message);
    }
};

test();
