// src/types/github.ts
export interface Repository {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    languages_url: string;
    languages: Record<string, number> | null;
    pushed_at: string;
    default_branch: string;
    readme_preview: string | null;
  }
  
  export interface CacheMetadata {
    last_updated: string;
    repo_count: number;
  }
  
  export interface ExpandedRepo {
    id: number;
    readme: string | null;
    loading: boolean;
  }