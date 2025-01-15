import { Hook, HookType } from './types.js';

export class HookRegistry {
  private static instance: HookRegistry;
  private hooks: Map<HookType, Hook[]>;

  private constructor() {
    this.hooks = new Map();
  }

  static getInstance(): HookRegistry {
    if (!HookRegistry.instance) {
      HookRegistry.instance = new HookRegistry();
    }
    return HookRegistry.instance;
  }

  register(hook: Hook): void {
    const hooks = this.hooks.get(hook.type) || [];
    hooks.push(hook);
    this.hooks.set(hook.type, hooks);
  }

  getHooks(type: HookType): Hook[] {
    return this.hooks.get(type) || [];
  }

  clear(): void {
    this.hooks.clear();
  }
}
