export const PROPERTY_TYPES = [
  { value: "apartment", label: "شقق", icon: "🏢" },
  { value: "villa", label: "فلل", icon: "🏡" },
  { value: "land", label: "أراضي", icon: "🌳" },
  { value: "shop", label: "محلات", icon: "🏪" },
  { value: "office", label: "مكاتب", icon: "🏬" },
  { value: "building", label: "عمارات", icon: "🏗️" },
] as const;

export const PURPOSE_LABELS: Record<string, string> = {
  sale: "للبيع",
  rent: "للإيجار",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  land: "أرض",
  shop: "محل",
  office: "مكتب",
  building: "عمارة",
};
