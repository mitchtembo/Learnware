import { ReactNode } from "react";
import MainLayout from "./MainLayout";
import { PageLoader } from "@/components/ui/loading";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  loading?: boolean;
  loadingText?: string;
  actions?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function PageLayout({
  children,
  title,
  description,
  loading = false,
  loadingText,
  actions,
  fullWidth = false,
  className = "",
}: PageLayoutProps) {
  return (
    <MainLayout>
      <div className={`space-y-6 ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>

        {loading ? (
          <PageLoader text={loadingText} />
        ) : (
          <div className={fullWidth ? "w-full" : "max-w-5xl mx-auto"}>{children}</div>
        )}
      </div>
    </MainLayout>
  );
}

export default PageLayout; 