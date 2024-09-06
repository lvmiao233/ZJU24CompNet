---
sidebar_position: 1
title: 安装与配置汇总
---
import React from 'react';
import {Card} from 'antd';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export const LinkCard = ({title, url, children}) => (
  <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
    <Card title={title} to={url}>{children}</Card>
  </a>
);


## 1 安装Wireshark

请根据你的设备平台，阅读相应的安装指导：

<Tabs className="unique-tabs">
  <TabItem value="Windows">
    <LinkCard title="Windows端安装" url="../wireshark/Windows">本文将引导你在运行Windows的设备上下载并安装Wireshark，点击跳转至相应文档</LinkCard>
  </TabItem>
  <TabItem value="Linux">
    <LinkCard title="Linux端安装" url="../wireshark/Linux">本文将引导你在运行不同Linux发行版的设备上安装Wireshark并配置权限，点击跳转至相应文档</LinkCard>
  </TabItem>
  <TabItem value="macOS">
    <LinkCard title="macOS端安装" url="../wireshark/mac">本文将引导你在macOS设备上下载安装Wireshark并配置权限，点击跳转至相应文档</LinkCard>
  </TabItem>
</Tabs>


## 2 WireShark上手应用

:::warning 启动前注意事项
建议在启动Wireshark前关闭VPN，避免对数据包抓取产生干扰
建议尽可能多地关闭当前使用网络的应用程序，或直接运行在虚拟环境中，以免无关数据包影响分析
:::

## 3 Wireshark使用延伸