import { Template } from "../../template.js";
import { Framework, FrameworkConfig } from "../../../types/index.js";

export class NextJSFramework implements FrameworkConfig {
  constructor() {
    const template = new Template({ framework: Framework.NEXTJS, dockerfile: true, githubAction: true });
    template.generate();
    this.displayAditionalInstructions();
  }

  getAssetPath(): string {
    return '/app/.next';
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

  displayAditionalInstructions(): void {
    console.log(
      'NextJS framework configuration.\n',
      'Add this  output: \'standalone\' to your next.config.ts\n',
    );
  }

}

