# AI-Powered Code Generation 🤖

This document explains how the AI-powered code generation feature works and how to configure it.

## Overview

The CodeGen Automator now uses OpenAI's GPT-4 to generate context-aware, production-ready code instead of relying solely on static templates. This means the generated code is tailored to your specific project requirements based on the project description you provide.

## Key Benefits

### 1. **Context-Aware Generation**
Instead of generic placeholder code, AI analyzes your project description and generates relevant, specific implementations.

**Example:**
- **Description:** "A blog platform for developers to share technical articles"
- **AI Generates:** Post model with fields like `title`, `content`, `author`, `tags`, `published_at`, `view_count`
- **Template Would Generate:** Generic Item model with `name` and `description`

### 2. **Framework-Specific Best Practices**
AI understands each framework's conventions and generates idiomatic code:
- **FastAPI:** Proper Pydantic models, async/await patterns, dependency injection
- **Django:** ORM models with Meta classes, __str__ methods, help_text
- **Flask:** Flask-RESTful patterns, proper resource classes
- **Angular:** TypeScript interfaces, reactive patterns, dependency injection

### 3. **Production-Ready Code**
Generated code includes:
- Proper error handling
- Type hints and validation
- Comprehensive documentation
- Best practices for each framework

### 4. **Graceful Fallback**
If OpenAI is unavailable or fails, the system automatically falls back to template-based generation. Your workflow never breaks.

## Configuration

### Step 1: Get an OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API keys section
3. Create a new API key (starts with `sk-`)
4. Copy the key securely

### Step 2: Add to GitHub Secrets

#### Required Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `OPENAI_API_KEY`
5. Value: Paste your OpenAI API key
6. Click **Add secret**

#### Optional Secrets (Advanced Configuration)

For Azure OpenAI, custom endpoints, or specific models:

**Custom Endpoint:**
- Name: `OPENAI_ENDPOINT`
- Value: Your custom endpoint URL (e.g., `https://your-resource.openai.azure.com/`)
- Use case: Azure OpenAI, custom OpenAI-compatible servers

**Custom Model:**
- Name: `OPENAI_MODEL`
- Value: Model name (e.g., `gpt-4-turbo`, `gpt-3.5-turbo`)
- Default: `gpt-4` if not specified
- Use case: Cost optimization, specific model requirements

### Step 3: Install Dependencies

For local development:

**Python generators:**
```bash
pip install -r requirements.txt
```

**Angular generator:**
```bash
npm install
```

The GitHub Actions workflow automatically installs dependencies, so no additional setup is needed for automated generation.

### Step 4: Configure Environment Variables (Local Development)

**Option 1: Export in terminal**
```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_ENDPOINT="https://your-endpoint.com/"  # Optional
export OPENAI_MODEL="gpt-4-turbo"                     # Optional
```

**Option 2: Create .env file**
```env
OPENAI_API_KEY=sk-...
OPENAI_ENDPOINT=https://your-endpoint.com/  # Optional
OPENAI_MODEL=gpt-4-turbo                    # Optional
```

### Azure OpenAI Setup

Azure OpenAI uses a different endpoint structure and authentication:

1. **Get Azure OpenAI Credentials:**
   - Endpoint: `https://your-resource.openai.azure.com/`
   - API Key: From Azure Portal → Your OpenAI Resource → Keys and Endpoint
   - Deployment Name: Your model deployment name

2. **Configure GitHub Secrets:**
   ```
   OPENAI_API_KEY=your-azure-api-key
   OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   OPENAI_MODEL=your-deployment-name  # e.g., "gpt-4-deployment"
   ```

3. **Local Environment:**
   ```bash
   export OPENAI_API_KEY="your-azure-api-key"
   export OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
   export OPENAI_MODEL="your-deployment-name"
   ```

### Custom OpenAI-Compatible Endpoints

The system supports any OpenAI-compatible API endpoint:

- **LocalAI**: `http://localhost:8080/v1`
- **Ollama with OpenAI compatibility**: `http://localhost:11434/v1`
- **Custom proxies**: Any URL implementing OpenAI's API spec

Example configuration:
```bash
export OPENAI_API_KEY="not-needed-for-local"  # Some local models don't need a key
export OPENAI_ENDPOINT="http://localhost:8080/v1"
export OPENAI_MODEL="local-model-name"
```

## How It Works

### 1. Entity Detection

When you create an issue with a project description like:

```
"A task management API with projects, tasks, and user assignments"
```

The system:
1. Extracts entities: `project`, `task`, `user`
2. Analyzes the context to understand relationships
3. Determines appropriate fields for each entity

### 2. AI Prompt Construction

For each entity, the system constructs framework-specific prompts:

**FastAPI Example:**
```
Generate FastAPI Pydantic models and CRUD endpoints for a 'task' entity 
in a task management API with projects, tasks, and user assignments.

Requirements:
- Create Pydantic models: TaskBase, TaskCreate, TaskUpdate, TaskResponse
- Include context-appropriate fields (not just generic name/description)
- Create complete CRUD endpoints: GET, POST, PUT, DELETE
- Use async patterns
- Include proper HTTP status codes
- Add comprehensive docstrings
```

### 3. Code Generation

The AI (GPT-4) generates code that:
- Is specific to your domain (task management, not generic items)
- Uses framework conventions
- Includes validation and error handling
- Has production-ready patterns

### 4. Fallback Handling

If OpenAI API fails or is unavailable:
1. System logs a warning
2. Falls back to template-based generation
3. Continues execution normally
4. User is notified via workflow logs

## Generated Code Examples

### Without AI (Template-Based)

```python
class Item(BaseModel):
    name: str
    description: str
```

### With AI (Context-Aware)

