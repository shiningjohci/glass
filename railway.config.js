/**
 * Railway LiteLLM Configuration File
 * 
 * This file configures Glass app to connect to your Railway deployed LiteLLM service
 * Modify the URL below to your Railway deployment address
 */

// Your Railway LiteLLM deployment URL
const RAILWAY_LITELLM_URL = 'https://litellm-production-ec35.up.railway.app';

// Set environment variables
process.env.LITELLM_BASE_URL = RAILWAY_LITELLM_URL;
process.env.DISABLE_LOCAL_PYTHON_SERVER = 'true';

console.log(`[Railway] Configuration loaded: ${RAILWAY_LITELLM_URL}`);

module.exports = {
    RAILWAY_LITELLM_URL,
    DISABLE_LOCAL_PYTHON_SERVER: true
}; 