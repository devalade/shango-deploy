export enum HookType {
  PRE_DEPLOY = 'pre-deploy',
  POST_DEPLOY = 'post-deploy',
  PRE_PROVISION = 'pre-provision',
  POST_PROVISION = 'post-provision',
  PRE_BUILD = 'pre-build',
  POST_BUILD = 'post-build',
  PRE_CONNECT = 'pre-connect',
  DOCKER_SETUP = 'docker-setup'
}

export enum HookContext {
  LOCAL = 'local',
  REMOTE = 'remote'
}

export interface Hook {
  name: string;
  type: HookType;
  script: string;
  context: HookContext;
  condition?: string;
  timeout?: number;
}

export interface HookResult {
  success: boolean;
  output: string;
  error?: Error;
  duration: number;
}

export class HookError extends Error {
  constructor(
    message: string,
    public hook: Hook,
    public result?: HookResult
  ) {
    super(message);
    this.name = 'HookError';
  }
}
