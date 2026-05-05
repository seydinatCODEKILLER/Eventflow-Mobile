import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff, LucideIcon } from "lucide-react-native";

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  icon?: LucideIcon;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  isPassword = false,
  icon: Icon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? "#ef4444" : focused ? "#6366f1" : "#e5e7eb";

  const iconColor = error ? "#ef4444" : focused ? "#6366f1" : "#9ca3af";

  return (
    <View className="mb-4">
      {/* Label optionnel */}
      {label && (
        <Text className="text-sm font-semibold text-foreground mb-1.5">
          {label}
        </Text>
      )}

      <View
        className="flex-row items-center bg-card rounded-2xl overflow-hidden"
        style={{ borderWidth: 1.5, borderColor }}
      >
        {/* Icône gauche */}
        {Icon && (
          <View className="pl-4 pr-2">
            <Icon size={17} color={iconColor} />
          </View>
        )}

        <TextInput
          className="flex-1 py-4 text-foreground text-sm"
          style={{
            paddingLeft: Icon ? 4 : 16,
            paddingRight: isPassword ? 8 : 16,
          }}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            props.onBlur?.({ nativeEvent: {} } as any);
          }}
          {...props}
        />

        {/* Toggle mot de passe */}
        {isPassword && (
          <TouchableOpacity
            className="pr-4 pl-2"
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {showPassword ? (
              <EyeOff size={18} color="#9ca3af" />
            ) : (
              <Eye size={18} color="#9ca3af" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Erreur */}
      {error && (
        <Text className="text-destructive text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
};
