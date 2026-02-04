#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function toSlug(input) {
  return input
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", ...options });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: scripts/new-post.mjs "Your Post Title"');
  process.exit(1);
}

const slug = toSlug(title);
if (!slug) {
  console.error("Unable to create a slug from the provided title.");
  process.exit(1);
}

const repoRoot = process.cwd();
const postsDir = path.join(repoRoot, "content", "posts", slug);
const mdxPath = path.join(postsDir, "index.mdx");
const branchName = `content/${slug}`;

if (fs.existsSync(postsDir)) {
  console.error(`Post folder already exists: ${postsDir}`);
  process.exit(1);
}

const branchCheck = spawnSync("git", ["show-ref", "--verify", "--quiet", `refs/heads/${branchName}`]);
if (branchCheck.status === 0) {
  console.error(`Branch already exists: ${branchName}`);
  process.exit(1);
}

run("git", ["switch", "-c", branchName], { cwd: repoRoot });

fs.mkdirSync(postsDir, { recursive: true });

const today = formatDate(new Date());
const template = `---
title: "${title.replace(/"/g, '\\"')}"
slug: "${slug}"
date: ${today}
tags:
heroImage:
---

{/* excerpt */}

`;

fs.writeFileSync(mdxPath, template, "utf8");

console.log(`Created ${mdxPath}`);
