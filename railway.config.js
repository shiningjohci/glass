/**
 * Railway LiteLLM Configuration File
 * 
 * This file configures Glass app to connect to your Railway deployed LiteLLM service
 * 
 * IMPORTANT: Your LiteLLM service is running but needs API keys configured!
 * Current status: Service accessible but no models configured
 */

// Your Railway LiteLLM deployment URL
const RAILWAY_LITELLM_URL = 'https://litellm-production-ec35.up.railway.app';

// Set environment variables
process.env.LITELLM_BASE_URL = RAILWAY_LITELLM_URL;
process.env.DISABLE_LOCAL_PYTHON_SERVER = 'true';

console.log(`[Railway] Configuration loaded: ${RAILWAY_LITELLM_URL}`);
console.log(`[Railway] Service status: Running but requires API key configuration`);

/**
 * RAILWAY SETUP REQUIRED:
 * 
 * 1. Go to your Railway dashboard: https://railway.app/dashboard
 * 2. Select your LiteLLM service
 * 3. Go to Variables tab
 * 4. Add these environment variables:
 * 
 * For DeepSeek (text tasks):
 * - DEEPSEEK_API_KEY: your-deepseek-api-key
 * 
 * For OpenAI (image tasks):
 * - OPENAI_API_KEY: your-openai-api-key
 * 
 * 5. Create config.yaml (if not exists):
 * 
 * model_list:
 *   - model_name: deepseek-chat
 *     litellm_params:
 *       model: deepseek/deepseek-chat
 *       api_key: os.environ/DEEPSEEK_API_KEY
 *   - model_name: gpt-4o-mini
 *     litellm_params:
 *       model: openai/gpt-4o-mini
 *       api_key: os.environ/OPENAI_API_KEY
 * 
 * 6. Redeploy your service
 */

module.exports = {
    RAILWAY_LITELLM_URL,
    DISABLE_LOCAL_PYTHON_SERVER: true,
    SETUP_REQUIRED: true
}; 