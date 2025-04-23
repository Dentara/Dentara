import { useHits } from "react-instantsearch";
import { integrations, messages } from "../../../integrations.config";

export default function EmptyState() {
  const { items } = useHits();

  if(!integrations.isSanityEnabled) {
    return (
      <div className="p-8">{messages.algolia}</div>
    )
  }

  if(!items.length) {
    return (
      <div className="p-8">
        <p className="text-center text-base text-body-color">
          No items found...
        </p>
      </div>
    )
  }
};

