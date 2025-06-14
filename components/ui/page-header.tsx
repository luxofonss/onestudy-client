import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string | ReactNode;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {typeof title === "string" ? (
            <h1 className="text-2xl font-medium mb-1 text-white">
              <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
          ) : (
            title
          )}
          {description && (
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex flex-wrap gap-2 md:justify-end">{children}</div>
        )}
      </div>
    </div>
  );
}
