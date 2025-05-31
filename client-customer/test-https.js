#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

// Test HTTPS server connectivity
async function testHTTPS() {
    console.log('🔍 Testing HTTPS setup...\n');

    // Test 1: Check if certificates exist
    console.log('1. Checking SSL certificates...');
    try {
        const keyExists = fs.existsSync('./certificates/private-key.pem');
        const certExists = fs.existsSync('./certificates/certificate.pem');

        if (keyExists && certExists) {
            console.log('✅ SSL certificates found');
        } else {
            console.log('❌ SSL certificates missing');
            console.log('   Run: bun run generate-certs');
            return;
        }
    } catch (error) {
        console.log('❌ Error checking certificates:', error.message);
        return;
    }

    // Test 2: Test HTTPS connection
    console.log('\n2. Testing HTTPS connection...');

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        rejectUnauthorized: false // Accept self-signed certificates
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            console.log('✅ HTTPS server is responding');
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);

            // Check security headers
            const securityHeaders = [
                'strict-transport-security',
                'x-frame-options',
                'x-content-type-options',
                'referrer-policy'
            ];

            console.log('\n3. Checking security headers...');
            securityHeaders.forEach((header) => {
                if (res.headers[header]) {
                    console.log(`✅ ${header}: ${res.headers[header]}`);
                } else {
                    console.log(`⚠️  ${header}: Not set`);
                }
            });

            resolve(true);
        });

        req.on('error', (error) => {
            console.log('❌ HTTPS connection failed:', error.message);
            console.log('   Make sure the server is running: bun run start:https');
            resolve(false);
        });

        req.setTimeout(5000, () => {
            console.log('❌ Connection timeout');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

// Test VNPay integration URLs
async function testVNPayURLs() {
    console.log('\n4. Testing VNPay integration URLs...');

    const vnpayUrls = [
        'https://localhost:3000/payment/vnpay-return',
        'https://localhost:4000/payment/vnpay-ipn'
    ];

    for (const url of vnpayUrls) {
        try {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname,
                method: 'GET',
                rejectUnauthorized: false
            };

            await new Promise((resolve) => {
                const req = https.request(options, (res) => {
                    console.log(`✅ ${url} - Status: ${res.statusCode}`);
                    resolve(true);
                });

                req.on('error', (error) => {
                    console.log(`❌ ${url} - Error: ${error.message}`);
                    resolve(false);
                });

                req.setTimeout(3000, () => {
                    req.destroy();
                    resolve(false);
                });

                req.end();
            });
        } catch (error) {
            console.log(`❌ ${url} - Invalid URL: ${error.message}`);
        }
    }
}

// Main test function
async function main() {
    console.log('🚀 HTTPS Setup Test for Client-Customer Application\n');

    const httpsWorking = await testHTTPS();

    if (httpsWorking) {
        await testVNPayURLs();

        console.log('\n🎉 HTTPS setup test completed!');
        console.log('\n📝 Next steps:');
        console.log('   1. Update VNPay configuration with HTTPS URLs');
        console.log('   2. Test payment flow in browser');
        console.log(
            '   3. For production, replace self-signed certificates with CA-signed certificates'
        );
    } else {
        console.log('\n❌ HTTPS setup needs attention');
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Generate certificates: bun run generate-certs');
        console.log('   2. Start HTTPS server: bun run start:https');
        console.log('   3. Check firewall settings');
    }
}

// Run the test
main().catch(console.error);
