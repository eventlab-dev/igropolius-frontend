export type StatisticsCardProps = {
	value: number | string;
	text: string;
	order: number;
	modifiedValue?: number | string;
	icon?: React.ReactNode;
}

function StatisticsCard({ value, text, modifiedValue, icon, order }: StatisticsCardProps) {
	return (
		<div className="bg-white/10 flex gap-2.5 flex-col p-2.5 rounded-xl" style={{ order }}>
			<div className="text-[32px] font-roboto-wide-black-alt leading-[38px] inline-flex items-center">
				{modifiedValue || value.toLocaleString('ru-RU')} {icon}
			</div>
			<div className="font-bold text-[#F2F2F2]/80 whitespace-pre-line leading-[19px]">
				{text}
			</div>
		</div>
	)
}

export default StatisticsCard;
