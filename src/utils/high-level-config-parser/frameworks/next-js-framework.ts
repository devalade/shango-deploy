import { FrameworkConfig } from "../../../types/index.js";

export class NextJSFramework implements FrameworkConfig {
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

