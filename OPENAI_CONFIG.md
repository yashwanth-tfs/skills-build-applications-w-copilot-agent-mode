# OpenAI Configuration Quick Reference

## Environment Variables

### Required
- `OPENAI_API_KEY` - Your OpenAI API key (starts with `sk-`)

### Optional
- `OPENAI_ENDPOINT` - Custom endpoint URL (for Azure OpenAI or custom servers)
- `OPENAI_MODEL` - Model to use (default: `gpt-4`)

## Configuration Examples

### Standard OpenAI

```bash
export OPENAI_API_KEY="sk-..."
# Optionally override default model
export OPENAI_MODEL="gpt-4-turbo"
```

### Azure OpenAI

```bash
export OPENAI_API_KEY="your-azure-api-key"
export OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
export OPENAI_MODEL="your-deployment-name"  # e.g., "gpt-4-deployment"
```

### LocalAI (Self-Hosted)

```bash
export OPENAI_API_KEY="not-needed"
export OPENAI_ENDPOINT="http://localhost:8080/v1"
export OPENAI_MODEL="codellama"
```

### Ollama with OpenAI Compatibility

```bash
export OPENAI_API_KEY="not-needed"
export OPENAI_ENDPOINT="http://localhost:11434/v1"
export OPENAI_MODEL="codellama:13b"
```

### Custom OpenAI-Compatible Endpoint

```bash
export OPENAI_API_KEY="your-api-key"
export OPENAI_ENDPOINT="https://your-custom-endpoint.com/v1"
export OPENAI_MODEL="your-model-name"
```

## GitHub Secrets Setup

### Required Secret

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-...` (your API key)

### Optional Secrets

For custom endpoints or models, also add:

- **Secret Name:** `OPENAI_ENDPOINT`
  - **Value:** `https://your-endpoint.com/`

- **Secret Name:** `OPENAI_MODEL`
  - **Value:** `gpt-4-turbo` (or your preferred model)

## Model Options

### OpenAI Models

| Model | Speed | Cost | Quality | Use Case |
|-------|-------|------|---------|----------|
| `gpt-4-turbo` | Fast | Medium | Excellent | Recommended for most projects |
| `gpt-4` | Medium | High | Excellent | Complex applications |
| `gpt-3.5-turbo` | Very Fast | Low | Good | Simple CRUD, prototypes |
| `gpt-4o` | Fast | Medium | Excellent | Latest multimodal model |

### Azure OpenAI Models

Use your deployment name:
- `gpt-4-deployment`
- `gpt-35-turbo-deployment`
- `your-custom-deployment-name`

### Local Models (via LocalAI/Ollama)

- `codellama` - Code generation specialist
- `codellama:13b` - Larger code model
- `mistral` - General purpose
- `mixtral` - Advanced reasoning

## Testing Your Configuration

### Python

```bash
# Set environment variables
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4-turbo"  # Optional

# Test generation
python scripts/generate-python.py test-project test-metadata.json
```

### Angular

```bash
# Set environment variables
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4-turbo"  # Optional

# Test generation
node scripts/generate-angular.js test-project test-metadata.json
```

### Check Logs

Look for these messages:
- ✅ `OpenAI API Key configured - AI generation enabled`
- 🔗 `Using custom OpenAI endpoint: <url>`
- 🤖 `Generating code with model: <model>`
- ⚠️ `OpenAI API Key not configured - falling back to templates`

## Troubleshooting

### Issue: "OPENAI_API_KEY not found in environment"

**Solution:**
```bash
# Verify variable is set
echo $OPENAI_API_KEY

# If empty, export it
export OPENAI_API_KEY="sk-..."
```

### Issue: "OpenAI API error: Incorrect API key"

**Solution:**
- Verify your API key at https://platform.openai.com/api-keys
- Check for extra spaces or quotes
- Regenerate key if needed

### Issue: "Model not found"

**Solution for OpenAI:**
```bash
# Use a valid model name
export OPENAI_MODEL="gpt-4-turbo"
# Or omit to use default gpt-4
unset OPENAI_MODEL
```

**Solution for Azure:**
```bash
# Use your exact deployment name from Azure Portal
export OPENAI_MODEL="your-exact-deployment-name"
```

### Issue: Connection errors with custom endpoint

**Solution:**
```bash
# Ensure endpoint includes /v1 suffix if required
export OPENAI_ENDPOINT="https://your-endpoint.com/v1"

# For local endpoints, ensure service is running
curl http://localhost:8080/v1/models
```

## Security Best Practices

1. ✅ Never commit API keys to code
2. ✅ Use GitHub Secrets for CI/CD
3. ✅ Rotate keys periodically
4. ✅ Set spending limits in OpenAI dashboard
5. ✅ Use least-privilege access
6. ✅ Monitor usage regularly

## Cost Management

### Set Spending Limits

In OpenAI dashboard:
1. Go to **Billing** → **Limits**
2. Set monthly budget
3. Configure usage notifications

### Monitor Usage

```bash
# Check OpenAI dashboard regularly
# View usage at: https://platform.openai.com/usage
```

### Optimize Costs

```bash
# Use cheaper model for development
export OPENAI_MODEL="gpt-3.5-turbo"

# Use local model for testing (free)
export OPENAI_ENDPOINT="http://localhost:11434/v1"
export OPENAI_MODEL="codellama"
```

## Support

- OpenAI Documentation: https://platform.openai.com/docs
- Azure OpenAI Docs: https://learn.microsoft.com/en-us/azure/ai-services/openai/
- LocalAI: https://localai.io/
- Ollama: https://ollama.ai/
