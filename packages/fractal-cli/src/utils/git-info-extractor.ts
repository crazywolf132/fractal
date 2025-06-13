import { execSync } from 'child_process';
import path from 'path';

export interface GitInfo {
  url?: string;
  branch?: string;
  commit?: string;
  dirty?: boolean;
}

export class GitInfoExtractor {
  async extractGitInfo(filePath: string): Promise<GitInfo> {
    const gitInfo: GitInfo = {};

    try {
      const repoRoot = this.findGitRoot(filePath);
      if (!repoRoot) {
        return gitInfo;
      }

      // Get repository URL
      try {
        const remoteUrl = execSync('git config --get remote.origin.url', {
          cwd: repoRoot,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        gitInfo.url = this.normalizeGitUrl(remoteUrl);
      } catch {
        // No remote or error getting URL
      }

      // Get current branch
      try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', {
          cwd: repoRoot,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        gitInfo.branch = branch;
      } catch {
        // Error getting branch
      }

      // Get current commit hash
      try {
        const commit = execSync('git rev-parse HEAD', {
          cwd: repoRoot,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        gitInfo.commit = commit;
      } catch {
        // Error getting commit
      }

      // Check if working directory is dirty
      try {
        const status = execSync('git status --porcelain', {
          cwd: repoRoot,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        gitInfo.dirty = status.length > 0;
      } catch {
        // Error checking status, assume clean
        gitInfo.dirty = false;
      }

    } catch (error) {
      // Git not available or not in a git repository
    }

    return gitInfo;
  }

  private findGitRoot(startPath: string): string | null {
    let currentDir = path.dirname(path.resolve(startPath));
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      try {
        execSync('git rev-parse --git-dir', {
          cwd: currentDir,
          stdio: ['pipe', 'pipe', 'ignore']
        });
        return currentDir;
      } catch {
        // Not a git repository, continue up
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }

    return null;
  }

  private normalizeGitUrl(url: string): string {
    // Convert SSH URLs to HTTPS for consistency
    if (url.startsWith('git@')) {
      // git@github.com:user/repo.git -> https://github.com/user/repo
      const match = url.match(/git@([^:]+):(.+)\.git$/);
      if (match) {
        return `https://${match[1]}/${match[2]}`;
      }
    }

    // Remove .git suffix if present
    if (url.endsWith('.git')) {
      return url.slice(0, -4);
    }

    return url;
  }
}