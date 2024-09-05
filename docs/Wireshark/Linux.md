---
sidebar_position: 3
title: Linux端安装
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


在Lab7/8中，较多同学会选择在WSL上完成实验，此时宿主机WIndows无法捕获WSL内部的网络活动。为了对实现的程序抓包，你将需要在其运行的Linux发行版上安装Wireshark

## 1 安装Wireshark

:::warning 安装要求

为了通过GUI页面操作Wireshark，你需要使用WSL2版本的Linux发行版

:::


### 1.1 打开终端

### 1.2 更新包列表

<Tabs className="unique-tabs"  groupId="operating-systems">
  <TabItem value="基于Debian(Ubuntu, Mint, Kali Linux等)">
    ```
    sudo apt update
    ```
  </TabItem>
  <TabItem value="基于Red Hat(Fedora, CentOS, RHEL等)">
    ```
    sudo yum update
    ```
  </TabItem>
    <TabItem value="基于Arch Linux">
  ```
  sudo pacman -Syy
  ```
  </TabItem>
</Tabs>

### 1.3 安装Wireshark

<Tabs className="unique-tabs"  groupId="operating-systems">
  <TabItem value="基于Debian(Ubuntu, Mint, Kali Linux等)">
    ```
    sudo apt install wireshark
    ```
  </TabItem>
  <TabItem value="基于Red Hat(Fedora, CentOS, RHEL等)">

  ```
  sudo yum install wireshark
  ```
  </TabItem>
  <TabItem value="基于Arch Linux">
  ```
  sudo pacman -S wireshark
  ```
  </TabItem>
</Tabs>


安装完成后，你可能可在开始菜单中看到有Tux角标的Wireshark：

![image-20240905025149526](img/image-20240905025149526.png)



## 2 配置Wireshark权限

:::info

本步骤不是必须的，如果你不想执行该操作，也可选择在每次启动时使用以下命令：

```
sudo wireshark
```

请注意，在Windows中选择以管理员身份启动与以上命令不等效，无法正常进行捕获

:::

由于Wireshark可以捕获网络数据包，通常需要root权限运行，为了简化操作并保证权限安全，你可将使用的用户添加到wireshark用户组

```
sudo usermod -aG wireshark [你的用户名]
```

执行完成后，**关闭当前终端会话**，重新启动终端后再通过命令/Windows快捷方式启动Wireshark即可正常捕获网络数据包