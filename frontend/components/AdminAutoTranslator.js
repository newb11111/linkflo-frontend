"use client"

import { useEffect } from "react"
import { useLanguage } from "./TranslateProvider"

// Backend UI translator only translates Admin/Merchant interface labels.
// Product funnel content translations are stored separately in product data and are not managed here.
const UI_TEXT = {
  // shell / common
  "Dashboard": { zh: "仪表盘", en: "Dashboard", ms: "Papan Pemuka" },
  "Products": { zh: "产品", en: "Products", ms: "Produk" },
  "Orders": { zh: "订单", en: "Orders", ms: "Order" },
  "Merchants": { zh: "商家", en: "Merchants", ms: "Peniaga" },
  "Customers": { zh: "顾客", en: "Customers", ms: "Pelanggan" },
  "Promoters": { zh: "Promoter", en: "Promoters", ms: "Promoter" },
  "Suspicious": { zh: "可疑订单", en: "Suspicious Orders", ms: "Order Mencurigakan" },
  "Wallets": { zh: "钱包", en: "Wallets", ms: "Wallet" },
  "Reports": { zh: "报表", en: "Reports", ms: "Laporan" },
  "Audit Logs": { zh: "操作日志", en: "Audit Logs", ms: "Log Aktiviti" },
  "Logout": { zh: "登出", en: "Logout", ms: "Log keluar" },
  "Log keluar": { zh: "登出", en: "Logout", ms: "Log keluar" },
  "登出": { zh: "登出", en: "Logout", ms: "Log keluar" },
  "Workspace": { zh: "工作台", en: "Workspace", ms: "Ruang Kerja" },
  "工作台": { zh: "工作台", en: "Workspace", ms: "Ruang Kerja" },
  "Ruang Kerja": { zh: "工作台", en: "Workspace", ms: "Ruang Kerja" },
  "Loading...": { zh: "加载中...", en: "Loading...", ms: "Sedang memuatkan..." },
  "Checking admin access...": { zh: "正在检查 Admin 权限...", en: "Checking admin access...", ms: "Sedang semak akses Admin..." },
  "中文": { zh: "中文", en: "Chinese", ms: "Cina" },
  "English": { zh: "English", en: "English", ms: "Inggeris" },
  "BM": { zh: "BM", en: "BM", ms: "BM" },

  // merchant sidebar / layout
  "Merchant 后台": { zh: "Merchant 后台", en: "Merchant Panel", ms: "Panel Peniaga" },
  "Panel Peniaga": { zh: "Merchant 后台", en: "Merchant Panel", ms: "Panel Peniaga" },
  "商家销售工作台": { zh: "商家销售工作台", en: "Merchant Sales Workspace", ms: "Ruang Jualan Peniaga" },
  "Ruang Jualan Peniaga": { zh: "商家销售工作台", en: "Merchant Sales Workspace", ms: "Ruang Jualan Peniaga" },
  "AI Funnel + Promoter 分销": { zh: "AI Funnel + Promoter 分销", en: "AI Funnel + Promoter Distribution", ms: "AI Funnel + Promoter Distribution" },
  "产品 Funnel": { zh: "产品 Funnel", en: "Product Funnels", ms: "Funnel Produk" },
  "Funnel Produk": { zh: "产品 Funnel", en: "Product Funnels", ms: "Funnel Produk" },
  "订单履约": { zh: "订单履约", en: "Order Fulfillment", ms: "Pengurusan Order" },
  "Pengurusan Order": { zh: "订单履约", en: "Order Fulfillment", ms: "Pengurusan Order" },
  "配套 / 升级": { zh: "配套 / 升级", en: "Plan / Upgrade", ms: "Pakej / Naik Taraf" },
  "Pakej / Naik Taraf": { zh: "配套 / 升级", en: "Plan / Upgrade", ms: "Pakej / Naik Taraf" },
  "申请": { zh: "申请", en: "Apply", ms: "Permohonan" },
  "Permohonan": { zh: "申请", en: "Apply", ms: "Permohonan" },

  // merchant dashboard
  "Ruangg Kerja": { zh: "工作台", en: "Workspace", ms: "Ruang Kerja" },
  "Ruang Jualan Peniaga": { zh: "商家销售工作台", en: "Merchant Sales Workspace", ms: "Ruang Jualan Peniaga" },
  "这里不是填资料后台。这里是你的 AI 成交页 + Promoter 分销经营中心。": { zh: "这里不是填资料后台。这里是你的 AI 成交页 + Promoter 分销经营中心。", en: "This is not a data-entry backend. It is your AI funnel and promoter distribution operating center.", ms: "Ini bukan backend isi data sahaja. Ini pusat operasi AI funnel dan promoter distribution anda." },
  "今日销售": { zh: "今日销售", en: "Today Sales", ms: "Jualan Hari Ini" },
  "本月销售": { zh: "本月销售", en: "Monthly Sales", ms: "Jualan Bulan Ini" },
  "订单数量": { zh: "订单数量", en: "Order Count", ms: "Jumlah Order" },
  "Conversion Rate": { zh: "转化率", en: "Conversion Rate", ms: "Kadar Konversi" },
  "Promoter 数量": { zh: "Promoter 数量", en: "Promoter Count", ms: "Jumlah Promoter" },
  "Funnel Analytics": { zh: "Funnel 数据", en: "Funnel Analytics", ms: "Analitik Funnel" },
  "Top Promoter": { zh: "Top Promoter", en: "Top Promoter", ms: "Top Promoter" },
  "AI 建议": { zh: "AI 建议", en: "AI Suggestions", ms: "Cadangan AI" },
  "我的产品 Funnel": { zh: "我的产品 Funnel", en: "My Product Funnels", ms: "Funnel Produk Saya" },
  "不只是产品列表。这里可以看状态、结算、打开 funnel、复制推广链接。": { zh: "不只是产品列表。这里可以看状态、结算、打开 funnel、复制推广链接。", en: "Not just a product list. Check status, settlement, open funnels and copy promoter links here.", ms: "Bukan sekadar senarai produk. Semak status, penyelesaian, buka funnel dan salin link promoter di sini." },
  "快速操作": { zh: "快速操作", en: "Quick Actions", ms: "Tindakan Pantas" },
  "创建新的 AI Product Funnel": { zh: "创建新的 AI Product Funnel", en: "Create New AI Product Funnel", ms: "Cipta AI Product Funnel Baru" },
  "处理订单 / 填 Tracking Number": { zh: "处理订单 / 填 Tracking Number", en: "Handle Orders / Add Tracking Number", ms: "Urus Order / Isi Tracking Number" },
  "升级配套 / 查看 SKU Limit": { zh: "升级配套 / 查看 SKU Limit", en: "Upgrade Plan / View SKU Limit", ms: "Naik Taraf / Lihat Had SKU" },
  "还没有产品。先创建第一个 AI Product Funnel。": { zh: "还没有产品。先创建第一个 AI Product Funnel。", en: "No products yet. Create your first AI Product Funnel.", ms: "Belum ada produk. Cipta AI Product Funnel pertama anda." },
  "还没有产品数据。": { zh: "还没有产品数据。", en: "No product data yet.", ms: "Belum ada data produk." },
  "还没有 Promoter 订单。复制推广模板给 Promoter 测第一波流量。": { zh: "还没有 Promoter 订单。复制推广模板给 Promoter 测第一波流量。", en: "No promoter orders yet. Copy the promoter template to test your first traffic batch.", ms: "Belum ada order promoter. Salin template promoter untuk uji trafik pertama." },
  "已复制产品 Funnel link": { zh: "已复制产品 Funnel link", en: "Product funnel link copied", ms: "Link funnel produk disalin" },
  "已复制 Promoter link 模板": { zh: "已复制 Promoter link 模板", en: "Promoter link template copied", ms: "Template link promoter disalin" },
  "已复制推广模板": { zh: "已复制推广模板", en: "Promotion template copied", ms: "Template promosi disalin" },
  "复制 Funnel": { zh: "复制 Funnel", en: "Copy Funnel", ms: "Salin Funnel" },
  "打开 Funnel": { zh: "打开 Funnel", en: "Open Funnel", ms: "Buka Funnel" },
  "复制推广模板": { zh: "复制推广模板", en: "Copy Promotion Template", ms: "Salin Template Promosi" },
  "编辑产品 Funnel": { zh: "编辑产品 Funnel", en: "Edit Product Funnel", ms: "Edit Funnel Produk" },
  "操作菜单 ⋯": { zh: "操作菜单 ⋯", en: "Action Menu ⋯", ms: "Menu Tindakan ⋯" },
  "销售额": { zh: "销售额", en: "Sales", ms: "Jualan" },
  "浏览": { zh: "浏览", en: "Views", ms: "Paparan" },
  "点击": { zh: "点击", en: "Clicks", ms: "Klik" },
  "付款订单": { zh: "付款订单", en: "Paid Orders", ms: "Order Dibayar" },
  "商家预计到手": { zh: "商家预计到手", en: "Estimated Merchant Payout", ms: "Anggaran Bayaran Peniaga" },
  "商家到手参考": { zh: "商家到手参考", en: "Merchant Payout Reference", ms: "Rujukan Bayaran Peniaga" },
  "今日已付款订单": { zh: "今日已付款订单", en: "Paid Orders Today", ms: "Order Dibayar Hari Ini" },
  "本月已付款订单": { zh: "本月已付款订单", en: "Paid Orders This Month", ms: "Order Dibayar Bulan Ini" },
  "全部订单": { zh: "全部订单", en: "All Orders", ms: "Semua Order" },

  // merchant builder
  "AI FUNNEL BUILDER": { zh: "AI FUNNEL BUILDER", en: "AI FUNNEL BUILDER", ms: "AI FUNNEL BUILDER" },
  "创建产品成交页": { zh: "创建产品成交页", en: "Create Product Funnel", ms: "Cipta Funnel Produk" },
  "用 5 个步骤完成产品成交页。AI 会补齐成交文案、FAQ、痛点、CTA，并自动准备 English + Bahasa Melayu。": { zh: "用 5 个步骤完成产品成交页。AI 会补齐成交文案、FAQ、痛点、CTA，并自动准备 English + Bahasa Melayu。", en: "Complete your product funnel in 5 steps. AI helps create copy, FAQ, pain points, CTA and prepares English + Bahasa Melayu automatically.", ms: "Siapkan funnel produk dalam 5 langkah. AI membantu cipta copy, FAQ, pain point, CTA dan sediakan English + Bahasa Melayu secara automatik." },
  "Step 1 · 基础资料": { zh: "Step 1 · 基础资料", en: "Step 1 · Basic Info", ms: "Step 1 · Maklumat Asas" },
  "Step 2 · AI Funnel": { zh: "Step 2 · AI Funnel", en: "Step 2 · AI Funnel", ms: "Step 2 · AI Funnel" },
  "Step 3 · 图片 / 视频": { zh: "Step 3 · 图片 / 视频", en: "Step 3 · Images / Video", ms: "Step 3 · Gambar / Video" },
  "Step 4 · Promoter 设置": { zh: "Step 4 · Promoter 设置", en: "Step 4 · Promoter Settings", ms: "Step 4 · Tetapan Promoter" },
  "Step 5 · Preview": { zh: "Step 5 · Preview", en: "Step 5 · Preview", ms: "Step 5 · Preview" },
  "基础资料": { zh: "基础资料", en: "Basic Info", ms: "Maklumat Asas" },
  "AI Funnel": { zh: "AI Funnel", en: "AI Funnel", ms: "AI Funnel" },
  "图片 / 视频": { zh: "图片 / 视频", en: "Images / Video", ms: "Gambar / Video" },
  "Promoter 设置": { zh: "Promoter 设置", en: "Promoter Settings", ms: "Tetapan Promoter" },
  "Preview": { zh: "Preview", en: "Preview", ms: "Preview" },
  "Step 1 · Basic Info": { zh: "Step 1 · 基础资料", en: "Step 1 · Basic Info", ms: "Step 1 · Maklumat Asas" },
  "Step 1 · Maklumat Asas": { zh: "Step 1 · 基础资料", en: "Step 1 · Basic Info", ms: "Step 1 · Maklumat Asas" },
  "Step 3 · Images / Video": { zh: "Step 3 · 图片 / 视频", en: "Step 3 · Images / Video", ms: "Step 3 · Gambar / Video" },
  "Step 3 · Gambar / Video": { zh: "Step 3 · 图片 / 视频", en: "Step 3 · Images / Video", ms: "Step 3 · Gambar / Video" },
  "Step 4 · Promoter Settings": { zh: "Step 4 · Promoter 设置", en: "Step 4 · Promoter Settings", ms: "Step 4 · Tetapan Promoter" },
  "Step 4 · Tetapan Promoter": { zh: "Step 4 · Promoter 设置", en: "Step 4 · Promoter Settings", ms: "Step 4 · Tetapan Promoter" },
  "先填产品最基本资料。后面的 funnel 文案可以交给 AI 生成。": { zh: "先填产品最基本资料。后面的 funnel 文案可以交给 AI 生成。", en: "Start with the basic product info. AI can generate the funnel copy later.", ms: "Mulakan dengan maklumat asas produk. AI boleh jana copy funnel selepas itu." },
  "产品名字 *": { zh: "产品名字 *", en: "Product Name *", ms: "Nama Produk *" },
  "价格 RM *": { zh: "价格 RM *", en: "Price RM *", ms: "Harga RM *" },
  "佣金 %（例如 20）": { zh: "佣金 %（例如 20）", en: "Commission % (e.g. 20)", ms: "Komisen % (cth. 20)" },
  "库存 / 数量": { zh: "库存 / 数量", en: "Stock / Quantity", ms: "Stok / Kuantiti" },
  "售后 WhatsApp": { zh: "售后 WhatsApp", en: "After-sales WhatsApp", ms: "WhatsApp Selepas Jualan" },
  "商家 WhatsApp（可空）": { zh: "商家 WhatsApp（可空）", en: "Merchant WhatsApp (optional)", ms: "WhatsApp Peniaga (pilihan)" },
  "实体产品": { zh: "实体产品", en: "Physical Product", ms: "Produk Fizikal" },
  "数字产品": { zh: "数字产品", en: "Digital Product", ms: "Produk Digital" },
  "服务 / 预约": { zh: "服务 / 预约", en: "Service / Appointment", ms: "Servis / Temujanji" },
  "数字产品交付内容": { zh: "数字产品交付内容", en: "Digital Delivery Content", ms: "Kandungan Penghantaran Digital" },
  "服务预约说明": { zh: "服务预约说明", en: "Service / Appointment Instructions", ms: "Arahan Servis / Temujanji" },
  "目标客户：谁最需要这个产品？": { zh: "目标客户：谁最需要这个产品？", en: "Target Customer: who needs this product most?", ms: "Pelanggan Sasaran: siapa paling perlukan produk ini?" },
  "解决什么问题？": { zh: "解决什么问题？", en: "What problem does it solve?", ms: "Masalah apa yang diselesaikan?" },
  "核心卖点 / 好处": { zh: "核心卖点 / 好处", en: "Core Selling Points / Benefits", ms: "Kelebihan Utama / Manfaat" },
  "顾客痛点": { zh: "顾客痛点", en: "Customer Pain Points", ms: "Pain Point Pelanggan" },
  "使用方式 / 交付方式": { zh: "使用方式 / 交付方式", en: "Usage / Delivery Method", ms: "Cara Guna / Cara Penghantaran" },
  "常见问题": { zh: "常见问题", en: "FAQ", ms: "Soalan Lazim" },
  "保障点": { zh: "保障点", en: "Trust / Guarantee Points", ms: "Poin Keyakinan" },
  "真实证明 / 评价 / 案例": { zh: "真实证明 / 评价 / 案例", en: "Proof / Reviews / Cases", ms: "Bukti / Review / Kes" },
  "按钮文字": { zh: "按钮文字", en: "Button Text", ms: "Teks Butang" },
  "预设信息（可空）": { zh: "预设信息（可空）", en: "Preset Message (optional)", ms: "Mesej Pratetap (pilihan)" },
  "产品详细说明（AI 可帮你优化）": { zh: "产品详细说明（AI 可帮你优化）", en: "Product Details (AI can optimize)", ms: "Butiran Produk (AI boleh optimumkan)" },
  "一键 AI 生成 Funnel": { zh: "一键 AI 生成 Funnel", en: "Generate Funnel with AI", ms: "Jana Funnel dengan AI" },
  "生成中...": { zh: "生成中...", en: "Generating...", ms: "Sedang menjana..." },
  "生成失败": { zh: "生成失败", en: "Generation failed", ms: "Gagal menjana" },
  "翻译已自动生成。现在请检查预览，再保存或提交审核。": { zh: "翻译已自动生成。现在请检查预览，再保存或提交审核。", en: "Translations are ready. Please check the preview, then save or submit.", ms: "Terjemahan sudah sedia. Sila semak preview, kemudian simpan atau hantar." },
  "保存草稿 / 提交审核时会自动准备 EN + BM": { zh: "保存草稿 / 提交审核时会自动准备 EN + BM", en: "EN + BM will be prepared automatically when saving or submitting.", ms: "EN + BM akan disediakan automatik semasa simpan atau hantar." },
  "结算预览": { zh: "结算预览", en: "Settlement Preview", ms: "Pratonton Penyelesaian" },
  "Promoter": { zh: "Promoter", en: "Promoter", ms: "Promoter" },
  "LinkFlo": { zh: "LinkFlo", en: "LinkFlo", ms: "LinkFlo" },
  "保存草稿": { zh: "保存草稿", en: "Save Draft", ms: "Simpan Draf" },
  "提交审核": { zh: "提交审核", en: "Submit for Review", ms: "Hantar untuk Semakan" },
  "上一步": { zh: "上一步", en: "Previous", ms: "Sebelumnya" },
  "下一步": { zh: "下一步", en: "Next", ms: "Seterusnya" },
  "下一步：AI Funnel": { zh: "下一步：AI Funnel", en: "Next: AI Funnel", ms: "Seterusnya: AI Funnel" },
  "Preview": { zh: "预览", en: "Preview", ms: "Preview" },
  "编辑": { zh: "编辑", en: "Edit", ms: "Edit" },
  "删除": { zh: "删除", en: "Delete", ms: "Padam" },
  "隐藏": { zh: "隐藏", en: "Hide", ms: "Sembunyi" },
  "恢复显示": { zh: "恢复显示", en: "Restore", ms: "Pulihkan" },
  "展开": { zh: "展开", en: "Expand", ms: "Buka" },
  "收起": { zh: "收起", en: "Collapse", ms: "Tutup" },
  "+ 添加": { zh: "+ 添加", en: "+ Add", ms: "+ Tambah" },
  "添加": { zh: "添加", en: "Add", ms: "Tambah" },
  "问题": { zh: "问题", en: "Question", ms: "Soalan" },
  "答案": { zh: "答案", en: "Answer", ms: "Jawapan" },
  "输入内容": { zh: "输入内容", en: "Enter content", ms: "Masukkan kandungan" },
  "图片上传中...": { zh: "图片上传中...", en: "Uploading images...", ms: "Sedang muat naik gambar..." },
  "图片上传失败": { zh: "图片上传失败", en: "Image upload failed", ms: "Gagal muat naik gambar" },
  "图片已删除": { zh: "图片已删除", en: "Image deleted", ms: "Gambar dipadam" },
  "设主图": { zh: "设主图", en: "Set Main Image", ms: "Tetapkan Gambar Utama" },
  "主图": { zh: "主图", en: "Main Image", ms: "Gambar Utama" },
  "最多 9 张。第一张会作为主图和 Hero 背景。图片不会因为切换语言而消失。": { zh: "最多 9 张。第一张会作为主图和 Hero 背景。图片不会因为切换语言而消失。", en: "Maximum 9 images. The first image is used as the main image and hero background. Images will not disappear when changing language.", ms: "Maksimum 9 gambar. Gambar pertama digunakan sebagai gambar utama dan latar hero. Gambar tidak akan hilang apabila tukar bahasa." },


  // merchant builder dynamic section labels / mixed-language fixes
  "核心卖点 / 好处": { zh: "核心卖点 / 好处", en: "Key Benefits", ms: "Manfaat Utama" },
  "顾客痛点": { zh: "顾客痛点", en: "Customer Pain Points", ms: "Pain Point Pelanggan" },
  "FAQ 常见问题": { zh: "FAQ 常见问题", en: "FAQ", ms: "FAQ" },
  "真实证明 / 评价 / 案例": { zh: "真实证明 / 评价 / 案例", en: "Proof / Reviews / Cases", ms: "Bukti / Review / Kes" },
  "使用方式 / 交付方式": { zh: "使用方式 / 交付方式", en: "Usage / Delivery Method", ms: "Cara Guna / Cara Hantar" },
  "CTA / 保障点": { zh: "CTA / 保障点", en: "CTA / Trust Points", ms: "CTA / Jaminan" },
  "一行一个，AI 会放进 Solution / Offer": { zh: "一行一个，AI 会放进 Solution / Offer", en: "One per line. AI will place these into the Solution / Offer section.", ms: "Satu setiap baris. AI akan masukkan ke bahagian Solution / Offer." },
  "一行一个，AI 会放进 Problem section": { zh: "一行一个，AI 会放进 Problem section", en: "One per line. AI will place these into the Problem section.", ms: "Satu setiap baris. AI akan masukkan ke bahagian Problem." },
  "问题和答案可加减，提交时会进入三语 funnel": { zh: "问题和答案可加减，提交时会进入三语 funnel", en: "You can add or remove Q&A. They will be included in the 3-language funnel.", ms: "Anda boleh tambah atau padam soalan jawapan. Ia akan masuk ke funnel 3 bahasa." },
  "没有就留空，有填才会出现": { zh: "没有就留空，有填才会出现", en: "Leave blank if not available. It only appears when filled.", ms: "Biarkan kosong jika tiada. Ia hanya muncul jika diisi." },
  "实体 / 数字 / 服务都可以写": { zh: "实体 / 数字 / 服务都可以写", en: "Works for physical, digital, or service products.", ms: "Sesuai untuk produk fizikal, digital atau servis." },
  "用于降低顾客疑虑": { zh: "用于降低顾客疑虑", en: "Use this to reduce customer hesitation.", ms: "Gunakan ini untuk kurangkan keraguan pelanggan." },
  "收起": { zh: "收起", en: "Collapse", ms: "Tutup" },
  "展开": { zh: "展开", en: "Expand", ms: "Buka" },
  "问题": { zh: "问题", en: "Question", ms: "Soalan" },
  "答案": { zh: "答案", en: "Answer", ms: "Jawapan" },
  "已新增一项": { zh: "已新增一项", en: "item added", ms: "item ditambah" },
  "已删除一项": { zh: "已删除一项", en: "item removed", ms: "item dipadam" },

  // statuses
  "已上线": { zh: "已上线", en: "Live", ms: "Sudah Live" },
  "待审核": { zh: "待审核", en: "Pending Review", ms: "Menunggu Semakan" },
  "草稿": { zh: "草稿", en: "Draft", ms: "Draf" },
  "被打回": { zh: "被打回", en: "Rejected", ms: "Ditolak" },
  "已准备": { zh: "已准备", en: "Ready", ms: "Sedia" },
  "未完成": { zh: "未完成", en: "Incomplete", ms: "Belum Lengkap" },
  "可生成": { zh: "可生成", en: "Ready to Generate", ms: "Boleh Dijana" },
  "自动准备中": { zh: "自动准备中", en: "Preparing Automatically", ms: "Sedang Disediakan" },

  // admin dashboard / pages
  "LinkFlo 控制台": { zh: "LinkFlo 控制台", en: "LinkFlo Console", ms: "Konsol LinkFlo" },
  "Admin 后台": { zh: "Admin 后台", en: "Admin Panel", ms: "Panel Admin" },
  "总控制台": { zh: "总控制台", en: "Main Dashboard", ms: "Papan Pemuka Utama" },
  "先看钱、风险、待审核和表现最好的产品，不再只是 CRUD list。": { zh: "先看钱、风险、待审核和表现最好的产品，不再只是 CRUD list。", en: "See money, risk, pending reviews and best-performing products first — not just CRUD lists.", ms: "Lihat duit, risiko, semakan tertunda dan produk terbaik dahulu — bukan sekadar senarai CRUD." },
  "总 GMV": { zh: "总 GMV", en: "Total GMV", ms: "Jumlah GMV" },
  "平台收入": { zh: "平台收入", en: "Platform Revenue", ms: "Hasil Platform" },
  "活跃商家": { zh: "活跃商家", en: "Active Merchants", ms: "Peniaga Aktif" },
  "活跃 Promoter": { zh: "活跃 Promoter", en: "Active Promoters", ms: "Promoter Aktif" },
  "待审核产品": { zh: "待审核产品", en: "Pending Products", ms: "Produk Menunggu Semakan" },
  "处理中订单": { zh: "处理中订单", en: "Processing Orders", ms: "Order Diproses" },
  "审核产品 Funnel": { zh: "审核产品 Funnel", en: "Review Product Funnels", ms: "Semak Funnel Produk" },
  "处理订单": { zh: "处理订单", en: "Manage Orders", ms: "Urus Order" },
  "风控中心": { zh: "风控中心", en: "Risk Center", ms: "Pusat Risiko" },
  "结算中心": { zh: "结算中心", en: "Settlement Center", ms: "Pusat Penyelesaian" },
  "优先处理": { zh: "优先处理", en: "Priority Actions", ms: "Tindakan Keutamaan" },
  "还没有足够订单数据。": { zh: "还没有足够订单数据。", en: "Not enough order data yet.", ms: "Data order belum mencukupi." },
  "按已付款订单销售额排序。": { zh: "按已付款订单销售额排序。", en: "Sorted by paid order sales.", ms: "Disusun mengikut jualan order dibayar." },

  // admin products review
  "Products / Funnel 审核": { zh: "Products / Funnel 审核", en: "Products / Funnel Review", ms: "Semakan Produk / Funnel" },
  "先看卡片摘要，点进去才编辑，不需要一直滑长表单。": { zh: "先看卡片摘要，点进去才编辑，不需要一直滑长表单。", en: "Review products from cards first. Click a card to edit instead of scrolling a long form.", ms: "Semak produk melalui kad dahulu. Klik kad untuk edit tanpa skrol borang panjang." },
  "三语 Funnel 审核": { zh: "三语 Funnel 审核", en: "3-Language Funnel Review", ms: "Semakan Funnel 3 Bahasa" },
  "中文": { zh: "中文", en: "Chinese", ms: "Cina" },
  "售价": { zh: "售价", en: "Selling Price", ms: "Harga Jualan" },
  "价格": { zh: "价格", en: "Price", ms: "Harga" },
  "佣金": { zh: "佣金", en: "Commission", ms: "Komisen" },
  "审核": { zh: "审核", en: "Review", ms: "Semak" },
  "审核动作": { zh: "审核动作", en: "Review Actions", ms: "Tindakan Semakan" },
  "打回原因": { zh: "打回原因", en: "Rejection Reason", ms: "Sebab Ditolak" },
  "Approve 上线": { zh: "Approve 上线", en: "Approve & Publish", ms: "Lulus & Terbit" },
  "Reject 打回": { zh: "Reject 打回", en: "Reject", ms: "Tolak" },
  "设为待审核": { zh: "设为待审核", en: "Set as Pending", ms: "Tetapkan Menunggu Semakan" },
  "归档/删除": { zh: "归档/删除", en: "Archive / Delete", ms: "Arkib / Padam" },
  "保存产品资料": { zh: "保存产品资料", en: "Save Product Info", ms: "Simpan Maklumat Produk" },
  "打开公开 Funnel": { zh: "打开公开 Funnel", en: "Open Public Funnel", ms: "Buka Funnel Awam" },
  "公开页面": { zh: "公开页面", en: "Public Page", ms: "Halaman Awam" },
  "还没公开。": { zh: "还没公开。", en: "Not public yet.", ms: "Belum diterbitkan." },
  "选择商家": { zh: "选择商家", en: "Select Merchant", ms: "Pilih Peniaga" },
  "产品主图 URL": { zh: "产品主图 URL", en: "Main Product Image URL", ms: "URL Gambar Utama Produk" },
  "产品图片 URLs（一行一个，最多9张）": { zh: "产品图片 URLs（一行一个，最多9张）", en: "Product Image URLs (one per line, max 9)", ms: "URL Gambar Produk (satu setiap baris, maksimum 9)" },
  "售后 WhatsApp": { zh: "售后 WhatsApp", en: "After-sales WhatsApp", ms: "WhatsApp Selepas Jualan" },
  "库存": { zh: "库存", en: "Stock", ms: "Stok" },
  "服务/预约": { zh: "服务/预约", en: "Service / Appointment", ms: "Servis / Temujanji" },
  "数字/Software": { zh: "数字/Software", en: "Digital / Software", ms: "Digital / Software" },
  "实体产品": { zh: "实体产品", en: "Physical Product", ms: "Produk Fizikal" },
  "产品资料已保存": { zh: "产品资料已保存", en: "Product info saved", ms: "Maklumat produk disimpan" },
  "保存失败": { zh: "保存失败", en: "Save failed", ms: "Gagal menyimpan" },
  "审核失败": { zh: "审核失败", en: "Review failed", ms: "Semakan gagal" },
  "已通过审核，产品公开上线": { zh: "已通过审核，产品公开上线", en: "Approved. Product is now public.", ms: "Diluluskan. Produk kini diterbitkan." },
  "已打回给商家": { zh: "已打回给商家", en: "Returned to merchant", ms: "Dikembalikan kepada peniaga" },
  "状态已更新": { zh: "状态已更新", en: "Status updated", ms: "Status dikemas kini" },
  "产品已归档": { zh: "产品已归档", en: "Product archived", ms: "Produk diarkibkan" },

  // admin orders / risk / settlement
  "订单管理": { zh: "订单管理", en: "Order Management", ms: "Pengurusan Order" },
  "搜索订单 / 顾客 / 商家 / tracking": { zh: "搜索订单 / 顾客 / 商家 / tracking", en: "Search orders / customer / merchant / tracking", ms: "Cari order / pelanggan / peniaga / tracking" },
  "搜索订单、顾客、商家、tracking、status。点卡片进去才处理。": { zh: "搜索订单、顾客、商家、tracking、status。点卡片进去才处理。", en: "Search order, customer, merchant, tracking or status. Open cards to manage details.", ms: "Cari order, pelanggan, peniaga, tracking atau status. Buka kad untuk urus butiran." },
  "保存": { zh: "保存", en: "Save", ms: "Simpan" },
  "退款 / 取消佣金": { zh: "退款 / 取消佣金", en: "Refund / Cancel Commission", ms: "Refund / Batal Komisen" },
  "确认 Promoter 佣金": { zh: "确认 Promoter 佣金", en: "Confirm Promoter Commission", ms: "Sahkan Komisen Promoter" },
  "确认所有到期 commission": { zh: "确认所有到期 commission", en: "Confirm All Due Commissions", ms: "Sahkan Semua Komisen Matang" },
  "可疑订单 / 防刷中心": { zh: "可疑订单 / 防刷中心", en: "Suspicious Orders / Anti-Abuse Center", ms: "Order Mencurigakan / Pusat Anti-Penyalahgunaan" },
  "优先处理同 IP、多账号、同设备、同电话、同地址等高风险订单。严格模式下，这些订单不会自动发 referral Promoter 佣金。": { zh: "优先处理同 IP、多账号、同设备、同电话、同地址等高风险订单。严格模式下，这些订单不会自动发 referral Promoter 佣金。", en: "Prioritize high-risk orders such as same IP, multiple accounts, same device, same phone or same address. In strict mode, referral promoter commission will not be released automatically.", ms: "Utamakan order berisiko seperti IP sama, banyak akaun, peranti sama, telefon sama atau alamat sama. Dalam mod ketat, komisen promoter referral tidak dilepaskan automatik." },
  "暂时没有可疑订单。": { zh: "暂时没有可疑订单。", en: "No suspicious orders for now.", ms: "Tiada order mencurigakan buat masa ini." },
  "解除可疑标记": { zh: "解除可疑标记", en: "Clear Suspicious Flag", ms: "Buang Tanda Mencurigakan" },
  "风险订单": { zh: "风险订单", en: "Risk Orders", ms: "Order Risiko" },
  "风险分": { zh: "风险分", en: "Risk Score", ms: "Skor Risiko" },
  "原因": { zh: "原因", en: "Reason", ms: "Sebab" },
  "佣金冻结": { zh: "佣金冻结", en: "Commission On Hold", ms: "Komisen Dibekukan" },
  "订单ID": { zh: "订单ID", en: "Order ID", ms: "ID Order" },
  "顾客": { zh: "顾客", en: "Customer", ms: "Pelanggan" },
  "钱包 / 结算": { zh: "钱包 / 结算", en: "Wallets / Settlement", ms: "Wallet / Penyelesaian" },
  "这里是商家可结算和 Promoter commission 的人工 payout 参考。现在不会自动打款，先用来对账。": { zh: "这里是商家可结算和 Promoter commission 的人工 payout 参考。现在不会自动打款，先用来对账。", en: "This is a manual payout reference for merchant settlement and promoter commission. It does not auto-payout yet; use it for reconciliation first.", ms: "Ini rujukan payout manual untuk penyelesaian peniaga dan komisen promoter. Belum auto-payout; gunakan untuk semakan akaun dahulu." },
  "可结算参考": { zh: "可结算参考", en: "Settlement Reference", ms: "Rujukan Penyelesaian" },
  "可处理结算": { zh: "可处理结算", en: "Ready to Settle", ms: "Sedia untuk Penyelesaian" },
  "待确认佣金": { zh: "待确认佣金", en: "Pending Commission", ms: "Komisen Menunggu Sahkan" },
  "已打款": { zh: "已打款", en: "Paid Out", ms: "Sudah Dibayar" },

  // admin management
  "管理商家账号、配套和审核状态；产品由商家端上传，AI 生成后提交审核。": { zh: "管理商家账号、配套和审核状态；产品由商家端上传，AI 生成后提交审核。", en: "Manage merchant accounts, packages and approval status. Products are uploaded by merchants, generated with AI and submitted for review.", ms: "Urus akaun peniaga, pakej dan status semakan. Produk dimuat naik oleh peniaga, dijana AI dan dihantar untuk semakan." },
  "新增 Merchant": { zh: "新增 Merchant", en: "Add Merchant", ms: "Tambah Peniaga" },
  "商家名字": { zh: "商家名字", en: "Merchant Name", ms: "Nama Peniaga" },
  "售后 WhatsApp": { zh: "售后 WhatsApp", en: "After-sales WhatsApp", ms: "WhatsApp Selepas Jualan" },
  "恢复启用": { zh: "恢复启用", en: "Restore / Enable", ms: "Pulihkan / Aktifkan" },
  "停用 / Hide 他的商品": { zh: "停用 / Hide 他的商品", en: "Disable / Hide Products", ms: "Lumpuh / Sembunyi Produk" },
  "搜索商家名字 / email / package": { zh: "搜索商家名字 / email / package", en: "Search merchant name / email / package", ms: "Cari nama peniaga / email / pakej" },
  "这里创建 / approve Promoter 账号。Promoter 可以是网红、marketer、agency 或流量手，登录后看产品、复制专属 link、看佣金。": { zh: "这里创建 / approve Promoter 账号。Promoter 可以是网红、marketer、agency 或流量手，登录后看产品、复制专属 link、看佣金。", en: "Create and approve promoter accounts here. Promoters can be influencers, marketers, agencies or traffic partners. After login, they can view products, copy links and check commissions.", ms: "Cipta dan luluskan akaun promoter di sini. Promoter boleh jadi influencer, marketer, agensi atau traffic partner. Selepas login, mereka boleh lihat produk, salin link dan semak komisen." },
  "新增 Promoter 账号": { zh: "新增 Promoter 账号", en: "Add Promoter Account", ms: "Tambah Akaun Promoter" },
  "创建 Promoter": { zh: "创建 Promoter", en: "Create Promoter", ms: "Cipta Promoter" },
  "名字": { zh: "名字", en: "Name", ms: "Nama" },
  "例如 jack": { zh: "例如 jack", en: "e.g. jack", ms: "cth. jack" },

  // merchant orders / billing / apply
  "订单处理中心": { zh: "订单处理中心", en: "Order Fulfillment Center", ms: "Pusat Pengurusan Order" },
  "这里是商家履约页面。重点不是看 list，而是尽快处理订单、填写 tracking、降低售后沟通成本。": { zh: "这里是商家履约页面。重点不是看 list，而是尽快处理订单、填写 tracking、降低售后沟通成本。", en: "This is the merchant fulfillment page. Focus on processing orders, filling tracking and reducing after-sales communication.", ms: "Ini halaman fulfillment peniaga. Fokus untuk proses order, isi tracking dan kurangkan komunikasi selepas jualan." },
  "未填 Tracking": { zh: "未填 Tracking", en: "Missing Tracking", ms: "Belum Isi Tracking" },
  "订单总额": { zh: "订单总额", en: "Order Total", ms: "Jumlah Order" },
  "收货地址": { zh: "收货地址", en: "Shipping Address", ms: "Alamat Penghantaran" },
  "没有收货地址资料": { zh: "没有收货地址资料", en: "No shipping address information", ms: "Tiada maklumat alamat penghantaran" },
  "保存履约资料": { zh: "保存履约资料", en: "Save Fulfillment Info", ms: "Simpan Maklumat Fulfillment" },
  "已出货 / 完成": { zh: "已出货 / 完成", en: "Shipped / Completed", ms: "Dihantar / Selesai" },
  "订单已更新。顾客查询订单时会看到最新 tracking / courier。": { zh: "订单已更新。顾客查询订单时会看到最新 tracking / courier。", en: "Order updated. Customers will see the latest tracking / courier when checking the order.", ms: "Order dikemas kini. Pelanggan akan lihat tracking / courier terbaru apabila semak order." },
  "还没有订单。": { zh: "还没有订单。", en: "No orders yet.", ms: "Belum ada order." },
  "回 Merchant Dashboard": { zh: "回 Merchant Dashboard", en: "Back to Merchant Dashboard", ms: "Kembali ke Dashboard Peniaga" },
  "配套 / Billing": { zh: "配套 / Billing", en: "Plan / Billing", ms: "Pakej / Billing" },
  "选择 / 升级": { zh: "选择 / 升级", en: "Select / Upgrade", ms: "Pilih / Naik Taraf" },
  "商家申请 / 选择配套": { zh: "商家申请 / 选择配套", en: "Merchant Application / Choose Plan", ms: "Permohonan Peniaga / Pilih Pakej" },
  "公司 / 品牌名": { zh: "公司 / 品牌名", en: "Company / Brand Name", ms: "Syarikat / Nama Brand" },
  "提交商家申请": { zh: "提交商家申请", en: "Submit Merchant Application", ms: "Hantar Permohonan Peniaga" },
  "提交中...": { zh: "提交中...", en: "Submitting...", ms: "Sedang hantar..." },
  "查看配套": { zh: "查看配套", en: "View Plans", ms: "Lihat Pakej" },
  "申请失败": { zh: "申请失败", en: "Application failed", ms: "Permohonan gagal" },
  "申请已提交。Admin approve 后就可以登录 Merchant 后台。": { zh: "申请已提交。Admin approve 后就可以登录 Merchant 后台。", en: "Application submitted. You can login to the merchant panel after admin approval.", ms: "Permohonan dihantar. Anda boleh login ke panel peniaga selepas admin luluskan." },
  "商家登录后处理订单和 tracking。": { zh: "商家登录后处理订单和 tracking。", en: "Login as merchant to manage orders and tracking.", ms: "Login sebagai peniaga untuk urus order dan tracking." },
  "登录": { zh: "登录", en: "Login", ms: "Log masuk" }
}

