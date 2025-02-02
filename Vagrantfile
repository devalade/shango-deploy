# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Using Ubuntu 22.04 LTS (Jammy Jellyfish)
  config.vm.box = "ubuntu/jammy64"
  
  # Network configuration
  # Forward SSH port to avoid conflicts with host machine
  config.vm.network "forwarded_port", guest: 22, host: 2200
  
  # Private network with static IP (easier for SSH access)
  config.vm.network "private_network", ip: "192.168.56.10"
  
  # VM configuration
  config.vm.provider "virtualbox" do |vb|
    # Give the VM a name
    vb.name = "ubuntu_dev_server"
    
    # Allocate resources
    vb.memory = 2048  # 2GB RAM
    vb.cpus = 2       # 2 CPU cores
    
    # Enable GUI if needed (default is headless)
    vb.gui = false
  end
  
  # Basic provisioning
  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get upgrade -y
    # Install some basic utilities
    apt-get install -y vim curl git
  SHELL
end
