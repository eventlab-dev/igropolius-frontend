import { PlayerFinalStats } from "@/lib/api-types-generated";
import { FALLBACK_AVATAR_URL } from "@/lib/constants";
import { playersData } from "@/lib/mockData";
import { StatisticsCardProps } from "./StatisticsCard";
import { formatMs } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatisticsHeading from "./StatisticsHeading";
import StatisticsRows from "./StatisticsRows";
import { Skeleton } from "@/components/ui/skeleton";
import StatisticsGameReview from "./StatisticsGameReview";
import { Share } from "@/components/icons";

type PlayerSectionProps = {
	data: PlayerFinalStats & {
		placement: number;
		monopolies_amount: number;
		buildings_amount: number;
	};
}

function StatisticsPlayerSection({ data }: PlayerSectionProps) {
	const color = playersData.find((p) => p.id === data.player_id)?.color || 'white';
	const avatar = playersData.find((p) => p.id === data.player_id)?.avatar_link || FALLBACK_AVATAR_URL;
	const filteredData = {
		total_score: data.total_score,
		games_completed: data.games_completed,
		games_dropped: data.games_dropped,
		longest_game_hours: data.longest_game_hours,
		shortest_game_hours: data.shortest_game_hours,
		cards_amount: data.cards_amount,
		hours_played: data.hours_played,
		buildings_amount: data.buildings_amount,
		monopolies_amount: data.monopolies_amount,
	};

	const keyToProps = (key: string): Omit<StatisticsCardProps, 'value'> => {
		switch (key) {
			case 'total_score': {
				const totalScoreText =
					data.placement === 1
						? 'Очков — самый\nбогатый'
						: data.placement === playersData.length
							? 'Очков — \nБанкрот!'
							: 'Очков\nполучено';
				return {
					text: totalScoreText,
					icon: <Share className="size-[26px]" />,
					order: 1,
				};
			}
			case 'longest_game_hours':
				return {
					text: `Самая\nдлинная игра`,
					modifiedValue: formatMs(data[key] * 1000),
					order: 4,
				};
			case 'shortest_game_hours':
				return {
					text: `Самая\nкороткая игра`,
					modifiedValue: formatMs(data[key] * 1000),
					order: 9,
				};
			case 'hours_played':
				return {
					text: `Наиграно в игры\nна ивенте`,
					modifiedValue: formatMs(data[key] * 1000),
					order: 6,
				};
			case 'games_completed':
				return { text: `Игр\nпройдено`, order: 3, };
			case 'games_dropped':
				return { text: `Игр\nдропнуто`, order: 7, };
			case 'cards_amount':
				return { text: `Карточек\nзаролено`, order: 5, };
			case 'buildings_amount':
				return { text: `Зданий\nна карте`, order: 2, };
			case 'monopolies_amount':
				return { text: `Монополий\nпостроено`, order: 8, };
			default:
				return { text: '', order: 0, };
		}
	};

	return (
		<div className="space-y-[30px]">
			<div className="space-y-[15px]">
				<Badge
					className="flex py-1 uppercase font-roboto-wide-semibold-italic leading-[19px] border-0 mx-auto"
					style={{ backgroundColor: color }}
				>
					{data.placement} место
				</Badge>
				<div className="flex gap-2 justify-center items-center">
					<div className="relative">
						<Avatar className="size-[56px] overflow-auto">
							<AvatarImage src={avatar} />
							<AvatarFallback className="uppercase">{data.username.slice(0, 2)}</AvatarFallback>
						</Avatar>
					</div>
					<StatisticsHeading>
						{data.username}
					</StatisticsHeading>
				</div>
			</div>

			<StatisticsRows data={filteredData} keyToProps={keyToProps} />

			<div className="space-y-[15px]">
				<div className="text-center font-roboto-wide-black-alt text-2xl leading-7">Лучший клип</div>
				<div className="w-[500px] h-[281px] shrink-0 mx-auto">
					<Skeleton className="w-full h-full" />
				</div>
			</div>

			{(data.best_rated_game && data.worst_rated_game) && (
				<div className="flex gap-[15px] justify-center">
					{data.best_rated_game && (
						<StatisticsGameReview data={data.best_rated_game} title="Лучшая игра" />
					)}
					{data.worst_rated_game && (
						<StatisticsGameReview data={data.worst_rated_game} title="Худшая игра" />
					)}
				</div>
			)}
		</div>
	)
}

export default StatisticsPlayerSection;
