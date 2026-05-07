export interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
  default_branch: string;
  imageUrl?: string;
}
