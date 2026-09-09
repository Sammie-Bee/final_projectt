(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Automated Test', email: 'auto+test@example.com', password: 'Test1234!' })
    });

    console.log('status', res.status);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      console.log(JSON.stringify(json, null, 2));
    } else {
      const text = await res.text();
      console.log(text);
    }
  } catch (err) {
    console.error('error', err.message);
  }
})();
