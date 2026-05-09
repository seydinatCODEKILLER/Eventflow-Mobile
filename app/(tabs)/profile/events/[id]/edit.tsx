import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useLocalSearchParams } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Tag,
  DollarSign,
  FileText,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Ticket,
  Save,
} from "lucide-react-native";
import {
  eventStep1Schema,
  eventStep2Schema,
  eventStep3Schema,
  EventStep1Values,
  EventStep2Values,
  EventStep3Values,
} from "@/src/lib/validators/event.schema";
import { useEvent, useUpdateEvent } from "@/src/lib/hooks/use-events";
import { EventCategory } from "@/src/lib/types/feed.type";
import { formatDateTime } from "@/src/lib/utils/format";
import { FormInput } from "@/src/components/ui/FormInput";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

// ─── Config catégories ────────────────────────────────────────
const CATEGORIES: { label: string; value: EventCategory; emoji: string }[] = [
  { label: "Concert", value: "CONCERT", emoji: "🎵" },
  { label: "Conférence", value: "CONFERENCE", emoji: "🎤" },
  { label: "Sport", value: "SPORT", emoji: "⚽" },
  { label: "Fête", value: "FETE", emoji: "🎉" },
  { label: "Art", value: "ART", emoji: "🎨" },
  { label: "Gastronomie", value: "GASTRONOMIE", emoji: "🍽️" },
  { label: "Autre", value: "AUTRE", emoji: "📅" },
];

const STEPS = ["Présentation", "Lieu & Dates", "Billetterie"];
const stepTitles = [
  { title: "Modifier la présentation", sub: "Titre, description et catégorie" },
  { title: "Lieu & Dates", sub: "Où et quand se déroule l'event ?" },
  { title: "Billetterie", sub: "Capacité et tarification" },
];

// ─── Barre de progression ─────────────────────────────────────
const StepProgress = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <View className="flex-row gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        className="h-1 rounded-full"
        style={{
          flex: 1,
          backgroundColor: i + 1 <= current ? "#6366f1" : "#e5e7eb",
        }}
      />
    ))}
  </View>
);

