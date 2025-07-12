#!/bin/bash

# JoRA Quick Install Script
# Downloads and installs JoRA binary for your project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 JoRA Quick Install${NC}"
echo "================================"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $OS in
    linux)
        BINARY_NAME="jora-linux"
        ;;
    darwin)
        BINARY_NAME="jora-mac"
        ;;
    mingw*|msys*|cygwin*)
        BINARY_NAME="jora-win.exe"
        ;;
    *)
        echo -e "${RED}❌ Unsupported OS: $OS${NC}"
        exit 1
        ;;
esac

echo -e "${YELLOW}📋 Detected OS: $OS${NC}"
echo -e "${YELLOW}🏗️  Binary: $BINARY_NAME${NC}"

# Create tools directory if it doesn't exist
mkdir -p tools

# Download binary (replace with your actual GitHub releases URL)
DOWNLOAD_URL="https://github.com/your-username/JoRA/releases/latest/download/$BINARY_NAME"
BINARY_PATH="tools/jora"

if command -v curl >/dev/null 2>&1; then
    echo -e "${YELLOW}📥 Downloading JoRA binary...${NC}"
    curl -L -o "$BINARY_PATH" "$DOWNLOAD_URL"
elif command -v wget >/dev/null 2>&1; then
    echo -e "${YELLOW}📥 Downloading JoRA binary...${NC}"
    wget -O "$BINARY_PATH" "$DOWNLOAD_URL"
else
    echo -e "${RED}❌ Neither curl nor wget found. Please install one of them.${NC}"
    echo -e "${YELLOW}💡 Or manually download $BINARY_NAME to tools/jora${NC}"
    exit 1
fi

# Make binary executable
chmod +x "$BINARY_PATH"

echo -e "${GREEN}✅ JoRA installed successfully!${NC}"
echo ""
echo -e "${BLUE}🚀 Quick Start:${NC}"
echo "  1. Initialize: ${YELLOW}./tools/jora init${NC}"
echo "  2. Start:      ${YELLOW}./tools/jora${NC}"
echo ""
echo -e "${BLUE}📖 Commands:${NC}"
echo "  ${YELLOW}./tools/jora init${NC}      - Initialize JoRA in current project"
echo "  ${YELLOW}./tools/jora${NC}           - Start web interface"
echo "  ${YELLOW}./tools/jora status${NC}    - Show project status"
echo "  ${YELLOW}./tools/jora --help${NC}    - Show all available commands"
echo ""
echo -e "${GREEN}🎯 Happy task management!${NC}"
