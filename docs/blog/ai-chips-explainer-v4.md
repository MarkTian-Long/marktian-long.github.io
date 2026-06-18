# 芯片战争背后，藏着一张分工地图

> 过去一两年里，"XX芯片将冲击英伟达"这类新闻反复出现，但每次看完都没真正搞清楚这些芯片之间的关系。它们到底有什么区别？所谓的"冲击"又是在冲击什么？这篇文章试着把这张地图画清楚。

---

过去一两年，我陆续看到不少这样的标题：华为昇腾冲击英伟达、谷歌TPU要颠覆GPU市场、苹果NPU重新定义端侧AI……

每次看完都有一种模糊的感觉：好像懂了，又好像没懂。这些芯片之间到底是什么关系？它们真的在争同一块蛋糕吗？

带着这个问题，我把这些芯片的来龙去脉梳理了一遍。结论先放在这里：**它们看起来是竞争关系，但本质上更接近分工关系**。

---

## CPU：任务最广、灵活性最高的全才

理解AI芯片的起点，是先搞清楚CPU是什么，以及它的局限在哪里。

CPU（Central Processing Unit，中央处理器）是计算机里历史最悠久的核心部件。它的设计哲学是**通用性**——无论是打开浏览器、运行Excel、处理文件还是播放音乐，CPU都能应对。它擅长处理复杂的逻辑判断，能在不同任务之间快速切换，像一个什么都懂的全才。

从两个维度来看：CPU能做的任务范围极宽，几乎没有限制；部署后可以随时重新编程，灵活性最高。这两个特点让它成为所有计算系统的"大脑"，但也决定了它的短板——为了兼顾所有任务，它无法对任何一类任务做深度优化。

AI训练的核心操作是**矩阵乘法**——把大量数字组成的矩阵相乘，反复迭代。一个中等规模的神经网络层，一次前向传播就需要数十亿次乘加运算。现代CPU通常只有几个到几十个核心，面对这种规模的并行需求，像是让几十个人徒手搬一座山。

---

## GPU：意外成为AI主角的图形芯片

GPU（Graphics Processing Unit，图形处理器）最初的设计任务，是在屏幕上实时渲染3D画面。

游戏画面的本质是什么？是把屏幕上的几百万个像素，每秒更新几十次，每个像素都要独立计算光线、阴影、颜色。这是一个极其适合并行处理的任务——每个像素的计算基本互不依赖，可以同时进行。

所以GPU的设计走了一条和CPU完全不同的路：**用数量换能力**。一块现代GPU有数千甚至上万个小核心，每个核心单独看并不强大，但胜在数量多、可以同时工作。

从两个维度来看：GPU能做的任务范围比CPU窄（它特别擅长并行计算，但对复杂逻辑判断不在行），但仍然属于可编程的通用芯片，部署后可以随时改变用途。

这个并行特点在AI领域产生了一个意外的化学反应：神经网络训练的核心——矩阵乘法——在数学结构上和图形渲染高度相似，都是把大量独立的简单计算同时跑完。有多大差距？在大规模矩阵乘法测试中，GPU相比单线程CPU的速度提升约593倍，相比经过优化的多核CPU也快约45倍。

2007年，英伟达发布了CUDA（Compute Unified Device Architecture），一套让开发者可以用GPU进行通用计算的编程框架。从这一刻起，GPU开始从"图形芯片"变成"AI计算的基础设施"。这个转变并非计划中的，而是GPU的并行架构碰巧与AI计算需求高度吻合的结果。英伟达抓住了这个偶然，并在此后把它变成了护城河。

---

## 从这两个问题出发，理解其余所有芯片

GPU称霸之后，一个自然的问题出现了：既然可以专门为AI设计芯片，能不能做得比GPU更好？

答案是可以——但这批芯片之间的关系，并不是一条简单的"通用到专用"的线，而是由两个维度共同决定的：

**它能做多少种事？**（任务覆盖范围）有些芯片只能做一类运算，有些则可以处理各种不同任务。

**它能不能在部署后被改变？**（硬件灵活性）有些芯片出厂后电路固定，有些则可以重新配置甚至重新编程。

用这两个问题来看CPU和GPU——它们都属于高灵活性、宽任务范围的通用芯片。从这里往外延伸，就是一批任务范围更窄、专用程度更高的芯片，各自占据不同的位置。

---

### TPU：谷歌为自己造的专属工具

TPU（Tensor Processing Unit，张量处理器）是谷歌从2016年开始自研的AI芯片，专门为神经网络中最核心的张量运算（本质上是矩阵乘法的推广）设计。

TPU采用了一种叫做**脉动阵列（Systolic Array）**的架构：数据在处理单元之间像心跳一样有节奏地流动，每经过一个单元就完成一次计算，减少了大量反复读写内存的开销。这在特定AI任务上比GPU效率更高。

