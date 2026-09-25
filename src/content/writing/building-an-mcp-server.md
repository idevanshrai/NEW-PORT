---
title: What I learned building an MCP server for Claude
date: 2026-10-01
summary: Designing tools a language model can actually use — notes from LeaveManager.
draft: true
---

> This is a starter draft. It only shows up while you run `npm run dev`.
> Rewrite it in your own words, then change `draft: true` to `draft: false` to publish.

## Why I built it

A sentence or two on what made you want to try MCP.

## The three tools

`get_leave_balance`, `apply_leave` and `get_leave_history` — why these three, and why dates instead of ranges.

```python
@mcp.tool()
def apply_leave(employee_id: str, leave_dates: list[str]) -> str:
    ...
```

## What surprised me

What did Claude get wrong at first? What did you change in the tool names or descriptions to fix it?

## What I'd do next

Approvals, persistence, roles.
