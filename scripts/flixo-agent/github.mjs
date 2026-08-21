const API_ROOT = 'https://api.github.com';

function requireToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required for GitHub write operations');
  }
  return token;
}

function assertSafeBranch(branch, expectedBranch) {
  if (!branch || branch === 'main' || branch === 'master') {
    throw new Error(`Refuses writes to protected/default branch: ${branch || '<empty>'}`);
  }
  if (expectedBranch && branch !== expectedBranch) {
    throw new Error(`Branch mismatch: expected ${expectedBranch}, received ${branch}`);
  }
}

function assertSafePath(file) {
  if (!file || typeof file !== 'string') throw new Error('Invalid repository path');
  if (file.startsWith('/') || file.includes('..')) throw new Error(`Unsafe repository path: ${file}`);
  if (file === '.github/workflows/release-certification.yml') {
    throw new Error('release-certification.yml is outside the agent write scope');
  }
}

async function request(url, { token, method = 'GET', body } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!response.ok) {
    const message = typeof data === 'object' && data?.message ? data.message : text;
    throw new Error(`GitHub API ${response.status}: ${message}`);
  }
  return data;
}

export function assertSafeBranchForPR(branch, expectedBranch) {
  assertSafeBranch(branch, expectedBranch);
}

export function assertSafeAgentPath(file) {
  assertSafePath(file);
}

export function createGitHubAdapter({ repository, prNumber, token = process.env.GITHUB_TOKEN } = {}) {
  if (!repository) throw new Error('repository is required');
  if (!prNumber) throw new Error('prNumber is required');

  const auth = token ?? requireToken();

  return {
    async getPRInfo() {
      return request(`${API_ROOT}/repos/${repository}/pulls/${prNumber}`, { token: auth });
    },

    async getFileContent(pathname, ref) {
      assertSafePath(pathname);
      const suffix = ref ? `?ref=${encodeURIComponent(ref)}` : '';
      const data = await request(`${API_ROOT}/repos/${repository}/contents/${pathname}${suffix}`, { token: auth });
      if (Array.isArray(data)) throw new Error(`Expected a file but received a directory: ${pathname}`);
      const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
      return { path: pathname, content, sha: data.sha };
    },

    async listPRChangedFiles() {
      const data = await request(`${API_ROOT}/repos/${repository}/pulls/${prNumber}/files?per_page=100`, { token: auth });
      return data.map((file) => file.filename);
    },

    async createCommit({ branch, expectedHeadSha, message, changes }) {
      assertSafeBranch(branch);
      if (!Array.isArray(changes) || changes.length === 0) throw new Error('changes must be a non-empty array');
      for (const change of changes) assertSafePath(change.path);

      const pr = await this.getPRInfo();
      if (pr.head.ref !== branch) throw new Error(`Branch is not PR #${prNumber} head: ${branch}`);
      if (pr.head.sha !== expectedHeadSha) {
        throw new Error(`HEAD changed: expected ${expectedHeadSha}, current ${pr.head.sha}`);
      }

      const refData = await request(`${API_ROOT}/repos/${repository}/git/ref/heads/${encodeURIComponent(branch)}`, { token: auth });
      if (refData.object.sha !== expectedHeadSha) {
        throw new Error(`Branch ref changed after PR check: expected ${expectedHeadSha}, current ${refData.object.sha}`);
      }

      const baseCommit = await request(`${API_ROOT}/repos/${repository}/git/commits/${expectedHeadSha}`, { token: auth });
      const baseTreeSha = baseCommit.tree.sha;

      const treeItems = [];
      for (const change of changes) {
        const blob = await request(`${API_ROOT}/repos/${repository}/git/blobs`, {
          token: auth,
          method: 'POST',
          body: { content: change.content, encoding: 'utf-8' },
        });
        treeItems.push({ path: change.path, mode: '100644', type: 'blob', sha: blob.sha });
      }

      const tree = await request(`${API_ROOT}/repos/${repository}/git/trees`, {
        token: auth,
        method: 'POST',
        body: { base_tree: baseTreeSha, tree: treeItems },
      });

      const commit = await request(`${API_ROOT}/repos/${repository}/git/commits`, {
        token: auth,
        method: 'POST',
        body: { message, tree: tree.sha, parents: [expectedHeadSha] },
      });

      await request(`${API_ROOT}/repos/${repository}/git/refs/heads/${encodeURIComponent(branch)}`, {
        token: auth,
        method: 'PATCH',
        body: { sha: commit.sha, force: false },
      });

      return { sha: commit.sha, message, branch, changedFiles: changes.map((change) => change.path) };
    },
  };
}

export default { createGitHubAdapter, assertSafeBranchForPR, assertSafeAgentPath };
