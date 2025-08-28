import { cn } from "@/lib/utils";

type Props = {
	className?: string
	children: React.ReactNode
}

function StatisticsHeading({ className, children }: Props) {
	return (
		<div className={cn("font-wide-black text-5xl leading-14 text-center font-roboto-wide-black-alt", className)}>
			{children}
		</div>
	)
}

export default StatisticsHeading;
