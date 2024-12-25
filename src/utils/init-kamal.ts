import { execSync } from 'child_process';

function isKamalInstalled(): boolean {
  try {
    execSync('kamal --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function installKamal(): void {
  console.log('Kamal is not installed. Installing Kamal...');
  const os = process.platform;

  try {
    if (os === 'darwin') {
      execSync(`echo "alias kamal='docker run -it --rm -v \\"\\\${PWD}:/workdir\\" -v \\"/run/host-services/ssh-auth.sock:/run/host-services/ssh-auth.sock\\" -e SSH_AUTH_SOCK=\\"/run/host-services/ssh-auth.sock\\" -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/basecamp/kamal:latest'" >> ~/.bash_profile && source ~/.bash_profile`, { stdio: 'inherit' });
    } else if (os === 'linux') {
      execSync(`echo "alias kamal='docker run -it --rm -v \\"\\\${PWD}:/workdir\\" -v \\"\\\${SSH_AUTH_SOCK}:/ssh-agent\\" -v /var/run/docker.sock:/var/run/docker.sock -e \\"SSH_AUTH_SOCK=/ssh-agent\\" ghcr.io/basecamp/kamal:latest'" >> ~/.bashrc && source ~/.bashrc`, { stdio: 'inherit' });
    } else {
      console.error('Unsupported OS. Please install Kamal manually.');
      process.exit(1);
    }

    console.log('Kamal installed successfully.');
  } catch (error) {
    console.error('Error installing Kamal:', error);
    process.exit(1);
  }
}

function isDockerInstall(): boolean {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export async function init(): Promise<void> {
  if (!isDockerInstall()) {
    console.error("Docker is not installed on your machine.");
  }
  try {
    if (!isKamalInstalled()) {
      installKamal();
      console.log('Kamal is installed and ready to use.');
    }
    execSync('kamal init', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
}