const languages = ["zh", "en", "ms"]
const aliasMap = new Map()
for (const entry of Object.values(UI_TEXT)) {
  for (const l of languages) {
    if (entry[l]) aliasMap.set(normalize(entry[l]), entry)
  }
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim()
}

function skipElement(el) {
  return !el || el.closest?.('[data-product-content="true"], [data-no-ui-translate="true"], [data-admin-translate-skip="true"]')
}

function translateExact(text, lang) {
  const norm = normalize(text)
  const entry = aliasMap.get(norm)
  return entry ? (entry[lang] || entry.zh || text) : null
}

function replaceKnownSegments(text, lang) {
  let next = text
  const entries = Object.values(UI_TEXT)
    .flatMap((entry) => languages.map((l) => ({ from: entry[l], to: entry[lang] || entry.zh })))
    .filter((x) => x.from && x.to && x.from !== x.to && String(x.from).length >= 3)
    .sort((a, b) => String(b.from).length - String(a.from).length)

  for (const { from, to } of entries) {
    if (next.includes(from)) next = next.split(from).join(to)
  }
  return next
}

function translateTextValue(raw, lang) {
  const exact = translateExact(raw, lang)
  if (exact) return exact
  const replaced = replaceKnownSegments(String(raw || ""), lang)
  return replaced === raw ? raw : replaced
}

