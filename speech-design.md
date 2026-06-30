**语音识别翻译系统**

Speech Recognition & Translation System

**需求分析与开发设计文档**

版本：V1.0

日期：2026年6月25日

状态：初稿

文档密级：内部

目录
====

第一章 项目概述
===============

1.1 项目背景
------------

随着全球化进程的加速，跨语言交流的需求日益增长。语音作为人类最自然的交流方式，其自动识别与翻译技术具有广泛的应用前景------从国际会议的同声传译、海外旅行的实时翻译，到多语言客服系统、外语学习辅助工具等场景。

近年来，深度学习技术在语音识别（ASR）和神经机器翻译（NMT）领域取得了突破性进展。OpenAI
Whisper
通过大规模弱监督训练实现了接近人类水平的语音识别能力；Helsinki-NLP
OPUS-MT 和 Meta M2M100
在多语言翻译任务上表现优异。这些开源模型的成熟，使得构建一套高质量、低成本的语音翻译系统成为可能。

本项目旨在整合成熟的 ASR 和 NMT
模型，开发一套完整的语音识别翻译系统，提供从音频输入到译文输出的端到端服务，同时针对资源受限的部署环境进行深度优化。

1.2 项目目标
------------

本项目的核心目标是构建一个功能完整、性能优异的语音识别翻译系统，具体目标包括：

-   实现高准确率的多语言语音识别，支持中、英、日、韩等主要语言

-   实现高质量的神经机器翻译，首期支持中英双向翻译

-   构建用户友好的 Web 界面，支持实时录音和文件上传两种输入方式

-   对深度学习模型进行压缩和优化，使系统可在 CPU 环境下高效运行

-   采用微服务架构，保证系统的可扩展性和可维护性

-   提供完整的 Docker 容器化部署方案，实现一键部署

1.3 适用范围
------------

本系统适用于以下典型场景：

-   跨语言会议沟通：实时将演讲者语音识别并翻译为参会者母语

-   外语学习辅助：将外语音频转写为文本并提供母语翻译对照

-   国际客服中心：支持多语言客户语音的识别与翻译

-   音视频内容翻译：为视频/音频文件生成多语言字幕

1.4 术语定义
------------

  ------------------- ----------------- ------------------------------------------------------
  **术语**            **英文**          **说明**
  **语音识别**        ASR               将语音信号转换为文本的技术
  **机器翻译**        NMT               基于神经网络的自动翻译技术
  **编码器-解码器**   Encoder-Decoder   Transformer 核心架构，编码器提取特征，解码器生成输出
  **词错误率**        WER               Word Error Rate，语音识别准确率的核心评价指标
  **量化**            Quantization      将模型参数从 FP32 压缩为 INT8，降低计算和存储开销
  ------------------- ----------------- ------------------------------------------------------

第二章 需求分析
===============

2.1 功能需求
------------

### 2.1.1 语音输入模块

-   FR-01：系统应支持通过浏览器麦克风实时录音，录音时长上限 10 分钟

-   FR-02：系统应支持上传音频文件，支持格式包括 WAV、MP3、FLAC、M4A、OGG

-   FR-03：系统应在上传/录音后对音频进行格式校验和预处理（重采样至
    16kHz、单声道转换）

-   FR-04：系统应支持手动选择源语言，也支持自动检测语言（Auto-Detect
    模式）

### 2.1.2 语音识别模块（ASR）

-   FR-05：系统应能将输入音频转换为对应语言的文本，输出带时间戳的分段结果

-   FR-06：支持语言包括：中文、英文、日文、韩文、法文、德文、西班牙文等

-   FR-07：ASR 引擎应支持中英文混合识别（Code-Switching 场景）

-   FR-08：系统应返回识别的置信度分数，供上层应用做质量控制

### 2.1.3 机器翻译模块（NMT）

-   FR-09：系统应能将识别出的源语言文本翻译为目标语言文本

-   FR-10：首期支持语言对：中文→英文、英文→中文、日文→中文、韩文→中文

-   FR-11：翻译应保持原文语义完整性，对专有名词和数字进行正确处理

-   FR-12：系统应支持翻译结果与识别结果的逐句对照展示

### 2.1.4 用户界面模块

-   FR-13：提供响应式 Web 界面，支持 PC 端和移动端浏览器访问

