import { presetWind4 } from 'unocss';
import { trackedTheme } from '@unocss/preset-wind4/utils';

// Wind4 tracks theme dependencies in discovery order, which depends on Vite's
// module scheduling. Sort the exported dependency set before theme emission.
export function stableWind() {
  const preset = presetWind4();
  const theme = preset.preflights?.find(preflight => preflight.layer === 'theme');
  if (!theme) throw new Error('Wind4 theme preflight is missing');
  const generate = theme.getCSS;
  theme.getCSS = async context => {
    await generate(context); // Resolve safelisted and transitive theme variables first.
    const keys = [...trackedTheme].sort();
    trackedTheme.clear();
    keys.forEach(key => trackedTheme.add(key));
    return generate(context);
  };
  return preset;
}