function translateInputLike(el, lang) {
  const placeholder = el.getAttribute?.("placeholder")
  if (placeholder) {
    const next = translateTextValue(placeholder, lang)
    if (next !== placeholder) el.setAttribute("placeholder", next)
  }
  const title = el.getAttribute?.("title")
  if (title) {
    const next = translateTextValue(title, lang)
    if (next !== title) el.setAttribute("title", next)
  }
  const aria = el.getAttribute?.("aria-label")
  if (aria) {
    const next = translateTextValue(aria, lang)
    if (next !== aria) el.setAttribute("aria-label", next)
  }
}

function translateTextNodes(root, lang) {
  if (!root) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent || skipElement(parent)) return NodeFilter.FILTER_REJECT
      const tag = parent.tagName?.toLowerCase()
      if (["script", "style", "textarea"].includes(tag)) return NodeFilter.FILTER_REJECT
      const value = node.nodeValue || ""
      if (!normalize(value)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach((node) => {
    const old = node.nodeValue || ""
    const leading = old.match(/^\s*/)?.[0] || ""
    const trailing = old.match(/\s*$/)?.[0] || ""
    const body = old.trim()
    const next = translateTextValue(body, lang)
    if (next !== body) node.nodeValue = `${leading}${next}${trailing}`
  })
}

function applyAdminTranslation(lang) {
  if (typeof document === "undefined") return
  const roots = document.querySelectorAll('[data-admin-shell="true"], [data-backend-ui-shell="true"]')
  roots.forEach((root) => {
    root.querySelectorAll("input,textarea,select,button,a,[aria-label],[title]").forEach((el) => {
      if (!skipElement(el)) translateInputLike(el, lang)
    })
    translateTextNodes(root, lang)
  })
}

let applying = false
export default function AdminAutoTranslator() {
  const { lang } = useLanguage()

  useEffect(() => {
    const run = () => {
      if (applying) return
      applying = true
      try { applyAdminTranslation(lang) } finally { setTimeout(() => { applying = false }, 0) }
    }

    run()
    const roots = document.querySelectorAll('[data-admin-shell="true"], [data-backend-ui-shell="true"]')
    if (!roots.length) return
    const observer = new MutationObserver(() => {
      if (!applying) window.requestAnimationFrame(run)
    })
    roots.forEach((root) => observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] }))
    return () => observer.disconnect()
  }, [lang])

  return null
}
