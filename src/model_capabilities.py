"""Model-specific capabilities and configurations."""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum


class ModelCapability(str, Enum):
    """Supported model capabilities."""
    THINKING = "thinking"  # Supports thinking/reasoning mode
    FUNCTION_CALLING = "function_calling"
    VISION = "vision"
    CODE_EXECUTION = "code_execution"
    WEB_SEARCH = "web_search"
    LONG_CONTEXT = "long_context"  # 100k+ tokens
    STRUCTURED_OUTPUT = "structured_output"  # Native JSON mode


class TokenFormat(str, Enum):
    """Token format types."""
    PLAIN = "plain"
    ANTHROPIC = "anthropic"  # <thinking>, etc.
    OPENAI = "openai"  # System/User/Assistant roles
    GOOGLE = "google"  # Gemini format
    CUSTOM = "custom"


class SystemPromptCondition(BaseModel):
    """Conditions for applying system prompts."""
    capability_required: Optional[ModelCapability] = None
    user_input_contains: Optional[List[str]] = None
    prompt_category: Optional[str] = None
    always_apply: bool = False


class SystemPrompt(BaseModel):
    """System prompt configuration."""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Human-readable name")
    content: str = Field(..., description="System prompt content")
    priority: int = Field(default=0, description="Priority for ordering (higher = first)")
    condition: SystemPromptCondition = Field(default_factory=SystemPromptCondition)
    token_format: TokenFormat = Field(default=TokenFormat.PLAIN)


class ModelConfig(BaseModel):
    """Model-specific configuration."""
    model_family: str = Field(..., description="Model family (e.g., claude, gpt, gemini)")
    model_version: Optional[str] = Field(None, description="Specific model version")
    capabilities: List[ModelCapability] = Field(default_factory=list)
    special_tokens: Dict[str, str] = Field(
        default_factory=dict,
        description="Special tokens for this model"
    )
    token_format: TokenFormat = Field(default=TokenFormat.PLAIN)
    optimal_thinking_prompts: List[str] = Field(
        default_factory=list,
        description="Prompts that benefit from thinking mode"
    )
    max_thinking_tokens: Optional[int] = Field(
        None,
        description="Maximum tokens for thinking (if supported)"
    )
    requires_special_formatting: bool = Field(default=False)


class PromptOptimization(BaseModel):
    """Prompt optimization settings."""
    prefer_thinking_mode: bool = Field(
        default=False,
        description="Whether this prompt benefits from thinking/reasoning"
    )
    thinking_instruction: Optional[str] = Field(
        None,
        description="Custom instruction for thinking mode"
    )
    model_preferences: Dict[str, ModelConfig] = Field(
        default_factory=dict,
        description="Preferred configurations per model family"
    )
    fallback_behavior: str = Field(
        default="use_standard",
        description="Behavior when preferred model unavailable"
    )


# Predefined model configurations
PREDEFINED_MODELS = {
    "claude-3-opus": ModelConfig(
        model_family="claude",
        model_version="3-opus",
        capabilities=[
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.VISION,
            ModelCapability.LONG_CONTEXT,
            ModelCapability.STRUCTURED_OUTPUT
        ],
        special_tokens={
            "thinking_start": "<thinking>",
            "thinking_end": "</thinking>",
            "answer_start": "<answer>",
            "answer_end": "</answer>"
        },
        token_format=TokenFormat.ANTHROPIC,
        max_thinking_tokens=100000
    ),
    "gpt-4": ModelConfig(
        model_family="gpt",
        model_version="4",
        capabilities=[
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.VISION,
            ModelCapability.STRUCTURED_OUTPUT
        ],
        special_tokens={},
        token_format=TokenFormat.OPENAI
    ),
    "gemini-pro": ModelConfig(
        model_family="gemini",
        model_version="pro",
        capabilities=[
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.VISION,
            ModelCapability.WEB_SEARCH,
            ModelCapability.CODE_EXECUTION
        ],
        special_tokens={},
        token_format=TokenFormat.GOOGLE
    ),
    "o1": ModelConfig(
        model_family="openai",
        model_version="o1",
        capabilities=[
            ModelCapability.THINKING,
            ModelCapability.LONG_CONTEXT
        ],
        special_tokens={},
        token_format=TokenFormat.OPENAI,
        optimal_thinking_prompts=[
            "complex reasoning",
            "mathematical proof",
            "code architecture",
            "scientific analysis"
        ]
    )
}


def get_model_config(model_name: str) -> Optional[ModelConfig]:
    """Get predefined model configuration."""
    return PREDEFINED_MODELS.get(model_name)


def format_with_special_tokens(
    content: str,
    model_config: ModelConfig,
    mode: str = "standard"
) -> str:
    """Format content with model-specific special tokens."""
    if not model_config.special_tokens:
        return content
    
    if mode == "thinking" and "thinking_start" in model_config.special_tokens:
        return (
            f"{model_config.special_tokens['thinking_start']}\n"
            f"{content}\n"
            f"{model_config.special_tokens['thinking_end']}"
        )
    
    return content


def should_use_thinking_mode(
    prompt: str,
    model_config: ModelConfig,
    optimization: Optional[PromptOptimization] = None
) -> bool:
    """Determine if thinking mode should be used."""
    if ModelCapability.THINKING not in model_config.capabilities:
        return False
    
    if optimization and optimization.prefer_thinking_mode:
        return True
    
    # Check if prompt matches optimal thinking patterns
    prompt_lower = prompt.lower()
    for pattern in model_config.optimal_thinking_prompts:
        if pattern in prompt_lower:
            return True
    
    return False