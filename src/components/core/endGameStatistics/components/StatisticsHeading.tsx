import { cn } from "@/lib/utils";

function StatisticsHeading({ className, children }: { className?: string, children: React.ReactNode }) {
	return (
		<div className={cn("font-wide-black text-5xl leading-14 text-center font-roboto-wide-black-alt", className)}>
			{children}
		</div>
	)
}

export default StatisticsHeading;
