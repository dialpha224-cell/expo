#!/usr/bin/env python3
"""
AfroCrown - Pre-deployment verification script
Run this script before deploying to production.
"""

import os
import sys
from pathlib import Path

def check_env_vars():
    """Check required environment variables"""
    required_vars = [
        "MONGO_URL",
        "DB_NAME", 
        "STRIPE_API_KEY",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "RESEND_API_KEY"
    ]
    
    missing = []
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print(f"❌ Missing environment variables: {', '.join(missing)}")
        return False
    print("✅ All required environment variables are set")
    return True

def check_files():
    """Check required files exist"""
    required_files = [
        "server.py",
        "requirements.txt",
        "Procfile"
    ]
    
    missing = []
    for f in required_files:
        if not Path(f).exists():
            missing.append(f)
    
    if missing:
        print(f"❌ Missing files: {', '.join(missing)}")
        return False
    print("✅ All required files exist")
    return True

def check_dependencies():
    """Check if key dependencies are installed"""
    try:
        import fastapi
        import motor
        import stripe
        import cloudinary
        print("✅ Key dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        return False

def main():
    print("=" * 50)
    print("AfroCrown Pre-Deployment Check")
    print("=" * 50)
    print()
    
    checks = [
        ("Environment Variables", check_env_vars),
        ("Required Files", check_files),
        ("Dependencies", check_dependencies)
    ]
    
    all_passed = True
    for name, check_func in checks:
        print(f"\n📋 Checking {name}...")
        if not check_func():
            all_passed = False
    
    print()
    print("=" * 50)
    if all_passed:
        print("✅ All checks passed! Ready for deployment.")
        sys.exit(0)
    else:
        print("❌ Some checks failed. Please fix before deploying.")
        sys.exit(1)

if __name__ == "__main__":
    main()
