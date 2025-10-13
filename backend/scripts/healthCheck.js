#!/usr/bin/env node
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Health check endpoints
const endpoints = [
    { name: 'Backend Health', url: `${BACKEND_URL}/health` },
    { name: 'Backend API Test', url: `${BACKEND_URL}/api/test` },
    { name: 'Notes API', url: `${BACKEND_URL}/api/notes` },
    { name: 'Posts API', url: `${BACKEND_URL}/api/posts` },
    { name: 'General Stats API', url: `${BACKEND_URL}/api/stats/general` },
    { name: 'Leaderboard API', url: `${BACKEND_URL}/api/stats/leaderboard` }
];

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
    blue: '\x1b[34m'
};

async function checkEndpoint(endpoint) {
    try {
        const response = await axios.get(endpoint.url, { timeout: 5000 });
        console.log(`${colors.green}✅ ${endpoint.name} - Status: ${response.status}${colors.reset}`);
        return true;
    } catch (error) {
        if (error.response) {
            console.log(`${colors.yellow}⚠️  ${endpoint.name} - Status: ${error.response.status} (${error.response.statusText})${colors.reset}`);
        } else if (error.code === 'ECONNREFUSED') {
            console.log(`${colors.red}❌ ${endpoint.name} - Connection Refused${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ ${endpoint.name} - Error: ${error.message}${colors.reset}`);
        }
        return false;
    }
}

async function runHealthCheck() {
    console.log(`${colors.blue}🔍 Running Health Check at ${new Date().toISOString()}${colors.reset}`);
    console.log('='.repeat(60));

    let allHealthy = true;

    for (const endpoint of endpoints) {
        const isHealthy = await checkEndpoint(endpoint);
        if (!isHealthy) allHealthy = false;
    }

    console.log('='.repeat(60));

    if (allHealthy) {
        console.log(`${colors.green}🎉 All endpoints are healthy!${colors.reset}`);
    } else {
        console.log(`${colors.red}⚠️  Some endpoints have issues. Check the logs above.${colors.reset}`);
    }

    console.log('');
}

// Run health check
runHealthCheck().catch(console.error);