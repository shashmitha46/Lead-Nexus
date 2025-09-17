import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between space-y-2", className)}>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-headline">
        {title}
      </h1>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  );
}
