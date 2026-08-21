ALTER TABLE `releaseSettings` ADD `adminTrialStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `adminTrialDurationHours` int DEFAULT 48 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `adminTrialPaymentQrUrl` text;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `adminTrialPaymentNoticeEn` varchar(800) DEFAULT 'Your administrator trial has ended. Please scan the QR code to arrange manual renewal, then contact the store owner for activation.' NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `adminTrialPaymentNoticeKo` varchar(800) DEFAULT '관리자 체험 기간이 종료되었습니다. QR 코드를 스캔하여 수동 연장을 진행한 뒤, 스토어 소유자에게 활성화를 요청해 주세요.' NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `adminTrialPaymentNoticeZh` varchar(800) DEFAULT '管理员体验已结束。请扫描二维码安排人工续费，然后联系店铺所有者开通权限。' NOT NULL;