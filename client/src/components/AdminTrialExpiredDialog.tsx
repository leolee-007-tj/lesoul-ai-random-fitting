import { QrCode, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type Trial = { paymentQrUrl: string | null; paymentNoticeEn: string; paymentNoticeKo: string; paymentNoticeZh: string; usageGuideQrUrl: string | null; usageGuideNoticeEn: string; usageGuideNoticeKo: string; usageGuideNoticeZh: string };

export default function AdminTrialExpiredDialog({ trial }: { trial: Trial }) {
  const { i18n } = useTranslation();
  const [, navigate] = useLocation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { eyebrow: "ADMIN TRIAL ENDED", title: "관리자 체험 기간이 종료되었습니다", payment: "수동 연장 결제", guide: "사용 방법 안내", scan: "QR을 스캔해 수동 연장 안내를 진행해 주세요.", missing: "결제 QR이 아직 등록되지 않았습니다. 스토어 소유자에게 수동 연장 방법을 문의해 주세요.", public: "공개 소개로 이동" }
    : locale === "zh"
      ? { eyebrow: "ADMIN TRIAL ENDED", title: "管理员体验已结束", payment: "人工续费付款", guide: "使用方法指南", scan: "请扫描二维码，根据指引进行人工续费。", missing: "尚未登记付款二维码。请联系店铺所有者获取人工续费方式。", public: "前往公开介绍页" }
      : { eyebrow: "ADMIN TRIAL ENDED", title: "Your administrator trial has ended", payment: "Manual renewal payment", guide: "Usage guide", scan: "Scan the QR code to arrange manual renewal.", missing: "A payment QR has not been registered yet. Please contact the store owner for manual renewal.", public: "Open public introduction" };
  const notice = locale === "ko" ? trial.paymentNoticeKo : locale === "zh" ? trial.paymentNoticeZh : trial.paymentNoticeEn;
  const guideNotice = locale === "ko" ? trial.usageGuideNoticeKo : locale === "zh" ? trial.usageGuideNoticeZh : trial.usageGuideNoticeEn;
  return <main className="lesoul-safe-modal z-50 px-5"><section className="mx-auto max-h-[94svh] w-full max-w-sm overflow-y-auto rounded-[1.8rem] bg-[#f8f5ef] p-6 text-center shadow-2xl"><ShieldAlert className="mx-auto text-[#7a5a42]" size={31} /><p className="mt-3 text-[10px] font-bold tracking-[.18em] text-[#856c55]">{copy.eyebrow}</p><h1 className="mt-2 font-serif text-3xl text-[#28231e]">{copy.title}</h1><p className="mt-3 text-sm leading-6 text-[#655c53]">{notice}</p>{trial.paymentQrUrl ? <div className="mt-5 rounded-2xl bg-white p-3"><p className="text-[10px] font-bold tracking-[.14em] text-[#79634f]">{copy.payment}</p><img src={trial.paymentQrUrl} alt="Manual renewal payment QR" className="mx-auto mt-2 aspect-square w-full max-w-60 object-contain" /><p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-[#60564b]"><QrCode size={14} />{copy.scan}</p></div> : <p className="mt-5 rounded-2xl border border-[#ded2c4] bg-[#fffaf3] p-4 text-sm leading-6 text-[#715f4f]">{copy.missing}</p>}{trial.usageGuideQrUrl && <div className="mt-3 rounded-2xl border border-[#ded2c4] bg-white p-3"><p className="text-[10px] font-bold tracking-[.14em] text-[#79634f]">{copy.guide}</p><img src={trial.usageGuideQrUrl} alt="Administrator usage guide QR" className="mx-auto mt-2 aspect-square w-full max-w-52 object-contain" /><p className="mt-2 text-xs leading-5 text-[#60564b]">{guideNotice}</p></div>}<button onClick={() => navigate("/about")} className="mt-6 h-11 rounded-full bg-black px-5 text-xs font-semibold text-white">{copy.public}</button></section></main>;
}
