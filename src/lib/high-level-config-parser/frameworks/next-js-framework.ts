import { Framework, FrameworkConfig } from "../../../types/index.js";
import { template } from "../../../util/template.js";

export class NextJSFramework implements FrameworkConfig {
  constructor() {
    template(Framework.NEXTJS, { dockerfile: true });
  }

  getAssetPath(): string {
    return '/app/.next'
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      NODE_ENV: 'production',
      PORT: '3000'
    };
  }

  getAccessories(): Record<string, any> {
    return {};
  }

  getAppPort(): number {
    return 3000;
  }

}

