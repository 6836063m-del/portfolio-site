/* ============================================================
   作品数据文件
   ------------------------------------------------------------
   后续增删、修改、替换作品，只需编辑这个文件即可。
   ★ 修改方法：
   1. 复制一组 { ... } 内容
   2. 修改 title / category / desc / image / images 字段
   3. 保存后刷新网页即可生效

   字段说明：
   - title    : 作品标题（中英组合，介绍页 / 详情页显示）
   - enTitle  : 英文标题（list 列表主标题，大字）
   - zhTitle  : 中文标题（list 列表副标题，小字）
   - category : 分类，可选：品牌设计 / UI设计 / 空间设计
   - short    : 一句话简介（作品介绍页显示）
   - desc     : 作品描述（详情页显示）
   - image    : 封面图路径（放在 images/ 文件夹，或粘贴外链）
   - images   : 作品完整图集（数组，多个图片路径，点击作品后的
                「作品全览页」会按顺序全部展示 = 作品的全部内容；
                留空数组 [] 时显示"图集整理中"占位）
   - link     : 作品的外部链接（可留空 ""）
   - type     : "image" 图片作品 / "video" 视频作品
   - year     : 作品年份（2025 / 2026）
   - pages    : 在 PDF 中的页码范围（便于后续查找替换图片）

   ★ 当前排序（2026-08-21 按用户要求调整）：
     1. WEISHAN 未山      2. PULSE 脉动社群   3. Warm Blue 溯藍（咖啡）
     4. NIO 蔚来          5. FIZO             6. 跨境电商独立站
     7. WOOPOW            8. Yue 悦

   ★ 各作品在 PDF（共 49 页）中的实际页码范围：
     P1-P2    作品集封面 + 个人信息页
     P3-P13   WEISHAN 未山
     P14-P25  PULSE 脉动社群
     P26-P39  Warm Blue 溯藍
     P40-P42  Yue 悦 · 护肤品详情页
     P43-P49  NIO 蔚来 · 线下活动美陈

  ★ WOOPOW 为独立成册的新作品（17 页），图片存放于
    _pdf_pages/woopow-01.webp ~ woopow-17.webp
   ============================================================ */

