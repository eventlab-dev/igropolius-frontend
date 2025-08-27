import { PlayerGame } from "@/lib/api-types-generated";
import { FALLBACK_GAME_POSTER } from "@/lib/constants";
import { useState } from "react";
import ImageLoader from "../../ImageLoader";
import { parseReview } from "@/lib/textParsing";

function StatisticsGameReview({ data, title }: { data: PlayerGame, title: string }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<button
			className="group text-start bg-white/10 p-2.5 rounded-xl max-w-[300px] max-h-[257px] h-full overflow-hidden space-y-[10px] shrink-0 w-full data-[open=true]:max-h-none hover:bg-white/20 transition-all duration-300 cursor-pointer"
			data-open={isOpen}
			onClick={() => setIsOpen(!isOpen)}
		>
			<div className="text-sm font-bold leading-[19px]">
				{title}
			</div>
			<div className="flex gap-2.5">
				<ImageLoader
					className="min-w-[60px] w-[60px] h-[80px] rounded-md overflow-hidden"
					src={data.cover || FALLBACK_GAME_POSTER}
					alt={title}
				/>
				<div className="font-bold">
					{data.rating} / 10 — {data.title}
				</div>
			</div>
			<p className="text-foreground/80 truncate w-full whitespace-normal group-data-[open=false]:line-clamp-5 leading-[19px]">
				{parseReview(data.review)}
			</p>
		</button>
	)
}

export default StatisticsGameReview;
