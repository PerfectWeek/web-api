import { EventSuggestion } from "../../../utils/types/EventSuggestion";
import { EventView } from "../EventView";

export class EventSuggestionView {

    public static formatSuggestion(suggestion: EventSuggestion): any {
        return {
            event: EventView.formatEvent(suggestion.event),
            score: suggestion.score.toFixed(2)
        };
    }
}
