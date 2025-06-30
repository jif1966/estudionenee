import { useEffect, useState } from "react";

const frases = [
  "Diseñá con pasión, entregá con precisión.",
  "Cada mueble cuenta una historia.",
  "Tu trabajo es tu firma, hacelo con excelencia.",
  "No hay progreso sin compromiso.",
  "Hoy no te motivo, laburá y no seas vago/a.",
];

export default function FraseMotivadora() {
  const [frase, setFrase] = useState("");

  useEffect(() => {
    const index = new Date().getDate() % frases.length;
    setFrase(frases[index]);
  }, []);

  return (
    <div className="mt-4 text-center italic text-sm text-gray-700">
      “{frase}”
    </div>
  );
}
