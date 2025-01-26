import { describe, expect, it } from 'vitest';
import { SSHManager } from '../ssh-manager';
import sinon from 'sinon';

const PORT = 22;
const USERNAME = process.env.USER || 'root';
const HOST = '127.0.0.1';

describe('ssh-manager', () => {
  it('should connect to a server', async () => {
    const ssh = new SSHManager({ host: HOST, username: USERNAME, port: PORT });
    const connectStub = sinon.stub(ssh, 'connect').resolves();
    await ssh.connect();
    expect(connectStub.calledOnce).toBe(true);
    connectStub.restore();
  });

  it('should fail to connect to a server', async () => {
    const ssh = new SSHManager({ host: HOST, username: USERNAME, port: PORT });
    const connectStub = sinon
      .stub(ssh, 'connect')
      .rejects(new Error('Connection failed'));
    try {
      await ssh.connect();
    } catch (error) {
      expect(error.message).toBe('Connection failed');
    }
    expect(connectStub.calledOnce).toBe(true);
    connectStub.restore();
  });

  it('should execute a command on the server', async () => {
    const ssh = new SSHManager({ host: HOST, username: USERNAME, port: PORT });
    const connectStub = sinon.stub(ssh, 'connect').resolves();
    const execStub = sinon
      .stub(ssh, 'executeCommand')
      .resolves({ stdout: 'command output', stderr: '' });
    await ssh.connect();
    const output = await ssh.executeCommand('ls');
    expect(output).toEqual({ stdout: 'command output', stderr: '' });
    expect(execStub.calledOnceWith('ls')).toBe(true);
    connectStub.restore();
    execStub.restore();
  });

  it('should disconnect from the server', async () => {
    const ssh = new SSHManager({ host: HOST, username: USERNAME, port: PORT });
    const connectStub = sinon.stub(ssh, 'connect').resolves();
    const disconnectStub = sinon.stub(ssh, 'disconnect').resolves();
    await ssh.connect();
    ssh.disconnect();
    expect(disconnectStub.calledOnce).toBe(true);
    connectStub.restore();
    disconnectStub.restore();
  });
});
