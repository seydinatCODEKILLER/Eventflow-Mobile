import Svg, {
  Circle,
  Path,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

export const HeroIllustration = () => (
  <Svg width="280" height="220" viewBox="0 0 280 220">
    <Defs>
      <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#EEF2FF" />
        <Stop offset="1" stopColor="#E0E7FF" />
      </LinearGradient>
      <LinearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#818CF8" />
        <Stop offset="1" stopColor="#6366F1" />
      </LinearGradient>
      <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="1" stopColor="#F5F3FF" />
      </LinearGradient>
    </Defs>

    {/* Fond cercle */}
    <Circle cx="140" cy="110" r="100" fill="url(#bgGrad)" />

    {/* Lignes de grille subtiles */}
    <G opacity="0.1">
      <Path d="M55 80 L225 80" stroke="#6366F1" strokeWidth="1" />
      <Path d="M55 105 L225 105" stroke="#6366F1" strokeWidth="1" />
      <Path d="M55 130 L225 130" stroke="#6366F1" strokeWidth="1" />
      <Path d="M55 155 L225 155" stroke="#6366F1" strokeWidth="1" />
    </G>

    {/* ── Card principale — Feed d'events ── */}
    <Rect x="40" y="55" width="140" height="110" rx="14" fill="url(#cardGrad)"
      opacity="0.97"
    />

    {/* Card event 1 — active */}
    <Rect x="52" y="68" width="116" height="38" rx="8" fill="#6366F1" opacity="0.9" />
    {/* Image placeholder event */}
    <Rect x="52" y="68" width="38" height="38" rx="8" fill="#4F46E5" />
    {/* Icone concert */}
    <Circle cx="71" cy="82" r="6" fill="#818CF8" />
    <Path d="M65 91 Q71 87 77 91" stroke="#C7D2FE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <Path d="M63 94 Q71 89 79 94" stroke="#C7D2FE" strokeWidth="1" fill="none" strokeLinecap="round" />
    {/* Texte event 1 */}
    <Rect x="97" y="74" width="60" height="5" rx="2.5" fill="#C7D2FE" opacity="0.9" />
    <Rect x="97" y="83" width="42" height="4" rx="2" fill="#E0E7FF" opacity="0.7" />
    <Rect x="97" y="91" width="50" height="4" rx="2" fill="#E0E7FF" opacity="0.6" />
    {/* Badge places */}
    <Rect x="97" y="98" width="28" height="5" rx="2.5" fill="#A5B4FC" opacity="0.8" />

    {/* Card event 2 */}
    <Rect x="52" y="114" width="116" height="32" rx="8" fill="#F5F3FF" />
    <Rect x="52" y="114" width="32" height="32" rx="8" fill="#EDE9FE" />
    {/* Icone sport */}
    <Circle cx="68" cy="130" r="7" fill="#8B5CF6" opacity="0.8" />
    <Path d="M64 130 Q68 126 72 130 Q68 134 64 130Z" fill="#DDD6FE" />
    {/* Texte event 2 */}
    <Rect x="91" y="120" width="55" height="4" rx="2" fill="#7C3AED" opacity="0.5" />
    <Rect x="91" y="128" width="40" height="3.5" rx="1.75" fill="#A78BFA" opacity="0.4" />
    <Rect x="91" y="136" width="48" height="3.5" rx="1.75" fill="#A78BFA" opacity="0.3" />

    {/* Card event 3 (partielle en bas) */}
    <Rect x="52" y="152" width="116" height="8" rx="4" fill="#EDE9FE" opacity="0.6" />

    {/* Bouton S'inscrire flottant */}
    <Rect x="155" y="72" width="50" height="18" rx="9" fill="#6366F1" />
    <Rect x="157" y="74" width="46" height="14" rx="7" fill="#818CF8" opacity="0.5" />
    <SvgText
      x="180"
      y="84"
      fontSize="6"
      fill="white"
      fontWeight="bold"
      textAnchor="middle"
    >
      Inscrire
    </SvgText>

    {/* ── Card ticket QR ── */}
    <Rect x="190" y="90" width="60" height="65" rx="10" fill="#FFFFFF"
      opacity="0.95"
    />
    {/* Header ticket */}
    <Rect x="190" y="90" width="60" height="18" rx="10" fill="#6366F1" />
    <Rect x="190" y="98" width="60" height="10" fill="#6366F1" />
    <SvgText x="220" y="103" fontSize="5.5" fill="white" fontWeight="bold" textAnchor="middle">
      MON TICKET
    </SvgText>
    {/* QR code simulé */}
    <Rect x="203" y="114" width="34" height="34" rx="3" fill="#F5F3FF" />
    {/* Pixels QR */}
    <Rect x="206" y="117" width="6" height="6" rx="1" fill="#4F46E5" />
    <Rect x="214" y="117" width="3" height="3" rx="0.5" fill="#4F46E5" />
    <Rect x="219" y="117" width="3" height="3" rx="0.5" fill="#4F46E5" />
    <Rect x="224" y="117" width="6" height="6" rx="1" fill="#4F46E5" />
    <Rect x="206" y="125" width="3" height="3" rx="0.5" fill="#4F46E5" />
    <Rect x="211" y="123" width="6" height="6" rx="1" fill="#4F46E5" />
    <Rect x="219" y="125" width="3" height="3" rx="0.5" fill="#4F46E5" />
    <Rect x="224" y="123" width="3" height="6" rx="0.5" fill="#4F46E5" />
    <Rect x="206" y="131" width="6" height="6" rx="1" fill="#4F46E5" />
    <Rect x="214" y="133" width="3" height="3" rx="0.5" fill="#4F46E5" />
    <Rect x="219" y="131" width="6" height="3" rx="0.5" fill="#4F46E5" />
    <Rect x="224" y="133" width="6" height="6" rx="1" fill="#4F46E5" />
    {/* Tirets séparateur ticket */}
    <Path
      d="M196 112 L224 112"
      stroke="#E0E7FF"
      strokeWidth="1"
      strokeDasharray="3,2"
    />

    {/* ── Notification badge ── */}
    <Rect x="42" y="42" width="80" height="22" rx="11" fill="#FFFFFF" opacity="0.95" />
    <Circle cx="57" cy="53" r="7" fill="#6366F1" opacity="0.15" />
    <Circle cx="57" cy="53" r="4" fill="#6366F1" />
    <Rect x="67" y="49" width="45" height="3.5" rx="1.75" fill="#6366F1" opacity="0.7" />
    <Rect x="67" y="55" width="30" height="3" rx="1.5" fill="#9CA3AF" opacity="0.5" />
    {/* Badge rouge */}
    <Circle cx="116" cy="46" r="5" fill="#EF4444" />
    <SvgText x="116" y="49" fontSize="5" fill="white" fontWeight="bold" textAnchor="middle">
      3
    </SvgText>

    {/* ── Éléments décoratifs ── */}
    {/* Étoile 1 */}
    <G opacity="0.7">
      <Path
        d="M228 48 L229.5 44 L231 48 L235 48 L232 50.5 L233 54.5 L229.5 52 L226 54.5 L227 50.5 L224 48Z"
        fill="#FBBF24"
      />
    </G>
    {/* Étoile 2 */}
    <G opacity="0.4">
      <Path
        d="M42 165 L43 162 L44 165 L47 165 L44.5 167 L45.5 170 L43 168 L40.5 170 L41.5 167 L39 165Z"
        fill="#818CF8"
      />
    </G>
    {/* Confettis */}
    <Rect x="170" y="48" width="5" height="5" rx="1" fill="#F472B6" opacity="0.6" transform="rotate(20, 172, 50)" />
    <Rect x="55" y="170" width="4" height="4" rx="1" fill="#34D399" opacity="0.5" transform="rotate(35, 57, 172)" />
    <Circle cx="240" cy="140" r="4" fill="#FCD34D" opacity="0.5" />
    <Circle cx="38" cy="130" r="3" fill="#6366F1" opacity="0.3" />

    {/* Badge vérifié */}
    <Circle cx="245" cy="75" r="11" fill="#6366F1" opacity="0.9" />
    <Path
      d="M240 75 L244 79 L250 71"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);