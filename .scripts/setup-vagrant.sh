#!/bin/bash

KEY_NAME="vagrant_ed25519"
KEY_PATH="$HOME/.ssh/$KEY_NAME"
PROVISION_SCRIPT="scripts/vagrant-provision.sh"

echo "Generating new ED25519 key pair..."
ssh-keygen -t ed25519 -f "$KEY_PATH" -N "" -C "vagrant_root_access_$(date +%Y%m%d_%H%M%S)"

PUBLIC_KEY=$(cat "${KEY_PATH}.pub")

echo "Creating/Updating vagrant-provision.sh..."
cat >"$PROVISION_SCRIPT" <<EOF
#!/bin/bash

# Create .ssh directory for root
mkdir -p /root/.ssh
chmod 700 /root/.ssh

# Copy the authorized_keys from vagrant user to root
cp /home/vagrant/.ssh/authorized_keys /root/.ssh/

# Add the ed25519 public key
echo '$PUBLIC_KEY' >> /root/.ssh/authorized_keys

# Set proper permissions
chmod 600 /root/.ssh/authorized_keys
chown root:root /root/.ssh/authorized_keys

# Configure SSH
sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Restart SSH service
systemctl restart sshd

echo "Root SSH key-based authentication has been configured"
EOF

chmod +x "$PROVISION_SCRIPT"

echo "Setup completed successfully!"
echo "New SSH key generated at: $KEY_PATH"
echo "You can now run 'vagrant up' to start your VM"
if vagrant status | grep -q "running"; then
  VM_IP=$(vagrant ssh -c "hostname -I | cut -d' ' -f1" 2>/dev/null)
  if [ -n "$VM_IP" ]; then
    echo "To connect as root: ssh -i $KEY_PATH root@$VM_IP"
  else
    echo "To connect as root (once VM is running): ssh -i $KEY_PATH root@<vagrant-ip>"
  fi
else
  echo "To connect as root (once VM is running): ssh -i $KEY_PATH root@<vagrant-ip>"
fi
