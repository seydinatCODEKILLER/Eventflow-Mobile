import { Href, useRouter } from "expo-router";


/**
 * Hook pour revenir au parent au lieu d'utiliser router.back()
 * Évite le problème où back() traverse les onglets
 */
export function useBackToParent(parentRoute: Href) {
  const router = useRouter();

  return () => {
    router.navigate(parentRoute);
  };
}