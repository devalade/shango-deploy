# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2204"  
  config.vm.network "forwarded_port", guest: 22, host: 2200
  config.vm.network "private_network", ip: "192.168.56.10"
  
  config.vm.provider :libvirt do |libvirt|
    libvirt.memory = 2048
    libvirt.cpus = 2
    
    libvirt.storage :file,
      size: '20G',
      type: 'qcow2',
      bus: 'virtio',
      cache: 'writeback'
    
  end

  # config.vm.synced_folder ".", "/vagrant", type: "nfs"
  
  config.vm.hostname = "ubuntu-dev"
end