-   FR-14：主页面包含语言选择器、录音/上传按钮、实时波形显示

-   FR-15：结果展示区以原文-译文对照卡片形式呈现，支持按时间段定位

-   FR-16：提供历史记录页面，支持按时间、语言筛选和全文搜索

-   FR-17：支持翻译结果的一键复制和导出（TXT 格式）

### 2.1.5 用户管理模块

-   FR-18：支持用户注册、登录、密码重置

-   FR-19：支持 JWT Token 认证，Token 有效期 24 小时

-   FR-20：支持管理员角色，可查看系统使用统计和用户管理

2.2 非功能需求
--------------

  -------------- -------------- ----------------------------------------
  **类别**       **指标**       **要求**
  **性能**       ASR 响应时间   10秒音频 \< 5秒完成识别（turbo + CPU）
  **性能**       翻译响应时间   单句翻译 \< 1秒（OPUS-MT + CPU）
  **性能**       端到端延迟     10秒音频从上传到返回译文 \< 8秒
  **性能**       并发支持       初期支持 10 并发推理请求
  **可靠性**     系统可用性     ≥ 99.5%（非生产关键路径场景）
  **可靠性**     ASR 准确率     中文普通话 WER \< 15%（Whisper turbo）
  **安全性**     认证方式       JWT Token，支持刷新机制
  **安全性**     数据传输       HTTPS 加密传输（生产环境）
  **可维护性**   部署方式       Docker Compose 一键部署
  **资源占用**   内存上限       推理服务 ≤ 4GB RAM（优化后 ≤ 2GB）
  **资源占用**   磁盘空间       模型文件 ≤ 3GB（含多语言对翻译模型）
  -------------- -------------- ----------------------------------------

2.3 用户角色
------------

  ---------------- ------------------------ -------------------------------------------
  **角色**         **描述**                 **核心需求**
  **普通用户**     使用翻译服务的终端用户   录音/上传音频、查看翻译结果、管理历史记录
  **系统管理员**   运维和管理人员           用户管理、查看使用统计、监控系统健康状态
  **开发者**       二次开发或集成调用       API 文档访问、模型替换和配置、系统扩展
  ---------------- ------------------------ -------------------------------------------

2.4 核心用例流程
----------------

以下为主用例------语音实时翻译------的完整流程：

① 用户打开 Web 应用，选择源语言（或自动检测）和目标语言。

② 用户点击录音按钮，浏览器请求麦克风权限。

③ 用户开始说话，界面显示实时波形。

④ 用户点击停止录音，音频数据上传至后端。

⑤ 后端将音频转发至 ASR 引擎进行语音识别，返回带时间戳的分段文本。

⑥ ASR 识别结果自动传入 NMT 引擎进行翻译。

⑦ 翻译完成后，结果返回前端，以对照卡片形式展示。

⑧ 用户可复制结果或查看历史记录。

第三章 系统架构设计
===================

3.1 整体架构
------------

系统采用前后端分离的微服务架构，分为四层：展示层（前端）、业务服务层（Java
SpringBoot）、AI 推理层（Python FastAPI）、数据持久层（MySQL +
Redis）。各层通过 REST API 进行通信，支持独立部署和水平扩展。

架构设计遵循以下核心原则：

-   关注点分离：Java 负责业务逻辑、权限控制和数据持久化；Python
    专注于深度学习推理

-   无状态设计：推理服务无状态，便于水平扩展；会话状态通过 Redis 管理

-   异步优先：长时推理任务异步处理，避免阻塞用户请求

-   渐进式优化：初期使用成熟开源模型快速交付，预留自定义模型接入接口

系统架构图如下：

