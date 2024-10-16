---
sidebar_position: 12
title: Cisco IOS 指令汇总
---

## 基础功能

* 进入特权模式：`enable`；该模式下才能查看重要信息，并可进入配置模式
* 进入配置模式：`configure terminal`；在这个模式下才可以修改配置
* 进入到某个接口的配置模式：`interface 接口名 模块号/端口号`，例如`interface ethernet 0/1`
* 启用接口：`no shutdown`
* 命令可以不输全，只要能够被唯一识别
* 输入？可以显示当前上下文环境下可用命令
* 在命令后面输入？可以显示命令的参数提示
* 输入命令的前一部分，再按`tab`，可以自动完成完整的命令输入
* 按上箭头可以重复输入上次打过的命令
* 鼠标左键选择需要截取的文本内容，鼠标右键粘贴复制好的文本的内容
* 显示运行配置：`show running-config`
* 指定源地址Ping测试：`ping [目标IP地址] source [源IP地址]`
* 持续Ping：`ping [ip地址] -t`
* 创建子接口：`interface [type] [slot/unit.sub]` 如`interface e0/1.1`
* 配置路由器接口IP与掩码：`ip address [IP地址] [掩码]`

## VLAN配置
* 配置VLAN接口IP：`interface vlan [VLAN编号]`，`ip address [IP地址]`
* 切换接口所属VLAN：`switchport access vlan [VLAN编号]`
* 配置子接口VLAN：`encapsulation dot1q [VLAN编号]`
* 将接口配置为trunk模式：`switchport mode trunk`


## DHCP服务
* 定义第一个子网的DHCP地址池：`ip dhcp pool [地址池编号]`
* 定义DHCP网络地址： `network [IP地址] / [子网掩码长度]`
* 定义DHCP默认网关： `default-router [默认路由器IP地址]`
* 启动DHCP服务： `service dhcp`
* 指定接口通过DHCP动态获取IP：`ip address dhcp`

## NAT服务
* 定义内部接口：`interface fa0/1`, `ip nat inside`，假设fa0/1是连接内部网络的接口
* 定义外部接口：`interface fa0/0`，`ip nat outside`，假设fa0/0是连接外部网络的接口
* 设置访问控制列表：`access-list 1 permit 192.168.0.0  0.0.0.255`，允许网络（假设是192.168.0.0/24）向外访问
* 定义从内到外的访问需要进行源地址转换，使用路由器的外部接口地址作为转换后的外部地址：`ip nat inside source list 1 interface fa0/0 overload`
* 显示NAT信息：`show ip nat translation`

## 数据链路层协议
* 设置数据链路层协议为HDLC：`encapsulation hdlc`
* 设置时钟速率：`clock rate [速率值]`
* 设置数据链路层协议为PPP：`encapsulation ppp`
* 设置PPP认证模式为CHAP：`ppp authentication chap`
* 设置PPP认证用户名和密码：`username [用户名] password [密码]`

## 路由配置

### 静态路由
* 查看路由表内容： `show ip route`
* 为三层交换机启用路由功能：`ip route`
* 设置默认路由：`ip route 0.0.0.0 0.0.0.0 [默认路由器IP地址]`

### RIP

* 在路由器上启用RIP协议：`Router(config)# router rip`
* 将路由器各接口（子网）加入路由宣告：`Router(config-router)# network [ip_net]`

### OSPF

* 给路由器的回环接口配置地址

  ```
  Router(config)# interface loopback 0
  Router(config-if)# ip address [ip] [mask]
  ```

* 在路由器上启用OSPF协议：`Router(config)# router ospf [process-id]`

* 配置路由器接口（子网）所属Area ID：`Router(config-router)# network [ip_net] [mask] area [area-id]`
* 查看路由器的OSPF数据库（可以查看Router ID）：`Router# show ip ospf database`
* 手工指定Router ID
  * `Router(config-router)# router-id x.x.x.x`
  * 更换Router ID需要重启路由器或清除OSPF状态才能生效, 其中
    * 重启路由器命令：`Router# reload`
    * 清除OSPF状态命令：`Router# clear ip ospf process`

* 观察各路由器的OSPF邻居关系，在广播网络中，为减少通信量，会自动选出一个DR（Designated Router）和一个BDR（Backup Designated Router）,其他路由器只与DR、BDR成为邻接关系。`Router# show ip ospf neighbor detail`
* 观察路由器的OSPF接口状态（可以查看cost值）：`Router# show ip ospf interface`
* 打开事件调试，实时显示路由器之间交换的路由信息事件：`Router# debug ip ospf events`
* 观察完毕后，可以关闭调试信息显示：`Router# no debug ip ospf events`
* 在两个区域边界路由器之间建立虚链路，[area-id]填写用于传递数据的区域ID，[router ID]分别设为对方的Router ID：`Router(config-router)# area [area-id] virtual-link [router ID]`
* 在区域边界路由器上手工进行路由合并：`Router(config-router)# area [area-id] range [ip_net] [mask]`

### BGP

* 在路由器R1上启用BGP协议, 设置AS号，并宣告直连网络

  ```
  R1(config)# router bgp [AS-Number]
  R1(config-router)# network x.x.x.x mask x.x.x.x
  ```

* 把对方增加为AS内部的邻居（AS-Number设置为相同的AS号）：`R1(config-router)# neighbor [IP-Address] remote-as [AS-Number]`

* 对方增加为AS间的邻居（IP-Address为对方的IP，AS-Number设置为对方的AS号）：`R1(config-router)# neighbor [IP-Address] remote-as [AS-Number]`

* 查看邻居关系：`R1# show ip bgp neighbor`

* 打开bgp调试：`R1# debug ip bgp`

* 查看BGP数据库：` R1# show ip bgp`

* 启用BGP同步功能：`R1(config-router)# synchronization`

* 设置BGP更新源为回环接口（IP-Addr设置为对方的回环口IP）：`R1(config-router)# neighbor [IP-Addr] update-source loopback 0`

* 在BGP中启用路由重分发功能，从OSPF中重分发路由信息：

  ```
  R1(config)# router bgp [AS-Number]
  R1(config-router)# redistribute ospf [process-id]
  ```

* 在OSPF中启用重分发功能，从BGP中重分发路由信息：

  ```
  R1(config)# router ospf [process-id] 
  R1(config-router)# redistribute bgp [AS-Number] subnets
  ```

* 聚合路由（summary-only参数的含义是只传递聚合后的路由，as-set参数的含义是在传播网络时加上AS属性，避免出现循环路由）：`R1(config-route)# aggregate-address [ip network] [subnet mask] summary-only as-set`

* 设置允许多条路径：`R1(config-route)# maximum-paths 2`