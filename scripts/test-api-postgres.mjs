const baseUrl = 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, options);
  const text = await res.text();
  console.log(`\n=== ${options.method || 'GET'} ${path} -> ${res.status}`);
  console.log(text);
  return { res, text };
}

async function main() {
  const timestamp = Date.now();
  const email = `test+${timestamp}@example.com`;
  const title = `Test post ${timestamp}`;

  await request('/');

  const userBody = JSON.stringify({
    name: 'Test User',
    email,
    phone: '0123456789',
  });
  const userCreate = await request('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: userBody,
  });

  const createdUser = JSON.parse(userCreate.text || '{}');
  if (!createdUser.id) {
    throw new Error('User creation failed');
  }

  await request('/users');
  await request(`/users/${createdUser.id}`);

  const postBody = JSON.stringify({
    title,
    content: 'This is a test post created by script.',
    authorId: createdUser.id,
  });
  await request('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: postBody,
  });

  await request('/posts');
}

main().catch((error) => {
  console.error('ERROR:', error.message || error);
  process.exit(1);
});
