import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useMemo, useCallback, useRef } from "react";
import { Search, X } from "lucide-react-native";
import { useExplorer } from "@/src/lib/hooks/use-explorer";
import { EventCard } from "@/src/components/shared/EventCard";
import { EventCategory, FeedFilters } from "@/src/lib/types/feed.type";

// ─── Config catégories ────────────────────────────────────────
const CATEGORIES: { label: string; value: EventCategory; emoji: string }[] = [
  { label: "Concert", value: "CONCERT", emoji: "🎵" },
  { label: "Conférence", value: "CONFERENCE", emoji: "🎤" },
  { label: "Sport", value: "SPORT", emoji: "⚽" },
  { label: "Fête", value: "FETE", emoji: "🎉" },
  { label: "Art", value: "ART", emoji: "🎨" },
  { label: "Gastro", value: "GASTRONOMIE", emoji: "🍽️" },
  { label: "Autre", value: "AUTRE", emoji: "📅" },
];

// ─── Chip filtre ──────────────────────────────────────────────
function FilterChip({
  label,
  active,
  onPress,
  emoji,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  emoji?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-1.5 px-4 py-2 rounded-full border mr-2"
      style={{
        backgroundColor: active ? "#6366f1" : "#ffffff",
        borderColor: active ? "#6366f1" : "#e5e7eb",
      }}
    >
      {emoji && <Text style={{ fontSize: 13 }}>{emoji}</Text>}
      <Text
        className="text-sm font-medium"
        style={{ color: active ? "#ffffff" : "#6b7280" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function ExplorerScreen() {
  const insets = useSafeAreaInsets();

  // Filtres
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | undefined
  >();
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Debounce search
  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 400);
  }, []);

  const filters: FeedFilters = useMemo(
    () => ({
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(isFreeOnly && { isFree: true }),
    }),
    [debouncedSearch, selectedCategory, isFreeOnly],
  );

  const hasFilters = !!debouncedSearch || !!selectedCategory || isFreeOnly;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useExplorer(filters);

  const events = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategory(undefined);
    setIsFreeOnly(false);
  }, []);

  const toggleCategory = useCallback((cat: EventCategory) => {
    setSelectedCategory((prev) => (prev === cat ? undefined : cat));
  }, []);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pt-3 pb-2">
        <Text className="text-foreground font-bold text-2xl mb-4">
          Explorer
        </Text>

        {/* Barre de recherche */}
        <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-12 gap-3">
          <Search size={16} color="#9ca3af" />
          <TextInput
            className="flex-1 text-foreground text-sm"
            placeholder="Rechercher un événement, un lieu..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres */}
      <View className="pb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
        >
          {/* Gratuit */}
          <FilterChip
            label="Gratuit"
            emoji="🎟️"
            active={isFreeOnly}
            onPress={() => setIsFreeOnly((v) => !v)}
          />

          {/* Catégories */}
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.value}
              label={cat.label}
              emoji={cat.emoji}
              active={selectedCategory === cat.value}
              onPress={() => toggleCategory(cat.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Résumé filtres actifs */}
      {hasFilters && (
        <View className="flex-row items-center justify-between px-4 pb-2">
          <Text className="text-muted-foreground text-xs">
            {events.length} résultat{events.length > 1 ? "s" : ""}
          </Text>
          <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
            <Text className="text-primary text-xs font-semibold">
              Effacer les filtres
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Résultats */}
      {!hasFilters ? (
        <EmptySearch />
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            ) : null
          }
          ListEmptyComponent={<NoResults search={debouncedSearch} />}
        />
      )}
    </View>
  );
}

// ─── État vide — invite à chercher ────────────────────────────
function EmptySearch() {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-4">
      <Text className="text-5xl">🔍</Text>
      <Text className="text-foreground font-bold text-lg text-center">
        Trouvez votre prochain event
      </Text>
      <Text className="text-muted-foreground text-sm text-center leading-6">
        Recherchez par nom, filtrez par catégorie ou par tarif pour trouver
        événement parfait.
      </Text>

      {/* Suggestions rapides */}
      <View className="flex-row flex-wrap gap-2 justify-center mt-2">
        {["🎵 Concert", "🎉 Fête", "🎨 Art"].map((s) => (
          <View
            key={s}
            className="bg-muted/50 border border-border rounded-full px-3 py-1.5"
          >
            <Text className="text-muted-foreground text-xs font-medium">
              {s}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Aucun résultat ───────────────────────────────────────────
function NoResults({ search }: { search: string }) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8 gap-3">
      <Text className="text-4xl">😕</Text>
      <Text className="text-foreground font-bold text-lg text-center">
        Aucun résultat
      </Text>
      <Text className="text-muted-foreground text-sm text-center leading-6">
        {search
          ? `Aucun événement ne correspond à "${search}"`
          : "Aucun événement ne correspond à vos filtres"}
      </Text>
    </View>
  );
}