谷歌把TPU用在了自己的搜索、翻译、图片识别等服务里，也通过Google Cloud开放给外部用户使用。目前最新的两代是Trillium（v6）和Ironwood（v7），后者专门针对大规模推理场景优化。TPU在大规模训练任务上速度很快，但适用范围基本限于谷歌自己的生态系统。

TPU本质上属于下面要介绍的ASIC大类——专为特定任务定制、出厂后不可更改。

---

### NPU：从手机到数据中心的AI推理引擎

NPU（Neural Processing Unit，神经处理器）是专门为**神经网络推理**设计的芯片。

这里有一个区分值得说清楚：AI的工作分为两个阶段。**训练**是让模型从海量数据中学习，计算量极大，主要在数据中心的GPU集群上完成；**推理**是用训练好的模型回答具体问题，对延迟和功耗更敏感。NPU专门针对推理这个阶段设计，不需要参与训练。

这个分工直接决定了NPU出现的地方：一类是**端侧设备**——手机、平板、智能摄像头。你手机上的人脸识别、拍照美化、语音唤醒，背后大概率都是NPU在工作。各家叫法不同：苹果称为"Neural Engine"，高通叫"Hexagon"，但本质相同，都是做到极省电、延迟极低。

另一类是**数据中心推理**——华为昇腾系列芯片本质上也是NPU，只是面向云端的大规模推理服务，规模和功耗比手机NPU大得多，是用来承接用户请求、实时返回AI结果的基础设施。

NPU属于ASIC大类，专门为神经网络推理这一类任务定制，出厂后不可更改。

---

### FPGA：可以重新编程的"可变形芯片"

FPGA（Field-Programmable Gate Array，现场可编程门阵列）是这几类芯片里最特殊的一个。

它的电路可以在**出厂后被重新配置**，根据任务需要"变形"成不同的专用形态——任务覆盖范围相对窄（需要专门针对特定任务配置），但硬件灵活性比NPU、TPU这类固定芯片高得多。这让它处于一个独特的中间地带：不像GPU那样通用，也不像ASIC那样完全固定。

代价是编程门槛高，需要用硬件描述语言（而不是Python这类常见语言）来配置，开发难度大，成本也相对高。

FPGA更多出现在金融交易系统的实时风控、通信基站的信号处理、工业自动化控制等对延迟要求极高、又需要一定灵活性的场景。在AI领域主要用于推理加速的原型验证，或特殊定制部署场景。

---

### DPU：数据中心里的"管道工"

DPU（Data Processing Unit，数据处理器）是近年来数据中心里越来越常见的一类芯片，但在科技新闻里存在感不高。

它的职责是处理数据中心里大量繁琐但必须完成的"搬运工作"：网络数据包的收发和转发、存储读写的调度、安全加密和解密等。这些任务如果交给CPU来做，会占用大量计算资源，拖慢AI训练和推理的正常工作。DPU的作用，是把这些"杂务"从CPU和GPU上剥离出来，让主力芯片专注于真正的计算任务。

英伟达的BlueField系列是目前最主流的DPU产品。从两个维度来看：DPU的任务范围窄（专注于网络和存储处理），出厂后基本固定，属于ASIC大类的一种形态。

---

### ASIC：一个大类，不是一个具体产品

ASIC（Application-Specific Integrated Circuit，专用集成电路）是**一个芯片类别的统称**，不是某个具体产品的名字。

凡是从设计之初就只为一个特定任务服务、出厂后不可更改的芯片，都叫ASIC。TPU是ASIC，NPU是ASIC，DPU也是ASIC。除此之外，还有很多你可能没有想到的ASIC：

| 芯片 | 谁造的 | 专门做什么 |
|---|---|---|
| TPU（Trillium、Ironwood） | 谷歌 | AI训练和推理 |
| Trainium / Inferentia | 亚马逊AWS | AI训练 / AI推理 |
| Neural Engine | 苹果 | 手机端AI推理 |
| AI4 / AI5 | 特斯拉 | 自动驾驶和机器人 |
| BlueField 系列 | 英伟达 | 数据中心网络和存储处理 |
| 蚂蚁矿机芯片 | 比特大陆 | 比特币挖矿 |
| 网络交换芯片 | Broadcom等 | 数据中心网络交换 |

ASIC的经济逻辑很直接：前期设计成本极高，但一旦规模足够大，单位成本和能耗会远低于通用芯片。所以自研ASIC通常只有业务规模极大的公司才会考虑。

---

## 用两个维度给所有芯片定位

<!-- INSERT_CHART: chip_overview_table -->

把所有芯片放在"任务覆盖范围"和"硬件灵活性"这两个维度上，就能得到一张比"通用到专用"更准确的地图。

<!-- INSERT_CHART: chip_positioning_diagram -->

几个关键点值得注意：

- CPU和GPU都处于高灵活性区间，可以随时重新编程做不同的事，但GPU的任务范围比CPU窄
- FPGA是独特的中间地带：任务范围窄，但硬件出厂后仍可重新配置
- TPU、NPU、DPU都是ASIC的具体形态，任务最窄、灵活性最低，但在各自场景下效率最高
- ASIC不是某种芯片，而是一类芯片的统称

