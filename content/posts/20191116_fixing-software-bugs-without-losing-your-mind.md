---
title: Fixing software bugs without losing your mind
date: 2019-11-16
url: /posts/20191116_fixing-software-bugs-without-losing-your-mind/
oldUrl: /brendan/posts/20191116_fixing-software-bugs-without-losing-your-mind/
tags:
  - Career
  - Development
  - Debugging
  - Health
---

Software is created by humans, who all make mistakes, get distracted, misunderstand things and lose focus. This is unavoidable.

Every new line of code is likely to introduce new bugs in a system. We have testing processes, but these can never guarantee a bug-free system.

So how should a developer react to a new bug report? I'll try to cover my general thought process below.

## Step 1: Information Gathering

- What is the impact of this bug?
- When does this bug need to be fixed?
- Which area(s) of the system are/is affected?
- Is the whole system not working because of this?
- Is the issue isolated to a certain type of user?
- Has this issue been validated by the reporter themselves?
- What is the process you have to go through to experience this bug?
- What should the system do instead of what it currently does?

## Step 2: Assessment

- Do I need help with this?
- How important is this bug?
- Should I finish my current task or work on this bug right now?
- Who can help me fix this bug?
- Do I have what I need to start working on this?

## Step 3: Communication

- Make it clear you've received the bug report
- Explain when you'll be working on fixing it
- Give an expectation of when you think you can fix the issue

## Step 4: Issue Resolution

- If a temporary fix can be applied, do that first. This will give you more time to work on a more robust solution in a more relaxed timeline
- Focus on fixing the reported issue
- Go through the process from the bug report
- Add debugging statements through-out this process
- Apply the least amount of change to the system that you can

## Step 5: Reporting

- Update the bug report with a high-level summary of the changes made to fix the bug
- Ask the reporter to confirm the issue is now fixed
- Update your technical documentation, such as code comments

## Step 6: Reflection

- Assess how this bug was introduced into the system
- How did this get through testing?
- Should the testing process be updated to cover issues like this in the future?
- What was learnt in the process of fixing this bug?
- What should have been done differently to avoid this?
- Remind yourself that all-things-considered, you have people that care for you and this bug was not the end of the world as we know it
