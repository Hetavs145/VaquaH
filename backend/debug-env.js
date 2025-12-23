import 'dotenv/config';
import fs from 'fs';
import path from 'path';

console.log('--- Debugging Environment Variables ---');
console.log('Current Directory:', process.cwd());

const envPath = path.resolve(process.cwd(), '.env');
console.log('Expected .env Path:', envPath);

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found at:', envPath);
    const content = fs.readFileSync(envPath, 'utf-8');
    console.log('--- .env Content Start ---');
    console.log(content);
    console.log('--- .env Content End ---');
} else {
    console.log('❌ .env file NOT found!');
}

console.log('\n--- process.env Check ---');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Loaded (starts with ' + process.env.RAZORPAY_KEY_ID.substring(0, 5) + '...)' : '❌ Undefined');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Loaded' : '❌ Undefined');
