TODO: 

- allow optional additional messages to be passed; these messages are currently the prompt_text but this needs better naming

- we need to add an additional `model_instruction` alongside the `prompt_text`, `response_schema`, and `prompt_type`

current schema: 

```
# @models.py#L10-15 
class PromptSchema(BaseModel):
    """Schema for prompt configuration"""
    prompt_type: str = Field(..., description="Unique identifier for the prompt type")
    prompt_text: str = Field(..., description="The actual prompt text")
    response_schema: Dict = Field(..., description="JSON schema for validating responses")
    created_at: Optional[int] = Field(None, description="Creation timestamp")
    updated_at: Optional[int] = Field(None, description="Last update timestamp")
```





lets think this from first principles, lets have prompt_type rename to prompt_title, lets add prompt_description, prompt_categories, is_public, last used, created_at, created_by, ranking, last_updated, last_updated_by



ideally this library can be used accross llm providers and locally since it should be easy to do this given its all just text and json shared across providers

it will be challenging bc the providers have different formats, but we can have a generic format that can be used accross providers