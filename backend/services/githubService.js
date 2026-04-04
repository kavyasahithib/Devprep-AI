const axios = require("axios");

/**
 * GitHub Integration Service
 * Handles repository creation and solution syncing
 */
exports.syncToGithub = async (user, submission, question) => {
  if (!user.githubToken) {
    throw new Error("GitHub token not found");
  }

  const repoName = "DevPrep-Solutions";
  const authHeader = { Authorization: `token ${user.githubToken}` };

  try {
    // 1. Check if repo exists, if not create it
    try {
      await axios.get(`https://api.github.com/repos/${user.githubUsername}/${repoName}`, {
        headers: authHeader
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`Creating repository ${repoName}...`);
        await axios.post("https://api.github.com/user/repos", {
          name: repoName,
          description: "My solutions to coding problems on DevPrep AI",
          private: false,
          auto_init: true
        }, { headers: authHeader });
      } else {
        throw error;
      }
    }

    // 2. Prepare file content
    const fileName = `${question.title.replace(/\s+/g, "_")}.${submission.language === 'python' ? 'py' : submission.language === 'javascript' ? 'js' : 'txt'}`;
    const path = `solutions/${fileName}`;
    
    // Check if file exists to get SHA (for updates)
    let sha;
    try {
      const fileRes = await axios.get(`https://api.github.com/repos/${user.githubUsername}/${repoName}/contents/${path}`, {
        headers: authHeader
      });
      sha = fileRes.data.sha;
    } catch (e) {
      // File doesn't exist, which is fine
    }

    const content = Buffer.from(submission.code).toString("base64");
    
    // 3. Create or update file
    const res = await axios.put(`https://api.github.com/repos/${user.githubUsername}/${repoName}/contents/${path}`, {
      message: `Sync solution for ${question.title} via DevPrep AI`,
      content,
      sha
    }, { headers: authHeader });

    return res.data.content.html_url;

  } catch (error) {
    console.error("GitHub Sync Error:", error.response?.data || error.message);
    throw new Error("Failed to sync with GitHub");
  }
};

/**
 * Get GitHub Authorization URL
 */
exports.getAuthUrl = () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || "http://localhost:5000/api/users/github/callback";
  const scope = "repo,user";
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
};

/**
 * Exchange Code for Token
 */
exports.exchangeCodeForToken = async (code) => {
  const { data } = await axios.post("https://github.com/login/oauth/access_token", {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code
  }, {
    headers: { Accept: "application/json" }
  });

  if (data.error) {
    throw new Error(data.error_description || "GitHub OAuth Error");
  }

  // Get user info to store username
  const userRes = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `token ${data.access_token}` }
  });

  return {
    token: data.access_token,
    username: userRes.data.login
  };
};