// ─── Boutons navigation ───────────────────────────────────────
function NavButtons({
  onBack,
  onNext,
  onSubmit,
  isPending,
  isLast,
}: {
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isPending?: boolean;
  isLast?: boolean;
}) {
  return (
    <View className="flex-row gap-3 mt-4">
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.8}
          className="items-center justify-center bg-card border border-border rounded-2xl px-5 py-4"
        >
          <ArrowLeft size={16} color="#6b7280" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={isLast ? onSubmit : onNext}
        disabled={isPending}
        activeOpacity={0.85}
        className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4"
        style={{
          backgroundColor: isPending ? "#a5b4fc" : "#6366f1",
          shadowColor: "#6366f1",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text className="text-white font-bold text-sm">
              {isLast ? "Sauvegarder" : "Continuer"}
            </Text>
            {isLast ? (
              <Save size={16} color="white" />
            ) : (
              <ChevronRight size={16} color="white" />
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const goBackToEvent = useSmartBack({
    defaultRoute: `/(tabs)/profile/events/${id}` as Href,
  });

  const { data: event, isLoading } = useEvent(id);
  const { mutate: updateEvent, isPending } = useUpdateEvent(id);

  const [step, setStep] = useState(1);
  const [collected, setCollected] = useState<
    Partial<EventStep1Values & EventStep2Values & EventStep3Values>
  >({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // ── Formulaires ───────────────────────────────────────────
  const form1 = useForm<EventStep1Values>({
    resolver: zodResolver(eventStep1Schema),
    defaultValues: {
      title: "",
      description: "",
      category: "AUTRE",
      imageUri: undefined,
    },
  });

  const form2 = useForm<EventStep2Values>({
    resolver: zodResolver(eventStep2Schema),
    defaultValues: {
      location: "",
      city: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const form3 = useForm<EventStep3Values>({
    resolver: zodResolver(eventStep3Schema),
    defaultValues: {
      capacity: 0,
      isFree: true,
      price: 0,
      currency: "XOF",
    },
  });

  // ── Préremplir avec les données existantes ────────────────
  useEffect(() => {
    if (!event) return;

    form1.reset({
      title: event.title,
      description: event.description ?? "",
      category: event.category,
      imageUri: event.imageUrl ?? undefined,
    });

    form2.reset({
      location: event.location,
      city: event.city ?? "",
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
    });

    form3.reset({
      capacity: event.capacity,
      isFree: event.isFree,
      price: event.price ?? 0,
      currency: event.currency,
    });

    // Initialiser collected avec les données existantes
    setCollected({
      title: event.title,
      description: event.description ?? "",
      category: event.category,
      location: event.location,
      city: event.city ?? "",
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
      capacity: event.capacity,
      isFree: event.isFree,
      price: event.price ?? 0,
      currency: event.currency,
    });
  }, [event]);

  const selectedCategory = form1.watch("category");
  const startDate = form2.watch("startDate");
  const isFree = form3.watch("isFree");

  // ── Sélection image ───────────────────────────────────────
  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      form1.setValue("imageUri", result.assets[0].uri);
    }
  }, [form1]);

  // ── Date picker Android ───────────────────────────────────
  const openDatePicker = useCallback(
    (mode: "start" | "end", currentValue: Date | undefined) => {
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          value: currentValue ?? new Date(),
          mode: "date",
          minimumDate: mode === "end" ? (startDate ?? new Date()) : new Date(),
          onChange: (_, date) => {
            if (!date) return;
            DateTimePickerAndroid.open({
              value: date,
              mode: "time",
              onChange: (_, time) => {
                if (!time) return;
                const combined = new Date(date);
                combined.setHours(time.getHours(), time.getMinutes());
                if (mode === "start") form2.setValue("startDate", combined);
                else form2.setValue("endDate", combined);
              },
            });
          },
        });
      } else {
        if (mode === "start") setShowStartPicker(true);
        else setShowEndPicker(true);
      }
    },
    [startDate, form2],
  );

  // ── Navigation étapes ─────────────────────────────────────
  const goNext1 = form1.handleSubmit((v) => {
    setCollected((p) => ({ ...p, ...v }));
    setStep(2);
  });

  const goNext2 = form2.handleSubmit((v) => {
    setCollected((p) => ({ ...p, ...v }));
    setStep(3);
  });

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = form3.handleSubmit((v) => {
    const final = { ...collected, ...v };
    updateEvent({
      title: final.title,
      description: final.description,
      category: final.category,
      location: final.location,
      city: final.city,
      startDate: (final.startDate as Date).toISOString(),
      endDate: (final.endDate as Date | undefined)?.toISOString(),
      capacity: final.capacity,
      isFree: final.isFree,
      price: final.isFree ? undefined : final.price,
      currency: final.currency,
      imageUri: imageUri ?? undefined,
    });
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Header ── */}
        <View className="px-4 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={goBackToEvent}
                className="w-8 h-8 bg-card border border-border rounded-xl items-center justify-center mr-1"
                activeOpacity={0.7}
              >
                <ArrowLeft size={16} color="#374151" />
              </TouchableOpacity>
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-xs font-bold">{step}</Text>
              </View>
              <Text className="text-muted-foreground text-sm font-medium">
                sur {STEPS.length} · {STEPS[step - 1]}
              </Text>
            </View>
            <View className="w-10 h-10 bg-primary rounded-2xl items-center justify-center">
              <Text className="text-white font-bold text-lg">E</Text>
            </View>
          </View>

          <StepProgress current={step} total={STEPS.length} />

          <View className="mt-6">
            <Text className="text-foreground font-bold text-2xl">
              {stepTitles[step - 1].title}
            </Text>
            <Text className="text-muted-foreground text-sm mt-1">
              {stepTitles[step - 1].sub}
            </Text>
          </View>
        </View>

        <View className="px-4">
          {/* ══ ÉTAPE 1 ══ */}
          {step === 1 && (
            <View>
              {/* Image */}
              <View className="mb-4">
                <Text className="text-foreground text-sm font-semibold mb-1.5">
                  Image de couverture
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.8}
                  className="rounded-2xl overflow-hidden border border-dashed border-border"
                  style={{ height: 180 }}
                >
                  {imageUri || event?.imageUrl ? (
                    <View className="relative flex-1">
                      <Image
                        source={{ uri: imageUri ?? event?.imageUrl ?? "" }}
                        className="flex-1"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setImageUri(null);
                          form1.setValue("imageUri", undefined);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
                      >
                        <X size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex-1 items-center justify-center gap-2 bg-muted/30">
                      <ImageIcon size={32} color="#9ca3af" />
                      <Text className="text-muted-foreground text-sm">
                        Ajouter une image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Titre */}
              <Controller
                control={form1.control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={FileText}
                    label="Titre de l'événement *"
                    placeholder="Ex: Concert Youssou N'Dour"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={form1.formState.errors.title?.message}
                  />
                )}
              />

              {/* Description */}
              <View className="mb-4">
                <Text className="text-foreground text-sm font-semibold mb-1.5">
                  Description
                </Text>
                <Controller
                  control={form1.control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      className="bg-card border border-border rounded-2xl px-4"
                      style={{ minHeight: 100 }}
                    >
                      <TextInput
                        className="flex-1 text-foreground text-sm"
                        placeholder="Décrivez votre événement..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        textAlignVertical="top"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        style={{ paddingVertical: 14 }}
                      />
                    </View>
                  )}
                />
              </View>

              {/* Catégorie */}
              <View className="mb-4">
                <Text className="text-foreground text-sm font-semibold mb-1.5">
                  Catégorie <Text className="text-destructive">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategories((v) => !v)}
                  activeOpacity={0.8}
                  className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-12 gap-3"
                >
                  <Tag size={16} color="#9ca3af" />
                  <Text className="flex-1 text-foreground text-sm">
                    {CATEGORIES.find((c) => c.value === selectedCategory)
                      ? `${CATEGORIES.find((c) => c.value === selectedCategory)!.emoji} ${CATEGORIES.find((c) => c.value === selectedCategory)!.label}`
                      : "Choisir une catégorie"}
                  </Text>
                  <ChevronDown size={16} color="#9ca3af" />
                </TouchableOpacity>
                {showCategories && (
                  <View className="bg-card border border-border rounded-2xl mt-1 overflow-hidden">
                    {CATEGORIES.map((cat, i) => (
                      <TouchableOpacity
                        key={cat.value}
                        onPress={() => {
                          form1.setValue("category", cat.value);
                          setShowCategories(false);
                        }}
                        activeOpacity={0.7}
                        className={`flex-row items-center gap-3 px-4 py-3 ${
                          i < CATEGORIES.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            selectedCategory === cat.value
                              ? "#6366f110"
                              : "transparent",
                        }}
                      >
                        <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                        <Text
                          className="flex-1 text-sm font-medium"
                          style={{
                            color:
                              selectedCategory === cat.value
                                ? "#6366f1"
                                : "#374151",
                          }}
                        >
                          {cat.label}
                        </Text>
                        {selectedCategory === cat.value && (
                          <View className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <NavButtons onNext={goNext1} />
            </View>
          )}

          {/* ══ ÉTAPE 2 ══ */}
          {step === 2 && (
            <View>
              <Controller
                control={form2.control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={MapPin}
                    label="Lieu *"
                    placeholder="Ex: Dakar Arena"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={form2.formState.errors.location?.message}
                  />
                )}
              />

              <Controller
                control={form2.control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={MapPin}
                    label="Ville"
                    placeholder="Ex: Dakar"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={form2.formState.errors.city?.message}
                  />
                )}
              />

              {/* Date début */}
              <View className="mb-4">
                <Text className="text-foreground text-sm font-semibold mb-1.5">
                  Date de début <Text className="text-destructive">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => openDatePicker("start", startDate)}
                  activeOpacity={0.8}
                  className={`flex-row items-center bg-card border rounded-2xl px-4 h-12 gap-3 ${
                    form2.formState.errors.startDate
                      ? "border-destructive"
                      : "border-border"
                  }`}
                >
                  <Calendar size={16} color="#9ca3af" />
                  <Text
                    className="flex-1 text-sm"
                    style={{ color: startDate ? "#111827" : "#9ca3af" }}
                  >
                    {startDate
                      ? formatDateTime(startDate.toISOString())
                      : "Choisir la date de début"}
                  </Text>
                  <ChevronRight size={16} color="#9ca3af" />
                </TouchableOpacity>
                {form2.formState.errors.startDate && (
                  <Text className="text-destructive text-xs mt-1">
                    {form2.formState.errors.startDate.message}
                  </Text>
                )}
              </View>

              {/* Date fin */}
              <View className="mb-4">
                <Text className="text-foreground text-sm font-semibold mb-1.5">
                  Date de fin
                </Text>
                <Controller
                  control={form2.control}
                  name="endDate"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      onPress={() => openDatePicker("end", value)}
                      activeOpacity={0.8}
                      className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-12 gap-3"
                    >
                      <Calendar size={16} color="#9ca3af" />
                      <Text
                        className="flex-1 text-sm"
                        style={{ color: value ? "#111827" : "#9ca3af" }}
                      >
                        {value
                          ? formatDateTime(value.toISOString())
                          : "Date de fin (optionnel)"}
                      </Text>
                      <ChevronRight size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                />
              </View>

              {Platform.OS === "ios" && showStartPicker && (
                <DateTimePicker
                  value={startDate ?? new Date()}
                  mode="datetime"
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    setShowStartPicker(false);
                    if (date) form2.setValue("startDate", date);
                  }}
                />
              )}

              {Platform.OS === "ios" && showEndPicker && (
                <DateTimePicker
                  value={form2.watch("endDate") ?? new Date()}
                  mode="datetime"
                  minimumDate={startDate ?? new Date()}
                  onChange={(_, date) => {
                    setShowEndPicker(false);
                    if (date) form2.setValue("endDate", date);
                  }}
                />
              )}

              <View className="flex-row items-start gap-2 bg-primary/5 border border-primary/10 rounded-2xl p-3.5 mb-4">
                <CheckCircle size={15} color="#6366f1" />
                <Text className="text-primary text-xs flex-1 leading-5">
                  La modification des dates enverra une notification à tous les
                  inscrits.
                </Text>
              </View>

              <NavButtons onBack={goBack} onNext={goNext2} />
            </View>
          )}

          {/* ══ ÉTAPE 3 ══ */}
          {step === 3 && (
            <View>
              <Controller
                control={form3.control}
                name="capacity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={Users}
                    label="Capacité *"
                    placeholder="Ex: 500"
                    keyboardType="numeric"
                    value={value ? value.toString() : ""}
                    onChangeText={(t) => onChange(parseInt(t) || 0)}
                    onBlur={onBlur}
                    error={form3.formState.errors.capacity?.message}
                  />
                )}
              />

              <View className="bg-card border border-border rounded-2xl p-4 mb-4 gap-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ticket size={16} color="#9ca3af" />
                    <Text className="text-foreground text-sm font-semibold">
                      Événement gratuit
                    </Text>
                  </View>
                  <Controller
                    control={form3.control}
                    name="isFree"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        trackColor={{ false: "#e5e7eb", true: "#a5b4fc" }}
                        thumbColor={value ? "#6366f1" : "#9ca3af"}
                      />
                    )}
                  />
                </View>

                {!isFree && (
                  <View className="pt-3 border-t border-border">
                    <Controller
                      control={form3.control}
                      name="price"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormInput
                          icon={DollarSign}
                          label="Prix (XOF) *"
                          placeholder="Ex: 5000"
                          keyboardType="numeric"
                          value={value ? value.toString() : ""}
                          onChangeText={(t) => onChange(parseFloat(t) || 0)}
                          onBlur={onBlur}
                          error={form3.formState.errors.price?.message}
                        />
                      )}
                    />
                  </View>
                )}
              </View>

              {/* Récapitulatif */}
              <View className="bg-card border border-border rounded-2xl p-4 gap-2 mb-4">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Récapitulatif des modifications
                </Text>
                <View className="flex-row items-center gap-2">
                  <FileText size={14} color="#9ca3af" />
                  <Text className="text-foreground text-sm" numberOfLines={1}>
                    {collected.title}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="#9ca3af" />
                  <Text className="text-foreground text-sm">
                    {collected.location}
                    {collected.city ? ` · ${collected.city}` : ""}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Calendar size={14} color="#9ca3af" />
                  <Text className="text-foreground text-sm">
                    {collected.startDate
                      ? formatDateTime(
                          (collected.startDate as Date).toISOString(),
                        )
                      : "—"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Tag size={14} color="#9ca3af" />
                  <Text className="text-foreground text-sm">
                    {
                      CATEGORIES.find((c) => c.value === collected.category)
                        ?.emoji
                    }{" "}
                    {
                      CATEGORIES.find((c) => c.value === collected.category)
                        ?.label
                    }
                  </Text>
                </View>
              </View>

              <NavButtons
                onBack={goBack}
                onSubmit={onSubmit}
                isPending={isPending}
                isLast
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
