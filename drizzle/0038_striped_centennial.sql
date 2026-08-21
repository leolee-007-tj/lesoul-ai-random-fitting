ALTER TABLE `releaseSettings` ADD `adminTrialUsageGuideQrUrl` text;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `adminTrialUsageGuideNoticeEn` varchar(800) DEFAULT 'Scan the guide QR to view how to use the administrator console and submit a renewal request.' NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `adminTrialUsageGuideNoticeKo` varchar(800) DEFAULT '사용 방법 QR을 스캔하여 관리자 콘솔 이용 방법과 연장 요청 절차를 확인해 주세요.' NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `adminTrialUsageGuideNoticeZh` varchar(800) DEFAULT '请扫描使用指南二维码，查看管理员控制台使用方法和续费申请流程。' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `adminTrialStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `adminTrialDurationHours` int DEFAULT 48 NOT NULL;