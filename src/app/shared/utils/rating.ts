import { RecipeRate } from '@/core/models/recipe.model';

/** Average rating (1 decimal) of a recipe, or null when it has no rates. */
export function ratingInfo(rates: RecipeRate[] | undefined) {
  if (!rates?.length) return null;
  const sum = rates.reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0);
  const average = Math.round((sum / rates.length) * 10) / 10;
  const count = rates.length;
  return {
    average,
    count,
    rounded: Math.round(average),
    label: `${count} avis`,
    ariaLabel: `Note moyenne de ${average} sur 5, basée sur ${count} avis`,
  };
}
