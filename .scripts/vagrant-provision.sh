#!/bin/bash

mkdir -p /root/.ssh
chmod 700 /root/.ssh

cp /home/vagrant/.ssh/authorized_keys /root/.ssh/

echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINj0KKo4TrLUhhWYVtRhwP39jHhrIuo9O0Qi1vVHc5jy vagrant_root_access_20250216_004906' >>/root/.ssh/authorized_keys

chmod 600 /root/.ssh/authorized_keys
chown root:root /root/.ssh/authorized_keys

sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

systemctl restart sshd

echo "Root SSH key-based authentication has been configured"
