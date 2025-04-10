import fetch from 'node-fetch';

const resetPassword = async () => {
  try {
    const response = await fetch('https://foodfusion-backend-lfj9.onrender.com/api/user/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'tirumalareddysai136@gmail.com',
        newPassword: 'test123'
      }),
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

resetPassword(); 