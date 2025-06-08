import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-purple-200 bg-clip-text">
            {title}
          </h1>
          {description && (
            <p className="text-gray-800 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex gap-2">{children}</div>}
      </div>
    </div>
  );
}
