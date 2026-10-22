/** Tasa mensual equivalente a una tasa efectiva anual (en %) */
export const monthlyRate = (eaPercent: number) => Math.pow(1 + eaPercent / 100, 1 / 12) - 1

/** Tasa diaria equivalente a una tasa efectiva anual (en %) */
export const dailyRate = (eaPercent: number) => Math.pow(1 + eaPercent / 100, 1 / 365) - 1
