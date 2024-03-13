import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { exec } from 'child_process';
import fs from 'fs/promises';

const repoURL= process.env.REPO_URL

async function cloneRepo() {
    try {
        await fs.mkdir('.i18n', { recursive: true });
        const { stdout, stderr } = await exec(`git clone ${repoURL} .i18n/repo`);
        console.log(`Git Clone stdout: ${stdout}`);
        console.error(`Git Clone stderr: ${stderr}`);
        console.log('Repo cloned successfully');
    } catch (error) {
        console.error(`Error cloning repo: ${error.message}`);
    }
}

cloneRepo()

new Elysia()
    .use(cors())
    .get('/', ({ query }) => {
        console.log({
            query
        })
        return {
            query
        }
    })
    .get('/hello', () => 'Hi')
    .listen(5000)