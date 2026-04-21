// src/lib/countries.ts
export interface Country {
  code: string;
  name: string;
  flag: string;
}

export async function fetchCountries(): Promise<Country[]> {
  const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flag");
  const data = await res.json();
  return data
    .map((c: { cca2: string; name: { common: string }; flag: string }) => ({
      code: c.cca2,
      name: c.name.common,
      flag: c.flag,
    }))
    .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
}

// Helper síncrono para usar con código ya cargado
export function getCountry(code: string, countries: Country[]): Country | undefined {
  return countries.find((c) => c.code === code);
}