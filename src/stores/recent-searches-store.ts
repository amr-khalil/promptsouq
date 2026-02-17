import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT_SEARCHES = 10;

export interface RecentSearch {
  term: string;
  timestamp: number;
}

interface RecentSearchesState {
  searches: RecentSearch[];
  addSearch: (term: string) => void;
  removeSearch: (term: string) => void;
  clearAll: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set) => ({
      searches: [],
      addSearch: (term) =>
        set((state) => {
          // Remove existing duplicate (case-insensitive)
          const filtered = state.searches.filter(
            (s) => s.term.toLowerCase() !== term.toLowerCase(),
          );
          // Prepend new entry and trim to max
          return {
            searches: [
              { term, timestamp: Date.now() },
              ...filtered,
            ].slice(0, MAX_RECENT_SEARCHES),
          };
        }),
      removeSearch: (term) =>
        set((state) => ({
          searches: state.searches.filter(
            (s) => s.term.toLowerCase() !== term.toLowerCase(),
          ),
        })),
      clearAll: () => set({ searches: [] }),
    }),
    {
      name: "promptsouq-recent-searches",
    },
  ),
);
