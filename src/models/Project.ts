import { ProjectPlatform } from "./ProjectPlatform";

/**
 * Represents a user's project.
 */
export type Project = {
  id: string;
  name: string;
  image?: string;
  owner: string;
  created: number;
  updated: number;
  platform: ProjectPlatform;
};
