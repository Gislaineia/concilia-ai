import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface BrandConfig {
  nome: string;
  slogan: string;
  primary: string;
  primaryDark: string;
  iconText: string;
}

const defaultBrand: BrandConfig = {
  nome: "ConciliaAI",
  slogan: "Inteligencia Fiscal e Contabil",
  primary: "#1a5fe8",
  primaryDark: "#163473",
  iconText: "C",
};

interface BrandContextValue {
  brand: BrandConfig;
  setBrand: (b: BrandConfig) => void;
  reset: () => void;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

const STORAGE_KEY = "concilia-ai:white-label";

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<BrandConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultBrand, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return defaultBrand;
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--brand-primary", brand.primary);
    document.documentElement.style.setProperty(
      "--brand-primary-dark",
      brand.primaryDark
    );
    document.title = `${brand.nome} - ${brand.slogan}`;
  }, [brand]);

  const setBrand = (b: BrandConfig) => {
    setBrandState(b);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
    } catch {
      /* ignore */
    }
  };

  const reset = () => setBrand(defaultBrand);

  return (
    <BrandContext.Provider value={{ brand, setBrand, reset }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
