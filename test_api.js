const base = 'https://final-projectt-evjs.onrender.com';

async function run() {
  try {
    const registerRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Test Transfer User', email: `testtransfer${Date.now()}@example.com`, password: 'Password123!' })
    });
    const registerText = await registerRes.text();
    console.log('REGISTER', registerRes.status, registerText);
    if (registerRes.status !== 201) return;

    const regData = JSON.parse(registerText);
    const depositRes = await fetch(`${base}/api/transactions/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${regData.token}` },
      body: JSON.stringify({ amount: 10 })
    });
    console.log('DEPOSIT', depositRes.status, await depositRes.text());

    const registerRes2 = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Recipient User', email: `recipient${Date.now()}@example.com`, password: 'Password123!' })
    });
    const registerText2 = await registerRes2.text();
    console.log('REGISTER2', registerRes2.status, registerText2);
    if (registerRes2.status !== 201) return;

    const regData2 = JSON.parse(registerText2);
    const transferRes = await fetch(`${base}/api/transactions/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${regData.token}` },
      body: JSON.stringify({ recipientAccountNumber: regData2.user.accountNumber, amount: 5 })
    });
    console.log('TRANSFER', transferRes.status, await transferRes.text());
  } catch (error) {
    console.error(error);
  }
}

run();
