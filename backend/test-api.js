// Simple test script to verify API endpoints
const testAPI = async () => {
    const baseURL = 'http://localhost:5000/api';

    try {
        // Test basic connectivity
        console.log('Testing API connectivity...');
        const testResponse = await fetch(`${baseURL}/test`);
        const testData = await testResponse.json();
        console.log('✅ API connectivity:', testData);

        // Test notes endpoint
        console.log('\nTesting notes endpoint...');
        const notesResponse = await fetch(`${baseURL}/notes`);
        if (notesResponse.ok) {
            const notesData = await notesResponse.json();
            console.log('✅ Notes endpoint working');
            console.log('Notes count:', notesData?.data?.notes?.length || 0);

            if (notesData?.data?.notes?.length > 0) {
                const firstNote = notesData.data.notes[0];
                console.log('\nFirst note details:');
                console.log('- ID:', firstNote._id);
                console.log('- Title:', firstNote.title);
                console.log('- FileName:', firstNote.fileName);
                console.log('- FileURL:', firstNote.fileURL);
                console.log('- LocalFileName:', firstNote.localFileName);
            }
        } else {
            console.log('❌ Notes endpoint failed:', notesResponse.status);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testAPI();