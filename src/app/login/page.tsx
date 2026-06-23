import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Acceso / Registro",
  description: "Inicia sesión o regístrate en La Yucateca para acceder a funciones exclusivas.",
};

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginClient />;
}
