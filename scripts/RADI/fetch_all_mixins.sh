#!/bin/bash

# Path to colcon_mixins files
TARGET_DIR="colcon_mixins"

# Create folder
mkdir -p "$TARGET_DIR"

echo "🔽 Download index.yaml..."
curl -sSL https://raw.githubusercontent.com/colcon/colcon-mixin-repository/master/index.yaml -o "$TARGET_DIR/index.yaml"

# Verify download was  successful
if [ ! -f "$TARGET_DIR/index.yaml" ]; then
    echo "❌ Erro: index.yaml wasn't downloaded successfuly."
    exit 1
fi

echo "🔍 Reading mixins of index.yaml..."

# Extract files' name .mixin listed in index.yaml
MIXIN_FILES=$(grep -oE '[a-z0-9\-]+\.mixin' "$TARGET_DIR/index.yaml")

if [ -z "$MIXIN_FILES" ]; then
    echo "❌ No mixin was found in index.yaml."
    exit 1
fi

# Download each .mixin
for file in $MIXIN_FILES; do
    echo "📥 Baixando $file..."
    curl -sSL "https://raw.githubusercontent.com/colcon/colcon-mixin-repository/master/$file" -o "$TARGET_DIR/$file"

    if [ $? -ne 0 ]; then
        echo "⚠️  Falha ao baixar $file"
    fi
done

echo "✅ ALL mixins downloaded  '$TARGET_DIR'"