这张地图说明了一件事：**这些芯片并不是在同一个赛道上竞争，而是各自占据了不同的位置，服务于不同的需求**。

---

## 它们是分工关系，不是替代关系

理解了这张地图，"冲击英伟达"这类新闻就有了更准确的解读方式。

所谓冲击，并不是某款芯片在所有场景下都比GPU更好。更准确的描述是：**在某些特定场景下，专用芯片比通用GPU更合适**——手机端的实时推理用NPU，大厂自己的推理集群用自研ASIC，延迟敏感的工业控制用FPGA，数据中心的网络处理用DPU，大规模训练仍然用GPU。

英伟达GPU的真正护城河，不只是芯片本身，而是围绕GPU建立起来的**CUDA软件生态**。CUDA经过超过十五年的积累，深度整合进了PyTorch、TensorFlow等主流AI框架，积累了数百万熟悉这套工具链的开发者。竞争对手要挑战英伟达，不只是造出性能相当的硬件，还需要建立同样深厚的软件生态——而这需要时间，不是一两年能解决的事。

DeepSeek V4选择把推理部署在华为昇腾上，正是这个分工逻辑的体现：训练阶段依赖英伟达的GPU和CUDA生态，推理阶段迁移到国产芯片，两者并不互斥。

---

## 越来越混合的未来

这些芯片之间的分工，正在催生一种叫做**异构计算**的趋势：同一个系统里，不同类型的芯片各司其职，协同工作。

你的手机里已经是这样：CPU处理日常逻辑，GPU渲染画面，NPU跑AI功能。数据中心也在朝这个方向走——GPU做大规模训练，专用推理芯片处理线上服务，DPU承担网络和存储的调度，CPU做整体控制。

所以"冲击英伟达"这个叙事，捕捉到了真实的产业变化，但描述方式有些误导——不是某块芯片要全面取代GPU，而是整个行业正在从"用GPU做所有事情"向"每种任务找最合适的芯片"演进。

英伟达的位置会不会变？会。但它失去的，大概率不是整个市场，而是原本不该属于GPU的那部分份额。

---

*下一篇，我们来看训练和推理为什么对芯片的要求如此不同——以及这个差异如何解释了内存价格在过去一年里的大幅上涨。*

---

## 参考资料

- [GPU vs CPU Performance for Matrix Multiplication](https://jasonwhatson.com/posts/gpu-vs-cpu-performance-for-matrix-multiplication/)
- [Accelerating Matrix Multiplication: A Performance Comparison Between Multi-Core CPU and GPU](https://arxiv.org/abs/2507.19723)
- [CPU vs GPU vs TPU vs NPU: AI Hardware Architecture Guide 2025](https://www.thepurplestruct.com/blog/cpu-vs-gpu-vs-tpu-vs-npu-ai-hardware-architecture-guide-2025)
- [Best AI Chips 2025: Compare GPU, TPU, FPGA, ASIC](https://www.vellex.ai/blogs/why-your-ai-is-slow-and-how-the-right-chip-can-fix-it)
- [Understanding CPU vs GPU vs TPU vs NPU in Modern AI Systems](https://resources.l-p.com/knowledge-center/cpu-vs-gpu-vs-tpu-vs-npu-architecture-computation-explained)
- [Global AI Hardware Landscape 2025](https://www.geniatech.com/ai-hardware-2025/)
- [NVIDIA's CUDA Moat: How Developer Lock-In Built a Trillion-Dollar AI Empire](https://medium.com/@productbrief/nvidias-cuda-moat-how-developer-lock-in-built-a-trillion-dollar-ai-empire-40d2f7f7dca2)
- [The CUDA Advantage: How NVIDIA Came to Dominate AI](https://medium.com/@aidanpak/the-cuda-advantage-how-nvidia-came-to-dominate-ai-and-the-role-of-gpu-memory-in-large-scale-model-e0cdb98a14a0)
- [Why NVIDIA Dominates AI: The Full Stack and CUDA Moat](https://andrewbaker.ninja/2026/05/06/why-is-nvidia-the-most-valuable-company-in-the-world-the-ai-stack-the-cuda-moat-and-the-threats-that-could-unseat-it/)
- [AI and Deep Learning Accelerators Beyond GPUs in 2026](https://www.bestgpusforai.com/blog/ai-accelerators)
- [Robotic Computing on FPGAs](https://arxiv.org/pdf/2205.07149)
- [Google Cloud TPU Trillium (v6e) Release Notes](https://docs.cloud.google.com/tpu/docs/release-notes)
- [Introducing Trillium, sixth-generation TPUs](https://cloud.google.com/blog/products/compute/introducing-trillium-6th-gen-tpus)
- [NVIDIA Launches Rubin AI Compute Platform](https://www.datacenterknowledge.com/data-center-chips/ces-2026-nvidia-launches-rubin-to-maintain-data-center-stronghold)
