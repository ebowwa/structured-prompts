#!/usr/bin/env python3
"""
Test script to verify all fixes in structured-prompts v0.1.2
"""

import sys
import warnings
from io import StringIO

# Capture warnings
warnings.simplefilter("always")
warning_buffer = StringIO()


def test_pydantic_v2_compatibility():
    """Test 1: No Pydantic v2 warnings"""
    print("Test 1: Pydantic v2 Compatibility")
    print("-" * 40)
    
    # Redirect warnings to our buffer
    old_stderr = sys.stderr
    sys.stderr = warning_buffer
    
    try:
        # Import should not produce warnings
        from structured_prompts import PromptSchema, PromptResponse
        
        # Create instances
        schema = PromptSchema(
            prompt_id="test",
            prompt_type="test",
            prompt_text="Test prompt"
        )
        
        response = PromptResponse()
        
        # Check for warnings
        warnings_text = warning_buffer.getvalue()
        
        if "allow_population_by_field_name" in warnings_text:
            print("✗ FAIL: Pydantic v1 config warning still present")
            print(f"  Warning: {warnings_text[:100]}")
            return False
        else:
            print("✓ PASS: No Pydantic v2 warnings")
            return True
            
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False
    finally:
        sys.stderr = old_stderr


def test_field_naming():
    """Test 2: Field naming is consistent"""
    print("\nTest 2: Field Naming Consistency")
    print("-" * 40)
    
    try:
        from structured_prompts import PromptSchema
        
        # Create a schema
        schema = PromptSchema(
            prompt_id="test",
            prompt_type="test_type",
            prompt_text="Test prompt text"
        )
        
        # Test field access
        tests = [
            ("prompt_id", "test"),
            ("prompt_type", "test_type"),
            ("prompt_text", "Test prompt text"),
        ]
        
        all_passed = True
        for field_name, expected_value in tests:
            try:
                actual_value = getattr(schema, field_name)
                if actual_value == expected_value:
                    print(f"  ✓ {field_name}: '{actual_value}'")
                else:
                    print(f"  ✗ {field_name}: expected '{expected_value}', got '{actual_value}'")
                    all_passed = False
            except AttributeError as e:
                print(f"  ✗ {field_name}: Field not accessible - {e}")
                all_passed = False
        
        if all_passed:
            print("✓ PASS: All fields accessible with correct names")
        else:
            print("✗ FAIL: Field naming issues detected")
        
        return all_passed
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False


def test_simplified_api():
    """Test 3: API is simplified with sensible defaults"""
    print("\nTest 3: Simplified API")
    print("-" * 40)
    
    try:
        from structured_prompts import PromptSchema, PromptResponse
        
        # Test minimal schema creation (only required fields)
        minimal_schema = PromptSchema(
            prompt_id="minimal",
            prompt_type="test",
            prompt_text="Minimal prompt"
        )
        
        print("  Minimal schema created with only 3 fields")
        print(f"    - response_schema default: {minimal_schema.response_schema}")
        print(f"    - is_public default: {minimal_schema.is_public}")
        print(f"    - usage_count default: {minimal_schema.usage_count}")
        
        # Test minimal response creation
        minimal_response = PromptResponse()
        
        print("\n  Minimal response created with NO required fields")
        print(f"    - Auto-generated ID: {minimal_response.response_id[:20]}...")
        print(f"    - Created at: {minimal_response.created_at}")
        print(f"    - Raw response default: {minimal_response.raw_response}")
        
        print("\n✓ PASS: API successfully simplified")
        return True
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False


def test_optional_fields():
    """Test 4: Most fields are now optional"""
    print("\nTest 4: Optional Fields")
    print("-" * 40)
    
    try:
        from structured_prompts import PromptSchema, PromptResponse
        
        # Count required vs optional fields
        import inspect
        from typing import get_type_hints
        
        # Check PromptSchema
        schema_hints = get_type_hints(PromptSchema)
        schema_fields = PromptSchema.model_fields
        
        required_count = 0
        optional_count = 0
        
        for field_name, field_info in schema_fields.items():
            if field_info.is_required():
                required_count += 1
                print(f"  Required: {field_name}")
            else:
                optional_count += 1
        
        print(f"\n  PromptSchema: {required_count} required, {optional_count} optional")
        
        # Check PromptResponse
        response_fields = PromptResponse.model_fields
        
        resp_required = 0
        resp_optional = 0
        
        for field_name, field_info in response_fields.items():
            if field_info.is_required():
                resp_required += 1
            else:
                resp_optional += 1
        
        print(f"  PromptResponse: {resp_required} required, {resp_optional} optional")
        
        if required_count <= 3 and resp_required == 0:
            print("\n✓ PASS: Successfully reduced required fields")
            return True
        else:
            print("\n✗ FAIL: Too many required fields")
            return False
            
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("Testing structured-prompts v0.1.2 Fixes")
    print("=" * 60)
    
    tests = [
        test_pydantic_v2_compatibility,
        test_field_naming,
        test_simplified_api,
        test_optional_fields,
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for r in results if r)
    total = len(results)
    
    print(f"\nPassed: {passed}/{total} tests")
    
    if passed == total:
        print("✅ All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1


if __name__ == "__main__":
    # Need to add src to path
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
    
    exit_code = main()
    sys.exit(exit_code)