> +============================================================+
>
> \| Nginx (反向代理 / 静态资源) \|
>
> \| :80 / :443 \|
>
> +=======+====================+===============================+
>
> \| \|
>
> +\-\-\-\-\-\--v\-\-\-\-\-\-\-\-\-\--+
> +\-\-\--v\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--+
>
> \| React 前端 \| \| SpringBoot 后端 (Java 17) \|
>
> \| (Vite + AntD) \| \| :8080 \|
>
> \| 静态资源 \| \| · 用户认证 (JWT) · 任务管理 \|
>
> \| :3000 (dev) \| \| · 文件存储 · 历史记录 \|
>
> +\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--+
> +\-\-\-\-\-\--+\-\-\-\-\-\-\-\-\--+\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--+
>
> \| \|
>
> +\-\-\-\-\-\-\-\-\--v\-\--+ +\-\--v\-\-\-\-\-\-\-\-\-\-\-\--+
>
> \| MySQL 8.0 \| \| Redis 7 \|
>
> \| :3306 \| \| :6379 \|
>
> +\-\-\-\-\-\-\-\-\-\-\-\-\--+ +\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--+
>
> +============================================================+
>
> \| Python 推理服务 (FastAPI) :8000 \|
>
> \| +\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--+
> +\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--+ \|
>
> \| \| ASR 引擎 \| \| NMT 引擎 \| \|
>
> \| \| Whisper turbo \|\-\--\>\| OPUS-MT / M2M100 \| \|
>
> \| \| (PyTorch/ONNX) \| \| (Transformers) \| \|
>
> \| +\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--+
> +\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--+ \|
>
> \| \|
>
> \| Docker 容器 · 资源限制: 4GB RAM / 2 CPU \|
>
> +============================================================+

3.2 技术选型
------------

  --------------- -------------------------------------------------------- --------------------------------------------------
  **层次**        **技术栈**                                               **说明**
  **前端**        React 18 + TypeScript + Vite + Ant Design 5              响应式 SPA，MediaRecorder API 录音，WAV 编码
  **业务后端**    Java 17 + SpringBoot 3.x + MyBatisPlus 3.5 + MySQL 8.0   用户认证、任务管理、文件存储、历史归档
  **推理服务**    Python 3.10 + FastAPI + PyTorch 2.x + Transformers       Whisper ASR + OPUS-MT/M2M100 NMT，支持 ONNX 推理
  **模型优化**    ONNX Runtime + INT8 量化 + OpenVINO (可选)               模型格式转换、量化压缩、CPU 推理加速
  **缓存/队列**   Redis 7                                                  推理任务队列、热点翻译缓存、Session 管理
  **网关**        Nginx 1.25                                               反向代理、负载均衡、HTTPS 终结、静态资源服务
  **容器化**      Docker + Docker Compose                                  服务编排、环境隔离、一键部署
  **CI/CD**       GitHub Actions / GitLab CI                               自动构建、测试、镜像打包和推送
  --------------- -------------------------------------------------------- --------------------------------------------------

3.3 模块划分
------------

系统划分为以下核心模块：

**语音输入模块（Web Frontend）：**基于 MediaRecorder API
实现浏览器端录音，支持 WAV 编码输出。同时支持拖拽上传音频文件。

**语音识别引擎（ASR Engine）：**封装 OpenAI Whisper
模型，提供统一的语音转文本接口。支持多语言识别、语言自动检测和分段输出。

**机器翻译引擎（NMT Engine）：**封装 Helsinki OPUS-MT
模型，按语言对动态加载相应模型。提供统一的翻译接口。

**推理编排层（Inference Pipeline）：**负责串联 ASR 和 NMT
流程，处理模型加载/卸载、推理任务调度、结果缓存等。

**业务服务层（Business Service）：**基于 SpringBoot
实现用户管理、任务管理、文件存储、历史记录等业务功能。

**API 网关层（API Gateway）：**Nginx
反向代理，负责请求路由、负载均衡、静态资源服务和 HTTPS 终结。

第四章 详细设计
===============

4.1 ASR 语音识别模块
--------------------

### 4.1.1 模型选型

本系统采用 OpenAI Whisper 作为 ASR 引擎。Whisper 是基于 Transformer
的编码器-解码器架构，在大规模弱监督多语言数据上训练，具备强大的泛化能力。推荐使用
turbo 模型（809M
参数），该模型在精度和速度之间取得了最佳平衡------保持与 large-v3
接近的识别准确率的同时，推理速度提升约 8
倍。如在资源更紧张的设备上运行，可降级使用 small 模型（244M 参数）。

### 4.1.2 接口设计

