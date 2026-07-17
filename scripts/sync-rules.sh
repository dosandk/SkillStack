#!/usr/bin/env bash

mkdir -p .cursor/rules

for file in .agents/rules/*.md; do
    name=$(basename "$file" .md)
    cp "$file" ".cursor/rules/$name.mdc"
done
