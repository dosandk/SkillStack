#!/bin/bash

SESSION="skillstack"

# connect if session exists 
if tmux has-session -t "$SESSION" 2>/dev/null; then
    tmux attach-session -t "$SESSION"
    exit 0
fi

# Create session and first window
tmux new-session -d -s "$SESSION" -n firebase

# Firebase
tmux send-keys -t "${SESSION}:firebase" \
    'npm run emulators' C-m

# CLI
tmux new-window -t "$SESSION" -n cli
tmux send-keys -t "${SESSION}:cli" \
    'cd cli && npm run dev' C-m

# Functions
tmux new-window -t "$SESSION" -n functions
tmux send-keys -t "${SESSION}:function" \
    'cd functions && npm run dev' C-m

# Client
tmux new-window -t "$SESSION" -n client
tmux send-keys -t "${SESSION}:client" \
    'npm run dev' C-m

# connect
tmux attach-session -t "$SESSION"