For "blog platform" description:
```python
class Post(BaseModel):
    title: str
    content: str
    author: str
    tags: List[str]
    published_at: datetime
    view_count: int
    is_published: bool
```

For "e-commerce API" description:
```python
class Product(BaseModel):
    name: str
    sku: str
    price: Decimal
    category: str
    inventory_count: int
    is_available: bool
    description: str
```

## Supported Frameworks

### Python
- ✅ **FastAPI** - Pydantic models, async endpoints, OpenAPI documentation
- ✅ **Django** - ORM models, serializers, views
- ✅ **Flask** - Flask-RESTful resources, blueprints

### JavaScript/TypeScript
- ✅ **Angular** - Components, services, interfaces, modules

## Cost Considerations

### OpenAI API Pricing

**Model Costs (as of 2026):**
- **GPT-4 Turbo**: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- **GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **GPT-3.5 Turbo**: ~$0.0005 per 1K input tokens, ~$0.0015 per 1K output tokens

**Typical Project Generation Costs:**
- **Small project** (1-2 entities): $0.10 - $0.30 with GPT-4
- **Medium project** (3-5 entities): $0.30 - $0.80 with GPT-4
- **Large project** (5+ entities): $0.80 - $2.00 with GPT-4

### Cost Optimization Strategies

#### 1. Use GPT-3.5 Turbo for Simple Projects

Set in GitHub Secrets or environment:
```bash
export OPENAI_MODEL="gpt-3.5-turbo"
```

**When to use GPT-3.5:**
- Simple CRUD applications
- Standard REST APIs
- Basic entity models
- Prototypes and MVPs

**When to use GPT-4:**
- Complex business logic
- Domain-specific applications
- Advanced patterns and architectures
- Production applications

#### 2. Azure OpenAI Pay-As-You-Go

Azure OpenAI offers:
- More predictable pricing
- Enterprise SLAs
- Regional deployment options
- Better quota management

#### 3. Model Comparison

| Model | Speed | Cost | Quality | Best For |
|-------|-------|------|---------|----------|
| GPT-4 Turbo | Fast | Medium | Excellent | Production code, complex logic |
| GPT-4 | Medium | High | Excellent | Critical applications, complex domains |
| GPT-3.5 Turbo | Very Fast | Low | Good | Simple CRUD, prototypes, MVPs |

#### 4. Local/Self-Hosted Options

For zero cost (but requires setup):

**LocalAI:**
```bash
export OPENAI_ENDPOINT="http://localhost:8080/v1"
export OPENAI_MODEL="codellama"
export OPENAI_API_KEY="not-needed"
```

**Ollama with OpenAI compatibility:**
```bash
export OPENAI_ENDPOINT="http://localhost:11434/v1"
export OPENAI_MODEL="codellama:13b"
```

### Cost depends on:
- Number of entities detected
- Complexity of project description
- Response length (configured via max_tokens)

### Tips to Minimize Costs

1. **Be concise in project descriptions** - Focus on key entities
2. **Use appropriate models** - GPT-3.5 for simple projects, GPT-4 for complex ones
3. **Monitor usage** in OpenAI dashboard
4. **Set max_tokens limits** (already configured reasonably)
5. **Consider Azure OpenAI** for enterprise pricing and quotas
6. **Use local models** for development/testing (LocalAI, Ollama)

## Monitoring and Debugging

### Check if AI is Enabled

In GitHub Actions logs, look for:
```
✅ OpenAI API Key configured - AI generation enabled
```

or

```
⚠️  OpenAI API Key not configured - falling back to templates
```

### Local Testing

```bash
# Set environment variable
export OPENAI_API_KEY="sk-..."

# Run generator
python scripts/generate-python.py

# Check logs for AI status
```

### Common Issues

#### 1. API Key Not Working
```
⚠️  OpenAI API error: Incorrect API key provided
```
**Solution:** Verify API key in GitHub Secrets matches your OpenAI key

#### 2. Rate Limiting
```
⚠️  OpenAI API error: Rate limit exceeded
```
**Solution:** Wait a few minutes or upgrade OpenAI plan

#### 3. Library Not Installed
```
⚠️  OpenAI library not found. AI-powered code generation will be disabled.
```
**Solution:** Run `pip install -r requirements.txt` or `npm install`

## Advanced Configuration

### Customizing AI Parameters

In `generate-python.py` or `generate-angular.js`, you can modify:

```python
# Temperature: 0-1 (0=deterministic, 1=creative)
temperature=0.7  # Default: balanced

# Max tokens: response length
max_tokens=3000  # Adjust based on needs

# Model selection
model="gpt-4"  # or "gpt-3.5-turbo" for cost savings
```

### Custom Prompts

Modify the AI prompts in generator functions to add your own requirements:

```python
ai_prompt = f"""Generate FastAPI code for '{entity_name}' in {description}.

Requirements:
1. Standard CRUD operations
2. Add custom validation for {specific_field}
3. Include rate limiting decorators
4. Add custom requirement here...
"""
```

## Security Considerations

### API Key Security
- ✅ Never commit API keys to code
- ✅ Store in GitHub Secrets only
- ✅ Rotate keys periodically
- ✅ Monitor usage in OpenAI dashboard

### Code Review
Even with AI-generated code:
- ✅ Always review generated code before merging
- ✅ Check for security vulnerabilities
- ✅ Validate business logic
- ✅ Test thoroughly

## Future Enhancements

Planned improvements:
- [ ] Support for Claude and other LLM providers
- [ ] Custom prompt templates per organization
- [ ] A/B testing between different models
- [ ] Cost optimization with model fallback chain
- [ ] Fine-tuned models for specific frameworks

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Verify OpenAI API key configuration
3. Review this documentation
4. Open an issue in the repository

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
