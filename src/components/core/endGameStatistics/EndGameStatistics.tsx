import { FinalStatsResponse } from "@/lib/api-types-generated";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { playersData } from "@/lib/mockData";
import { ScrollArea } from "../../ui/scroll-area";
import { cn } from "@/lib/utils";
import usePlayerStore from "@/stores/playerStore";
import { useState } from "react";
import { buttonVariants } from "../../ui/button";
import { XIcon } from "lucide-react";
import StatisticsHeading from "./components/StatisticsHeading";
import StatisticsGeneralSection from "./components/StatisticsGeneralSection";
import StatisticsPlayerSection from "./components/StatisticsPlayerSection";
import StatisticsCredits from "./components/StatisticsCredits";

// data from backend
const { players, ...generalStatistics }: FinalStatsResponse & { games_rerolled: number } = {
	total_score: 10000,
	completed_games: 235,
	dice_rolls: 300,
	hours_spent_on_games: 156,
	cards_received: 421,
	cards_used: 200,
	maps_completed: 20,
	games_dropped_or_rerolled: 55,
	games_rerolled: 12,
	train_rides: 24,
	average_rating_of_completed_games: 5,
	players: playersData.map((player) => ({
		player_id: player.id,
		username: player.username,
		total_score: player.total_score,
		games_completed: player.games.filter((g) => g.status === "completed").length,
		games_dropped: player.games.filter((g) => g.status === "drop").length,
		longest_game_hours: player.games.sort((a, b) => (b.duration || 0) - (a.duration || 0))[0]?.duration || 0,
		shortest_game_hours: player.games.sort((a, b) => (a.duration || 0) - (b.duration || 0))[0]?.duration || 0,
		cards_amount: 60,
		hours_played: player.games.reduce((prev, curr) => ({ duration: (prev.duration || 0) + (curr.duration || 0) }), { duration: 0 }).duration,
		best_rated_game: playersData[0].games[4],
		worst_rated_game: playersData[playersData.length - 1].games[1],
	})),
};

function EndGameStatistics() {
	const [isOpen, setIsOpen] = useState(false);
	const buildingsPerSector = usePlayerStore((state) => state.buildingsPerSector);

	const extendedPlayers = players.map((player) => ({
		...player,
		monopolies_amount: 1,
		buildings_amount: getPlayersBuildings(player.player_id),
	})).sort((a, b) => b.total_score - a.total_score);

	function getPlayersBuildings(playerId: number) {
		return Object.values(buildingsPerSector).flatMap((buildings) => {
			return buildings.filter((b) => b.owner.id === playerId);
		}).length;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger className="absolute" />
			<DialogContent className="!max-w-none w-full h-full !bg-black/20 backdrop-blur-[50px] p-0">
				<ScrollArea className="h-full overflow-hidden">
					<div className="flex flex-col gap-[150px] pt-[98px] pb-[369px]">
						<DialogHeader className="gap-[30px]">
							<DialogTitle>
								<StatisticsHeading>
									<span className="text-primary">Игрополиус</span> окончен!
								</StatisticsHeading>
							</DialogTitle>
							<DialogDescription className="text-center text-2xl text-foreground font-roboto-wide-black-alt w-[670px] mx-auto leading-7">
								Спасибо всем за участие, и за то что смотрели, дальше — больше :)
							</DialogDescription>
						</DialogHeader>

						<div className="mx-auto">
							<StatisticsGeneralSection data={generalStatistics} />

							<div className="space-y-[224px] mb-[166px]">
								{extendedPlayers.map((player, idx) => (
									<StatisticsPlayerSection key={idx} data={{ ...player, placement: idx + 1 }} />
								))}
							</div>

							<StatisticsCredits />

							<div className="flex flex-col justify-center gap-[50px] mt-[200px]">
								<StatisticsHeading>
									Спасибо ещё раз!
								</StatisticsHeading>

								<DialogClose className={cn(buttonVariants({ variant: "action" }), "mx-auto")}>
									Закрыть титры
								</DialogClose>
							</div>
						</div>

						<DialogClose className="absolute top-[50px] right-[60px] cursor-pointer">
							<XIcon className="stroke-3 size-8" />
						</DialogClose>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}

export default EndGameStatistics;
