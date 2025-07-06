// pages/control-de-cuentas.tsx
import { useAuth } from "@/contexts/AuthContext";

export default function ControlCuentasPage() {
    const { hasPermission } = useAuth();

    if (!hasPermission('view_control_cuentas')) {
        return <div className="text-white p-6">No tienes permiso para ver esta página.</div>;
    }

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold drop-shadow-lg">Control de Cuentas (en construcción)</h1>
            <p className="mt-4 text-gray-300">
                Esta sección estará reservada para la administración de alto nivel.
            </p>
        </div>
    );
}