const WORKS = [
  /* ===== 品牌设计 ===== */
  {
    title: "WEISHAN 未山 · 未来东方主义",
    enTitle: "WEISHAN",
    zhTitle: "未山 · 未来东方主义",
    category: "品牌设计",
    short: "以「未来东方主义」重构东方山水的数字香氛品牌。",
    desc: "WEISHAN（未山）品牌视觉系统设计。以「未来东方主义 / FUTURE ORIENTALISM · CYBER ZEN」为核心理念，通过数字化视觉语言重构传统山水、禅意与物性哲学，构建属于 AI 时代的东方审美体系。项目涵盖品牌字体、数字等高扫描线重构山脉形态、App 界面、香氛产品视觉与品牌延展。",
    image: "images/cover-weishan.webp",
    images: [
      "_pdf_pages/p03.webp", "_pdf_pages/p04.webp", "_pdf_pages/p05.webp",
      "_pdf_pages/p06.webp", "_pdf_pages/p07.webp", "_pdf_pages/p08.webp",
      "_pdf_pages/p09.webp", "_pdf_pages/p10.webp", "_pdf_pages/p11.webp",
      "_pdf_pages/p12.webp", "_pdf_pages/p13.webp"
    ],
    link: "",
    type: "image",
    year: "2026",
    pages: "P3-P13",
    coverPage: 3
  },
  {
    title: "PULSE 脉动社群",
    enTitle: "PULSE",
    zhTitle: "脉动社群 · 运动品牌全案",
    category: "品牌设计",
    short: "为新一代都市青年打造的高能社交运动品牌全案。",
    desc: "为新一代都市青年打造的「高能社交」运动品牌全案。PULSE 以「Find Your Rhythm.」为品牌主张，定位积极健康、高能运动的品牌价值观。项目涵盖品牌标识设计、色彩系统、环保包装系统（杜邦纸环保袋、电商包装盒）、UI 界面设计、广告投放及线下应用全链路。",
    image: "images/cover-pulse.webp",
    images: [
      "_pdf_pages/p14.webp", "_pdf_pages/p15.webp", "_pdf_pages/p16.webp",
      "_pdf_pages/p17.webp", "_pdf_pages/p18.webp", "_pdf_pages/p19.webp",
      "_pdf_pages/p20.webp", "_pdf_pages/p21.webp", "_pdf_pages/p22.webp",
      "_pdf_pages/p23.webp", "_pdf_pages/p24.webp", "_pdf_pages/p25.webp"
    ],
    link: "",
    type: "image",
    year: "2025",
    pages: "P14-P25",
    coverPage: 14
  },
  {
    title: "Warm Blue 溯藍",
    enTitle: "WARM BLUE",
    zhTitle: "溯藍 · 治愈系咖啡品牌视觉",
    category: "品牌设计",
    short: "天空与海洋温柔交会的治愈系咖啡品牌视觉。",
    desc: "Warm Blue Coffee 品牌视觉设计。灵感来自天空与海洋的温柔交会，以雾蓝、暖棕为主调，辅以浅灰与木质纹理，传递自然、平静与疗愈的品牌气息。项目包含色彩系统规范（主色/辅助色/渐变）、Logo 系统、包装设计（咖啡杯套、纸袋、咖啡豆包装）、材质应用（陶瓷/布材/纸张/木材）及品牌应用示意。",
    image: "images/cover-warmblue.webp?v=2",
    images: [
      "_pdf_pages/p26.webp", "_pdf_pages/p27.webp", "_pdf_pages/p28.webp",
      "_pdf_pages/p29.webp", "_pdf_pages/p30.webp", "_pdf_pages/p31.webp",
      "_pdf_pages/p32.webp", "_pdf_pages/p33.webp", "_pdf_pages/p34.webp",
      "_pdf_pages/p35.webp", "_pdf_pages/p36.webp", "_pdf_pages/p37.webp",
      "_pdf_pages/p38.webp", "_pdf_pages/p39.webp"
    ],
    link: "",
    type: "image",
    year: "2025",
    pages: "P26-P39",
    coverPage: 26
  },
  {
    title: "NIO 蔚来 · 线下活动美陈方案",
    enTitle: "NIO",
    zhTitle: "蔚来 · 线下活动美陈方案",
    category: "空间设计",
    short: "「蓝天已来 未来已至」主题的蔚来线下活动美陈方案。",
    desc: "NIO 蔚来汽车线下活动美陈方案与广告投放设计。以「BLUE SKY IS COMING / 蓝天已来 未来已至」为活动主题，涵盖线下活动空间装置设计（品牌门廊、立柱灯箱、展示台）、户外广告投放（地铁灯箱、楼体广告）及系列车型推广视觉（ET5 / ET7 / ES7 / EC6 / ES6），整体视觉传递蔚来「A New User Experience」品牌理念。",
    image: "images/cover-nio.webp",
    images: [
      "_pdf_pages/p43.webp", "_pdf_pages/p44.webp", "_pdf_pages/p45.webp",
      "_pdf_pages/p46.webp", "_pdf_pages/p47.webp", "_pdf_pages/p48.webp",
      "_pdf_pages/p49.webp"
    ],
    link: "",
    type: "image",
    year: "2025",
    pages: "P43-P49",
    coverPage: 43
  },
  {
    title: "FIZO · 品牌设计",
    enTitle: "FIZO",
    zhTitle: "品牌视觉系统设计",
    category: "品牌设计",
    short: "FIZO 品牌视觉系统设计，完整内容整理中。",
    desc: "预留作品：FIZO 品牌视觉设计。完整内容待补充——建议放入 Logo 规范、色彩系统、字体规范与品牌应用延展，可参考 PULSE 与 WEISHAN 的作品结构整理。",
    image: "",
    images: [],
    link: "",
    type: "image",
    year: "2026",
    pages: ""
  },
  {
    title: "跨境电商独立站 UI 设计",
    enTitle: "E-COMMERCE UI",
    zhTitle: "跨境电商独立站设计",
    category: "UI设计",
    short: "面向海外市场的跨境电商独立站界面设计。",
    desc: "预留作品：跨境电商独立站界面设计。完整内容待补充——建议放入落地页、商品列表、详情页、购物流程等界面，可参考 WEISHAN 与 Yue 的作品结构整理。",
    image: "",
    images: [],
    link: "",
    type: "image",
    year: "2025",
    pages: ""
  },
  {
    title: "WOOPOW · 宠物生活方式品牌全案",
    enTitle: "WOOPOW",
    zhTitle: "宠物生活方式品牌全案",
    category: "品牌设计",
    short: "「Born to Play! 天生爱蹦跶」Z世代宠物生活方式品牌全案。",
    desc: "WOOPOW 宠物生活方式品牌全案设计。以「Born to Play! 天生爱蹦跶」为品牌主张，面向 Z 世代都市养宠人群，打造「能量充能型」宠物潮流生活方式品牌。项目涵盖市场研究与品牌策略定位、Logo 标志系统、视觉资产（多巴胺色彩 / 图形 / 插画）、字体排版规范、品牌图形与插画系统、犬猫粮全系列包装设计（82% 动物蛋白主粮）、货架终端陈列、H5 移动端设计、宣传折页及线下快闪活动空间美陈，构建从品牌策略到零售落地的完整体验链路。",
    image: "images/cover-woopow.webp",
    images: [
      "_pdf_pages/woopow-01.webp", "_pdf_pages/woopow-02.webp", "_pdf_pages/woopow-03.webp",
      "_pdf_pages/woopow-04.webp", "_pdf_pages/woopow-05.webp", "_pdf_pages/woopow-06.webp",
      "_pdf_pages/woopow-07.webp", "_pdf_pages/woopow-08.webp", "_pdf_pages/woopow-09.webp",
      "_pdf_pages/woopow-10.webp", "_pdf_pages/woopow-11.webp", "_pdf_pages/woopow-12.webp",
      "_pdf_pages/woopow-13.webp", "_pdf_pages/woopow-14.webp", "_pdf_pages/woopow-15.webp",
      "_pdf_pages/woopow-16.webp", "_pdf_pages/woopow-17.webp"
    ],
    link: "",
    type: "image",
    year: "2025",
    pages: "独立成册 W1-W17",
    coverPage: 1
  },
  {
    title: "Yue 悦 · 护肤品详情页设计",
    enTitle: "YUE",
    zhTitle: "悦 · 护肤品详情页设计",
    category: "UI设计",
    short: "以桃金色打造「发光焕亮」的护肤品电商详情页。",
    desc: "Yue（悦）护肤品电商详情页设计。以桃金色为主色调，突显「发光焕亮」核心卖点，打造轻奢感与科技感并存的视觉效果。运用水花与气泡元素传递补水保湿功效，通过数据可视化呈现产品成分含量与功效对比，强化消费者信任感。整体采用长图形式，便于社交媒体传播与电商平台展示。产品定价 ¥98-¥299。",
    image: "images/cover-yue.webp",
    images: [
      "_pdf_pages/p40.webp", "_pdf_pages/p41.webp", "_pdf_pages/p42.webp"
    ],
    link: "",
    type: "image",
    year: "2025",
    pages: "P40-P42",
    coverPage: 40
  }
];