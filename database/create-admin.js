// Script to create admin user with hashed password
import bcrypt from 'bcryptjs';

const password = 'admin123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Admin username: admin');
console.log('Admin password: admin123');
console.log('Hashed password:', hashedPassword);
console.log('\nSQL to insert/update admin user:');
console.log(`UPDATE admin_users SET password = '${hashedPassword}' WHERE username = 'admin';`);
console.log(`INSERT INTO admin_users (username, password) VALUES ('admin', '${hashedPassword}') ON DUPLICATE KEY UPDATE password = '${hashedPassword}';`);

