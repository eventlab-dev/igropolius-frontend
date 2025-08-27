import { CreditsData } from "@/lib/mockData";
import StatisticsHeading from "./StatisticsHeading";

function StatisticsCredits() {
	const creditsData = [{ name: 'Praden', action: 'геймдизайн, идеи' }, ...CreditsData];

	return (
		<div className="space-y-[59px]">
			<StatisticsHeading>
				Команда разработки
			</StatisticsHeading>
			<div className="space-y-[50px]">
				{creditsData.map(({ name, action }) => (
					<div key={name} className="text-center space-y-[15px]">
						<div className="font-roboto-wide-black-alt text-2xl leading-7">{name}</div>
						<div className="text-foreground/80 font-roboto-wide-semibold-italic text-xl leading-[23px]">{action}</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default StatisticsCredits;