> POST /api/asr/transcribe
>
> Content-Type: multipart/form-data
>
> 请求参数：
>
> file: 音频文件 (binary, required)
>
> language: 源语言代码 (string, optional, 默认 \"auto\")
>
> model: 模型名称 (string, optional, 默认 \"turbo\")
>
> 响应示例：
>
> {
>
> \"text\": \"今天天气很好，我们出去散步吧。\",
>
> \"language\": \"zh\",
>
> \"segments\": \[
>
> { \"start\": 0.0, \"end\": 2.5, \"text\": \"今天天气很好，\" },
>
> { \"start\": 2.5, \"end\": 4.8, \"text\": \"我们出去散步吧。\" }
>
> \],
>
> \"duration\": 4.8
>
> }

4.2 NMT 机器翻译模块
--------------------

### 4.2.1 模型选型

翻译模块首期采用 Helsinki-NLP OPUS-MT 系列模型，通过 HuggingFace
Transformers 库加载。OPUS-MT 基于 Marian-NMT
框架训练，在特定语言对上精度优异且模型体积小（单模型约
300MB），适合资源受限部署。

> MODEL\_MAP = {
>
> (\"zh\", \"en\"): \"Helsinki-NLP/opus-mt-zh-en\", \# 中文→英文
>
> (\"en\", \"zh\"): \"Helsinki-NLP/opus-mt-en-zh\", \# 英文→中文
>
> (\"ja\", \"zh\"): \"Helsinki-NLP/opus-mt-ja-zh\", \# 日文→中文
>
> (\"ko\", \"zh\"): \"Helsinki-NLP/opus-mt-ko-zh\", \# 韩文→中文
>
> }

当需支持 10+ 语言互译时，可切换至 Meta M2M100-1.2B 单模型方案（约
5GB），避免为每个语言对维护独立模型。

### 4.2.2 接口设计

> POST /api/nmt/translate
>
> Content-Type: application/json
>
> 请求体：
>
> { \"text\": \"待翻译文本\", \"src\_lang\": \"zh\", \"tgt\_lang\":
> \"en\" }
>
> 响应示例：
>
> { \"translation\": \"The weather is great today.\", \"src\_lang\":
> \"zh\", \"tgt\_lang\": \"en\" }

4.3 推理编排管线
----------------

ASR 和 NMT 流程由 Pipeline 模块编排。采用"边识别边翻译"的流式策略：ASR
每完成一个分段，立即送入 NMT 翻译，降低端到端延迟。

> \# inference/app/pipeline.py
>
> class SpeechTranslationPipeline:
>
> def \_\_init\_\_(self):
>
> self.asr = ASREngine(model\_name=\"turbo\")
>
> self.nmt\_cache = {}
>
> def run(self, audio\_path, src\_lang, tgt\_lang):
>
> asr\_result = self.asr.transcribe(audio\_path, language=src\_lang)
>
> detected\_lang = asr\_result\[\"language\"\]
>
> nmt = self.\_get\_nmt(detected\_lang, tgt\_lang)
>
> translated\_segments = \[\]
>
> for seg in asr\_result\[\"segments\"\]:
>
> seg\[\"translation\"\] = nmt.translate(seg\[\"text\"\])
>
> translated\_segments.append(seg)
>
> return {
>
> \"transcription\": asr\_result\[\"text\"\],
>
> \"translation\": \" \".join(
>
> s\[\"translation\"\] for s in translated\_segments),
>
> \"detected\_language\": detected\_lang,
>
> \"segments\": translated\_segments
>
> }

4.4 后端服务设计（SpringBoot）
------------------------------

### 4.4.1 项目结构

> backend/
>
> ├── src/main/java/com/speechtrans/
>
> │ ├── SpeechTransApplication.java
>
> │ ├── config/
>
> │ │ ├── SecurityConfig.java \# JWT 配置
>
> │ │ └── WebMvcConfig.java \# CORS 跨域
>
> │ ├── controller/
>
> │ │ ├── AuthController.java \# 注册/登录
>
> │ │ ├── TranslationController.java
>
> │ │ └── HistoryController.java
>
> │ ├── service/
>
> │ │ ├── TranslationService.java \# 调用 Python 推理
>
> │ │ ├── UserService.java
>
> │ │ └── FileStorageService.java
>
> │ ├── entity/ \# TranslationTask, User
>
> │ ├── mapper/ \# MyBatisPlus Mapper
>
> │ └── dto/
>
> └── src/main/resources/
>
> ├── application.yml
>
> └── db/migration/

### 4.4.2 核心 API 设计

  ---------- ---------- -------------------------- ------------------------------------------
  **接口**   **方法**   **路径**                   **说明**
  用户注册   POST       /api/auth/register         用户名+密码+邮箱，BCrypt 加密存储
  用户登录   POST       /api/auth/login            返回 JWT Token，有效期 24h
  语音翻译   POST       /api/translate             上传音频+语言参数，异步处理，返回任务 ID
  查询任务   GET        /api/translate/{id}        根据任务 ID 查询状态和结果
  历史记录   GET        /api/history               分页查询当前用户的历史任务列表
  删除记录   DELETE     /api/history/{id}          删除指定任务（含音频文件）
  导出结果   GET        /api/history/{id}/export   导出翻译结果为 TXT 文件
  ---------- ---------- -------------------------- ------------------------------------------

4.5 数据库设计
--------------

### 4.5.1 ER 图描述

系统包含两个核心实体：用户（User）和翻译任务（TranslationTask），关系为一对多------一个用户可创建多条翻译记录。

### 4.5.2 表结构

用户表（sys\_user）：

> CREATE TABLE sys\_user (
>
> id BIGINT PRIMARY KEY AUTO\_INCREMENT,
>
> username VARCHAR(50) NOT NULL UNIQUE COMMENT \'用户名\',
>
> password VARCHAR(255) NOT NULL COMMENT \'密码(BCrypt加密)\',
>
> email VARCHAR(100) COMMENT \'邮箱\',
>
> role VARCHAR(20) DEFAULT \'USER\' COMMENT \'角色: USER/ADMIN\',
>
> status TINYINT DEFAULT 1 COMMENT \'状态: 1-正常 0-禁用\',
>
> created\_at DATETIME DEFAULT CURRENT\_TIMESTAMP,
>
> updated\_at DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE
> CURRENT\_TIMESTAMP,
>
> INDEX idx\_username (username)
>
> ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT=\'系统用户表\';

翻译任务表（translation\_task）：

> CREATE TABLE translation\_task (
>
> id BIGINT PRIMARY KEY AUTO\_INCREMENT,
>
> user\_id BIGINT NOT NULL COMMENT \'用户ID\',
>
> audio\_file\_name VARCHAR(255) NOT NULL COMMENT \'原始音频文件名\',
>
> audio\_file\_path VARCHAR(500) NOT NULL COMMENT \'音频文件存储路径\',
>
> audio\_duration FLOAT COMMENT \'音频时长(秒)\',
>
> src\_lang VARCHAR(10) COMMENT \'源语言代码\',
>
> tgt\_lang VARCHAR(10) NOT NULL COMMENT \'目标语言代码\',
>
> detected\_lang VARCHAR(10) COMMENT \'检测到的语言(自动模式)\',
>
> transcription MEDIUMTEXT COMMENT \'语音识别原文\',
>
> translation MEDIUMTEXT COMMENT \'翻译结果\',
>
> segments\_json MEDIUMTEXT COMMENT \'分段详情(JSON)\',
>
> status ENUM(\'pending\',\'processing\',\'completed\',\'failed\')
>
> DEFAULT \'pending\' COMMENT \'任务状态\',
>
> error\_message VARCHAR(500) COMMENT \'错误信息\',
>
> created\_at DATETIME DEFAULT CURRENT\_TIMESTAMP,
>
> updated\_at DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE
> CURRENT\_TIMESTAMP,
>
> INDEX idx\_user\_id (user\_id),
>
> INDEX idx\_status (status),
>
> INDEX idx\_created\_at (created\_at)
>
> ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT=\'翻译任务表\';

第五章 模型优化方案
===================

5.1 优化目标
------------

深度学习模型的推理计算量较大，在无 GPU
的服务器上运行速度可能无法满足实时性要求。本章针对"资源受限设备"这一核心需求，提出三级优化方案，从易到难逐步推进。

5.2 第一级：模型选择优化
------------------------

选择适当的模型规模是最直接有效的优化手段。Whisper 提供 6 个尺寸的模型：

  ---------- ------------ -------------- -------------- ---------------------------
  **模型**   **参数量**   **显存需求**   **相对速度**   **适用场景**
  tiny       39M          \~1 GB         \~10x          嵌入式设备、树莓派
  base       74M          \~1 GB         \~7x           低配 VPS（1-2GB RAM）
  small      244M         \~2 GB         \~4x           普通云服务器（2-4GB RAM）
  turbo      809M         \~6 GB         \~8x           推荐：性能与精度最佳平衡
  medium     769M         \~5 GB         \~2x           需翻译功能时的备选
  ---------- ------------ -------------- -------------- ---------------------------

5.3 第二级：ONNX 导出与量化
---------------------------

将 PyTorch 模型转换为 ONNX 格式并进行 INT8
量化，是降低推理资源消耗的标准工业实践。

### 5.3.1 Whisper 模型 ONNX 导出

Whisper 官方提供了 ONNX 转换工具。导出后模型可脱离 PyTorch 依赖，使用
ONNX Runtime 推理。

> \# 安装依赖
>
> pip install onnx onnxruntime onnxruntime-extensions
>
> \# 使用 Whisper 内置工具导出 ONNX
>
> from whisper import load\_model; import torch
>
> model = load\_model(\"turbo\")
>
> torch.onnx.export(model.encoder, \...)
>
> torch.onnx.export(model.decoder, \...)

### 5.3.2 INT8 动态量化

> from onnxruntime.quantization import quantize\_dynamic, QuantType
>
> quantize\_dynamic(
>
> model\_input=\"whisper\_encoder.onnx\",
>
> model\_output=\"whisper\_encoder\_int8.onnx\",
>
> weight\_type=QuantType.QInt8
>
> )
>
> \# 效果：模型体积减少 40%-60%
>
> \# CPU 推理速度提升 2-4 倍
>
> \# 精度损失 \< 2% WER

5.4 第三级：知识蒸馏（高级方案）
--------------------------------

当需在极小设备（如树莓派 4，1-2GB
RAM）上运行时，可用知识蒸馏技术，用大模型（teacher）指导训练小模型（student）。例如用
Whisper large-v3 作为 teacher，训练参数量仅 30M 的 student
模型。此方案需训练数据和 GPU 环境，建议在前两级方案仍不满足需求时采用。

5.5 翻译模型优化
----------------

OPUS-MT 模型本身已较小（\~300MB），可直接使用 HuggingFace Transformers
ONNX 导出功能优化：

> python -m transformers.onnx \\
>
> \--model=Helsinki-NLP/opus-mt-zh-en \\
>
> \--feature=seq2seq-lm \\
>
> output/opus-mt-zh-en-onnx/

第六章 开发计划
===============

6.1 开发阶段划分
----------------

  ---------- ----------- ---------------------- --------------------------------------------
  **阶段**   **时间**    **任务**               **交付物**
  **P0**     第 1 周     环境搭建与项目初始化   项目骨架、Docker 开发环境、CI 流水线
  **P1**     第 2-3 周   Python 推理服务开发    ASR + NMT 引擎封装、FastAPI 服务、单元测试
  **P2**     第 3-4 周   SpringBoot 后端开发    用户认证、翻译 API、历史记录 CRUD
  **P3**     第 5-6 周   React 前端开发         录音组件、翻译结果页、历史页、响应式布局
  **P4**     第 6-7 周   前后端联调与集成测试   全链路功能验证、Bug 修复、E2E 测试
  **P5**     第 7-8 周   模型优化与性能调优     ONNX 量化、模型体积报告、性能对比测试
  **P6**     第 8-9 周   容器化部署与文档       Docker Compose、部署文档、API 文档
  ---------- ----------- ---------------------- --------------------------------------------

6.2 里程碑
----------

**M1 --- 端到端验证（第 1 周末）：**通过命令行 + curl
完成一次完整的"音频→文字→翻译"链路验证。

**M2 --- 推理服务上线（第 3 周末）：**Python ASR + NMT
推理服务可用，REST API 可调通。

**M3 --- 前后端打通（第 5 周末）：**Web
界面可录音上传、查看识别和翻译结果。

**M4 --- 系统功能完整（第 7
周末）：**用户系统、历史记录、翻译导出等功能完善。

**M5 --- 性能优化完成（第 8 周末）：**模型 ONNX 量化完成，性能满足目标。

**M6 --- 容器化部署（第 9 周末）：**Docker Compose 一键部署，文档完善。

6.3 技术栈汇总
--------------

  -------------- -------------------------------- ----------------------------------------------
  **类别**       **技术/工具**                    **版本/说明**
  **开发语言**   Python / Java / JavaScript       Python 3.10+, JDK 17, Node.js 18+
  **后端框架**   SpringBoot / FastAPI             SpringBoot 3.x, FastAPI 0.100+
  **前端框架**   React / Vue.js                   React 18 + TypeScript + Vite
  **深度学习**   Transformer / CNN / RNN / LSTM   Whisper (Transformer), OPUS-MT (Transformer)
  **DL框架**     PyTorch                          PyTorch 2.x + HuggingFace Transformers
  **ORM**        MyBatisPlus                      MyBatisPlus 3.5+
  **数据库**     MySQL 8.0                        InnoDB, utf8mb4
  **缓存**       Redis 7                          Lettuce 客户端
  **中间件**     Nginx                            Nginx 1.25 Alpine
  **配置管理**   Git                              GitHub / GitLab, Git Flow 分支策略
  **IDE**        PyCharm / IDEA                   PyCharm 2024+, IntelliJ IDEA 2024+
  **设计工具**   Visio / PowerDesigner            架构图、流程图、ER 图、API 设计
  **部署**       Linux / Docker                   Ubuntu 22.04+, Docker 24+, Docker Compose v2
  **模型优化**   ONNX Runtime / OpenVINO          ONNX Runtime 1.16+, INT8 量化
  -------------- -------------------------------- ----------------------------------------------

6.4 开发环境配置
----------------

> 环境要求：
>
> \- 操作系统: Linux (Ubuntu 22.04+ 推荐) / macOS / Windows (WSL2)
>
> \- Python: 3.10+
>
> \- Java: JDK 17
>
> \- Node.js: 18+
>
> \- Docker: 24+
>
> \- FFmpeg: 5.0+ (音频处理必需)

第七章 部署方案
===============

7.1 Docker 容器化
-----------------

系统通过 Docker Compose 进行容器化编排，包含 6 个服务：

> \# docker-compose.yml
>
> version: \"3.8\"
>
> services:
>
> nginx:
>
> image: nginx:1.25-alpine
>
> ports: \[\"80:80\", \"443:443\"\]
>
> volumes: \[\"./nginx/nginx.conf:/etc/nginx/nginx.conf:ro\"\]
>
> depends\_on: \[backend, frontend\]
>
> restart: unless-stopped
>
> backend:
>
> build: ./backend
>
> container\_name: speech-backend
>
> ports: \[\"8080:8080\"\]
>
> environment:
>
> \- SPRING\_PROFILES\_ACTIVE=prod
>
> \- INFERENCE\_URL=http://inference:8000
>
> depends\_on: \[mysql, redis\]
>
> restart: unless-stopped
>
> inference:
>
> build: ./inference
>
> container\_name: speech-inference
>
> ports: \[\"8000:8000\"\]
>
> volumes:
>
> \- ./models:/app/models:ro
>
> \- inference\_cache:/app/cache
>
> deploy:
>
> resources:
>
> limits: { memory: 4G, cpus: \"2\" }
>
> restart: unless-stopped
>
> frontend:
>
> build: ./frontend
>
> container\_name: speech-frontend
>
> ports: \[\"3000:3000\"\]
>
> restart: unless-stopped
>
> mysql:
>
> image: mysql:8.0
>
> container\_name: speech-mysql
>
> environment:
>
> MYSQL\_ROOT\_PASSWORD: \${DB\_ROOT\_PASSWORD}
>
> MYSQL\_DATABASE: speech\_translate
>
> MYSQL\_CHARACTER\_SET\_SERVER: utf8mb4
>
> volumes:
>
> \- mysql\_data:/var/lib/mysql
>
> \- ./backend/sql/init.sql:/docker-entrypoint-initdb.d/init.sql
>
> ports: \[\"3306:3306\"\]
>
> restart: unless-stopped
>
> redis:
>
> image: redis:7-alpine
>
> container\_name: speech-redis
>
> ports: \[\"6379:6379\"\]
>
> volumes: \[redis\_data:/data\]
>
> restart: unless-stopped
>
> volumes:
>
> mysql\_data:
>
> redis\_data:
>
> inference\_cache:

7.2 Nginx 配置
--------------

> upstream backend\_servers { server backend:8080; }
>
> upstream inference\_servers { server inference:8000; }
>
> server {
>
> listen 80;
>
> server\_name your-domain.com;
>
> client\_max\_body\_size 50M;
>
> location / {
>
> proxy\_pass http://frontend:3000;
>
> proxy\_set\_header Host \$host;
>
> }
>
> location /api/ {
>
> proxy\_pass http://backend\_servers;
>
> proxy\_set\_header Host \$host;
>
> proxy\_read\_timeout 120s;
>
> }
>
> location /inference/ {
>
> internal;
>
> proxy\_pass http://inference\_servers/;
>
> proxy\_read\_timeout 300s;
>
> }
>
> }

7.3 生产环境扩展方案
--------------------

当系统需承载更大并发量时，可从 Docker Compose 迁移至 Kubernetes
集群，关键调整：

-   推理服务独立为 Deployment，通过 HPA 根据 CPU/内存自动扩缩容

-   MySQL 切换为云数据库（RDS）或使用 StatefulSet + 主从复制

-   音频文件存储使用对象存储（MinIO / S3），替代本地文件系统

-   引入 Prometheus + Grafana 进行全链路监控

第八章 风险识别与应对策略
=========================

  ------------------------------------------ ---------- ---------- ------------------------------------------
  **风险描述**                               **影响**   **概率**   **应对策略**
  Whisper turbo 不支持翻译，需额外集成 NMT   中         确定       OPUS-MT 独立部署，不影响 ASR 功能
  CPU 推理速度不满足实时性要求               高         中         优先 turbo + INT8 量化；若不足降级 small
  多语言翻译模型过多导致内存溢出             中         中         模型懒加载 + LRU 缓存，最多驻留 2 个
  长音频（\>5min）推理超时                   中         高         分段并行推理；双重超时（120s/300s）
  录音格式兼容性（不同浏览器）               低         中         后端 FFmpeg 统一转码 16kHz WAV
  MediaRecorder API 浏览器不支持             低         低         降级为文件上传模式
  ------------------------------------------ ---------- ---------- ------------------------------------------

附录
====

附录 A：项目目录结构
--------------------

> speech-translation/
>
> ├── backend/ \# SpringBoot 后端
>
> │ ├── src/main/java/com/speechtrans/
>
> │ ├── src/main/resources/
>
> │ ├── src/test/
>
> │ ├── sql/init.sql
>
> │ ├── Dockerfile
>
> │ └── pom.xml
>
> ├── inference/ \# Python 推理服务
>
> │ ├── app/
>
> │ │ ├── main.py \# FastAPI 入口
>
> │ │ ├── asr\_engine.py \# Whisper 封装
>
> │ │ ├── nmt\_engine.py \# 翻译模型封装
>
> │ │ └── pipeline.py \# 推理管线
>
> │ ├── tests/
>
> │ ├── requirements.txt
>
> │ └── Dockerfile
>
> ├── frontend/ \# React 前端
>
> │ ├── src/
>
> │ │ ├── components/
>
> │ │ ├── pages/
>
> │ │ ├── services/ \# API 调用封装
>
> │ │ └── App.tsx
>
> │ ├── package.json
>
> │ └── Dockerfile
>
> ├── models/ \# 模型文件目录
>
> │ ├── whisper-turbo/
>
> │ └── opus-mt/
>
> ├── nginx/
>
> │ └── nginx.conf
>
> ├── docker-compose.yml
>
> ├── .env.example
>
> └── README.md

附录 B：参考文献
----------------

-   Radford, A., et al. \"Robust Speech Recognition via Large-Scale Weak
    Supervision.\" arXiv:2212.04356, 2022.

-   Tiedemann, J., & Thottingal, S. \"OPUS-MT \-- Building open
    translation services for the World.\" EAMT, 2020.

-   Vaswani, A., et al. \"Attention Is All You Need.\" NeurIPS, 2017.

-   Fan, A., et al. \"Beyond English-Centric Multilingual Machine
    Translation.\" JMLR, 2021. (M2M100)

-   ONNX Runtime: https://onnxruntime.ai/

*--- 文档结束 ---*
