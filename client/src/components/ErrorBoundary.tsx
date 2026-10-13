import { cn } from "@/lib/utils";
import i18n from "@/i18n";
import { AlertTriangle, Copy, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const copy = i18n.language.startsWith("ko") ? { title: "예기치 않은 오류가 발생했습니다.", reload: "페이지 새로고침", retry: "다시 시도", back: "이전 화면으로", details: "오류 세부 정보", copy: "에러 내용 복사", copied: "복사됨" } : i18n.language.startsWith("zh") ? { title: "发生了意外错误。", reload: "重新加载页面", retry: "重试", back: "返回上一页", details: "错误详情", copy: "复制错误内容", copied: "已复制" } : { title: "An unexpected error occurred.", reload: "Reload Page", retry: "Try Again", back: "Go Back", details: "Error details", copy: "Copy error details", copied: "Copied" };
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-6">{copy.title}</h2>
            {this.state.error?.message && <details className="mb-6 w-full max-w-xl rounded-lg border border-border bg-muted/40 p-3 text-left text-xs"><summary className="cursor-pointer font-semibold">{copy.details}</summary><code className="mt-2 block break-words whitespace-pre-wrap">{this.state.error.message}</code></details>}
            <div className="flex flex-wrap justify-center gap-2">
            {this.state.error?.message && <button
              onClick={() => { void navigator.clipboard?.writeText(this.state.error?.message ?? ""); }}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg", "border border-border bg-background text-foreground", "hover:opacity-90 cursor-pointer")}
            ><Copy size={16} aria-hidden="true" />{copy.copy}</button>}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "border border-border bg-background text-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} aria-hidden="true" />
              {copy.retry}
            </button>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} aria-hidden="true" />
              {copy.reload}
            </button>
            <button
              onClick={() => window.history.back()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "text-muted-foreground hover:opacity-90 cursor-pointer"
              )}
            >{copy.back}</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
