// server/src/githubCache.ts
import fs from 'fs/promises';
import path from 'path';
import { Repository, CacheMetadata } from './types';
import fetch from 'node-fetch';

const CACHE_DIR = process.env.CACHE_DIR || '/var/www/html/personal-kb/api/data';
const GITHUB_USER = process.env.GITHUB_USER || 'matthewabbott';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Optional: for higher rate limits

export class GitHubCache {
  private async ensureCacheDir() {
    await fs.mkdir(path.join(CACHE_DIR, 'readmes'), { recursive: true });
    await fs.mkdir(path.join(CACHE_DIR, 'languages'), { recursive: true });
  }

  private async fetchGitHub(endpoint: string, raw = false) {
    const headers: Record<string, string> = {
      'Accept': raw ? 'application/vnd.github.raw' : 'application/vnd.github.v3+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/${endpoint}`, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return raw ? response.text() : response.json();
  }

  async updateCache() {
    console.log('Starting cache update...');
    await this.ensureCacheDir();

    try {
      // Fetch repositories
      const repos = await this.fetchGitHub(`users/${GITHUB_USER}/repos?per_page=100`) as Repository[];
      repos.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());

      // Save base repository data
      await fs.writeFile(
        path.join(CACHE_DIR, 'repos.json'),
        JSON.stringify(repos, null, 2)
      );

      // Update individual repository data
      for (const repo of repos) {
        console.log(`Processing ${repo.name}...`);

        try {
          // Fetch and save language data
          const languages = await this.fetchGitHub(`repos/${GITHUB_USER}/${repo.name}/languages`);
          await fs.writeFile(
            path.join(CACHE_DIR, 'languages', `${repo.name}.json`),
            JSON.stringify(languages, null, 2)
          );

          // Fetch and save README
          try {
            const readme = await this.fetchGitHub(
              `repos/${GITHUB_USER}/${repo.name}/readme`,
              true
            );
            await fs.writeFile(
              path.join(CACHE_DIR, 'readmes', `${repo.name}.md`),
              readme
            );
          } catch (error) {
            if ((error as any).status !== 404) {
              throw error;
            }
            console.log(`No README found for ${repo.name}`);
          }
        } catch (error) {
          console.error(`Error processing ${repo.name}:`, error);
        }
      }

      // Save metadata
      const metadata: CacheMetadata = {
        last_updated: new Date().toISOString(),
        repo_count: repos.length
      };

      await fs.writeFile(
        path.join(CACHE_DIR, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      console.log('Cache update completed');
    } catch (error) {
      console.error('Cache update failed:', error);
      throw error;
    }
  }

  async getRepos(): Promise<Repository[]> {
    const data = await fs.readFile(path.join(CACHE_DIR, 'repos.json'), 'utf-8');
    return JSON.parse(data);
  }

  async getLanguages(repoName: string): Promise<Record<string, number>> {
    const data = await fs.readFile(
      path.join(CACHE_DIR, 'languages', `${repoName}.json`),
      'utf-8'
    );
    return JSON.parse(data);
  }

  async getReadme(repoName: string): Promise<string> {
    return fs.readFile(
      path.join(CACHE_DIR, 'readmes', `${repoName}.md`),
      'utf-8'
    );
  }

  async getMetadata(): Promise<CacheMetadata> {
    const data = await fs.readFile(path.join(CACHE_DIR, 'metadata.json'), 'utf-8');
    return JSON.parse(data);
  }
}