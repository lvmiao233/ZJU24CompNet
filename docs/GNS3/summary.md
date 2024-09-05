---
sidebar_position: 1
title: GNS3安装与配置总指引
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


### 1 安装GNS3 客户端

  GNS3客户端是提供GNS3服务器的运行环境，它负责运行GNS3服务器，并管理与GNS3服务器与客户端之间的通信。


    <LinkCard title="GNS3 客户端安装" url="../GNS3/client">本文将引导你在运行Windows的设备上下载并安装GNS3 客户端，点击跳转至相应文档</LinkCard>



## 2  配置GNS3 VM

