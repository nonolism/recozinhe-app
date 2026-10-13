import Svg, { Ellipse, Path } from 'react-native-svg';

import { colors } from '../theme';

// Logo do ReCozinhe: um círculo aberto com uma folha verde
export default function Logo({ size = 40, color = colors.dark }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Path
        d="M14 5.5 A16 16 0 1 0 34.5 14"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={20.5} cy={16} rx={3.2} ry={6} fill={colors.green} transform="rotate(25 20.5 16)" />
    </Svg>
  );
}
