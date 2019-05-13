import { EventSuggestionView} from "./EventSuggestionView";
import { EventSuggestion } from "../../../utils/types/EventSuggestion";

export class EventSuggestionListView {

    public static formatSuggestionList(suggestionList: EventSuggestion[]): any {
        return suggestionList.map(EventSuggestionView.formatSuggestion);
    }
}
