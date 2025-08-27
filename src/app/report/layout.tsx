export default function ReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="report-layout">
      {children}
    </div>
  );
}