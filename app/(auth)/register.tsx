import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react-native";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  Step1FormValues,
  Step2FormValues,
  Step3FormValues,
  RegisterFormValues,
} from "@/src/lib/validators/auth.schema";
import { useRegister } from "@/src/lib/hooks/use-auth";
import { FormInput } from "@/src/components/ui/FormInput";

// ── Barre de progression ─────────────────────────────────────
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

// ── Barre de force mot de passe ──────────────────────────────
const StrengthBar = ({ password }: { password: string }) => {
  const getStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ["", "Faible", "Moyen", "Bon", "Excellent"];
  const colors = ["", "#ef4444", "#f97316", "#6366f1", "#22c55e"];
  if (!password) return null;
  return (
    <View className="mt-1 mb-3 gap-1">
      <View className="flex-row gap-1">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor: i <= strength ? colors[strength] : "#e5e7eb",
            }}
          />
        ))}
      </View>
      <Text className="text-xs" style={{ color: colors[strength] }}>
        {labels[strength]}
      </Text>
    </View>
  );
};

const STEPS = ["Identité", "Contact", "Sécurité"];

const stepTitles = [
  { title: "Qui êtes-vous ?", sub: "Commençons par faire connaissance" },
  { title: "Vos coordonnées", sub: "Comment vous contacter ?" },
  { title: "Sécurisez votre compte", sub: "Choisissez un mot de passe fort" },
];

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [collected, setCollected] = useState<Partial<RegisterFormValues>>({});
  const { mutate: register, isPending } = useRegister();

  const form1 = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: { fullName: "" },
  });

  const form2 = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: { email: "", phone: "" },
  });

  const form3 = useForm<Step3FormValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = form3.watch("password", "");

  const goNext1 = form1.handleSubmit((v) => {
    setCollected((p) => ({ ...p, ...v }));
    setStep(2);
  });

  const goNext2 = form2.handleSubmit((v) => {
    setCollected((p) => ({ ...p, ...v }));
    setStep(3);
  });

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = form3.handleSubmit(({ confirmPassword, ...v }) => {
    register({
      fullName: collected.fullName!,
      email: collected.email!,
      phone: collected.phone,
      password: v.password,
    });
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View className="px-6 pt-14 pb-6">
          {/* Top row */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-xs font-bold">{step}</Text>
              </View>
              <Text className="text-muted-foreground text-sm font-medium">
                sur {STEPS.length} · {STEPS[step - 1]}
              </Text>
            </View>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-primary text-sm font-semibold">
                  Connexion
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Progression */}
          <StepProgress current={step} total={STEPS.length} />

          {/* Logo */}
          <View className="items-center mt-8 mb-2">
            <View className="w-14 h-14 bg-primary rounded-2xl items-center justify-center mb-3">
              <Text className="text-white font-bold text-2xl">E</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">
              Event<Text className="text-primary">Flow</Text>
            </Text>
          </View>

          {/* Titre étape */}
          <View className="items-center mt-4">
            <Text className="text-xl font-bold text-foreground text-center">
              {stepTitles[step - 1].title}
            </Text>
            <Text className="text-muted-foreground text-sm text-center mt-1">
              {stepTitles[step - 1].sub}
            </Text>
          </View>
        </View>

        {/* ── Formulaire ── */}
        <View className="flex-1 px-6 pb-10">

          {/* ══ ÉTAPE 1 ══ */}
          {step === 1 && (
            <View>
              <Controller
                control={form1.control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={User}
                    placeholder="Nom complet"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={form1.formState.errors.fullName?.message}
                  />
                )}
              />

              <View className="flex-row items-start gap-2 bg-primary/5 border border-primary/10 rounded-2xl p-3.5 mb-5">
                <CheckCircle size={15} color="#6366f1" />
                <Text className="text-primary text-xs flex-1 leading-5">
                  Utilisez votre vrai nom pour que les organisateurs puissent
                  vous identifier.
                </Text>
              </View>

              <TouchableOpacity
                onPress={goNext1}
                activeOpacity={0.85}
                className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
                style={{
                  backgroundColor: "#6366f1",
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text className="text-white font-bold text-sm">Continuer</Text>
                <ArrowRight size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* ══ ÉTAPE 2 ══ */}
          {step === 2 && (
            <View>
              <Controller
                control={form2.control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={Mail}
                    placeholder="Adresse email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={form2.formState.errors.email?.message}
                  />
                )}
              />

              <Controller
                control={form2.control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={Phone}
                    placeholder="+221771234567 (optionnel)"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={form2.formState.errors.phone?.message}
                  />
                )}
              />

              <View className="flex-row items-start gap-2 bg-primary/5 border border-primary/10 rounded-2xl p-3.5 mb-5">
                <CheckCircle size={15} color="#6366f1" />
                <Text className="text-primary text-xs flex-1 leading-5">
                  Un lien de vérification sera envoyé à votre email pour activer
                  votre compte.
                </Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={goBack}
                  activeOpacity={0.8}
                  className="items-center justify-center bg-card border border-border rounded-2xl px-5 py-4"
                >
                  <ArrowLeft size={16} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goNext2}
                  activeOpacity={0.85}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4"
                  style={{
                    backgroundColor: "#6366f1",
                    shadowColor: "#6366f1",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white font-bold text-sm">
                    Continuer
                  </Text>
                  <ArrowRight size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ══ ÉTAPE 3 ══ */}
          {step === 3 && (
            <View>
              <Controller
                control={form3.control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={Lock}
                    placeholder="Mot de passe"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={form3.formState.errors.password?.message}
                  />
                )}
              />

              <StrengthBar password={passwordValue} />

              <Controller
                control={form3.control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    icon={Lock}
                    placeholder="Confirmer le mot de passe"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={form3.formState.errors.confirmPassword?.message}
                  />
                )}
              />

              {/* Récapitulatif */}
              <View className="bg-card border border-border rounded-2xl p-4 gap-2 mb-5">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Récapitulatif
                </Text>
                <View className="flex-row items-center gap-2">
                  <User size={14} color="#9ca3af" />
                  <Text className="text-foreground text-sm">
                    {collected.fullName}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Mail size={14} color="#9ca3af" />
                  <Text className="text-foreground text-sm">
                    {collected.email}
                  </Text>
                </View>
                {collected.phone ? (
                  <View className="flex-row items-center gap-2">
                    <Phone size={14} color="#9ca3af" />
                    <Text className="text-foreground text-sm">
                      {collected.phone}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={goBack}
                  activeOpacity={0.8}
                  className="items-center justify-center bg-card border border-border rounded-2xl px-5 py-4"
                >
                  <ArrowLeft size={16} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onSubmit}
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
                        Créer mon compte
                      </Text>
                      <CheckCircle size={16} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Lien connexion */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-muted-foreground text-sm">
              Déjà un compte ?{" "}
            </Text>
            <Link href="/(auth)/login">
              <Text className="text-primary font-semibold text-sm">
                Se connecter
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
