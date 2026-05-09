import { useLocalSearchParams, useRouter, Href } from "expo-router";

interface UseSmartBackOptions {
  defaultRoute: Href;
  routeMap?: Record<string, Href>;
}

export function useSmartBack({ defaultRoute, routeMap }: UseSmartBackOptions) {
  const router = useRouter();
  const { from } = useLocalSearchParams();

  const goBack = () => {
    const safeFrom = Array.isArray(from) ? from[0] : from;

    if (safeFrom && routeMap && routeMap[safeFrom]) {
      router.navigate(routeMap[safeFrom]);
      return;
    }
    const rootTabs = ["feed", "explorer", "create", "profile"];
    if (safeFrom && rootTabs.includes(safeFrom)) {
      router.navigate(`/(tabs)/${safeFrom}` as Href);
      return;
    }
    router.navigate(defaultRoute);
  };

  return goBack;
}
