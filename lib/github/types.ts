/** Subconjunto da API do GitHub que este projeto consome. Só os campos usados. */

export interface GitHubUser {
  login: string;
  name: string | null;
  type: "User" | "Organization" | string;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  fork: boolean;
  archived: boolean;
  created_at: string;
  pushed_at: string | null;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
    type: string;
  };
}

export interface GitHubContributor {
  login: string;
  contributions: number;
  avatar_url: string;
  type: string;
}
